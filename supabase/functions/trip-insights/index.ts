import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, startDate, interests } = await req.json();
    console.log("Fetching insights for:", { destination, startDate, interests });

    if (!destination) {
      throw new Error("Destination is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch weather data from Open-Meteo (free API, no key needed)
    let weatherData = null;
    try {
      // Get coordinates for the destination using geocoding
      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results && geocodeData.results.length > 0) {
        const { latitude, longitude, name } = geocodeData.results[0];
        
        // Get weather forecast
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=auto&forecast_days=7`
        );
        weatherData = await weatherResponse.json();
        weatherData.locationName = name;
      }
    } catch (error) {
      console.error("Weather fetch error:", error);
    }

    // Generate AI-powered insights
    const systemPrompt = `You are a travel intelligence assistant. Provide accurate, helpful insights for travelers planning trips.

Generate insights for: ${destination}
Start date: ${startDate || "Not specified"}
Interests: ${interests || "General tourism"}

Weather data: ${weatherData ? JSON.stringify(weatherData.daily) : "Not available"}

Provide the following insights in a structured JSON format:

{
  "crowdLevel": "low" | "moderate" | "high" | "very-high",
  "crowdDescription": "Brief explanation of crowd levels (20-30 words)",
  "bestTimeToVisit": "Specific recommendation like 'Early morning (6-9 AM)' or 'Weekday afternoons'",
  "bestTimeReason": "Brief reason (15-25 words)",
  "placeStatus": "Usually open" | "Check hours" | "Seasonal" | "24/7",
  "placeHours": "Typical hours like '9 AM - 6 PM' or 'Varies by location'",
  "weatherSummary": "Brief weather description based on data or typical patterns (20-30 words)",
  "recommendations": ["Tip 1 (10-15 words)", "Tip 2 (10-15 words)", "Tip 3 (10-15 words)"]
}`;

    console.log("Calling Lovable AI...");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate travel insights for ${destination}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse JSON from AI response
    let insights;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiResponse);
    } catch (e) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Invalid AI response format");
    }

    console.log("Insights generated successfully");
    return new Response(
      JSON.stringify({ 
        insights,
        weather: weatherData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in trip-insights function:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
