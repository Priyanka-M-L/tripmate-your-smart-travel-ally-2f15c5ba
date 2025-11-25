import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { destination, duration, budget, interests } = await req.json();
    
    console.log('Generating itinerary for:', { destination, duration, budget, interests });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert travel planner AI. Generate detailed, realistic, and exciting travel itineraries based on user preferences. 
    
    Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
    {
      "itinerary": [
        {
          "day": 1,
          "items": [
            {
              "time": "9:00 AM",
              "activity": "Visit the Eiffel Tower",
              "location": "Champ de Mars, Paris",
              "description": "Start your day at this iconic landmark. Book tickets in advance to skip the line.",
              "estimatedCost": 2000,
              "transportMode": "metro",
              "transportDistance": 5.2,
              "carbonFootprint": 0.3
            }
          ]
        }
      ]
    }
    
    Guidelines:
    - Create realistic daily schedules with 5-8 activities per day including meals
    - Include specific times, locations, and helpful descriptions
    - Add estimatedCost in INR (Indian Rupees) for each activity (tickets, meals, shopping, etc.)
    - Specify transportMode: walking, metro, bus, taxi, train, bike
    - Add transportDistance in kilometers between activities
    - Calculate carbonFootprint in kg CO2 (walking/bike: 0, metro/bus: 0.05/km, taxi/car: 0.2/km, train: 0.04/km)
    - Consider travel time between locations
    - Balance popular attractions with hidden gems
    - Include breakfast, lunch, dinner, and snacks
    - Stay within the specified budget
    - Tailor activities to the user's interests`;

    const userPrompt = `Create a ${duration}-day travel itinerary for ${destination}.
Budget: ₹${budget} INR (Indian Rupees)
Interests: ${interests || 'General tourism, culture, food'}

Please provide a day-by-day breakdown with specific activities, times, and locations. All costs should be in INR.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI raw response:', aiResponse);

    // Parse the JSON response
    let itineraryData;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      itineraryData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse:', aiResponse);
      throw new Error('Failed to parse AI response');
    }

    return new Response(JSON.stringify(itineraryData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-itinerary:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
