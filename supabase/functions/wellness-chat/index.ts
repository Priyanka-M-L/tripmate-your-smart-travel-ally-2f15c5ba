import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    console.log("Wellness chat request:", { message, userId });

    if (!message || !userId) {
      throw new Error("Message and userId are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user's wellness profile
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: wellnessProfile, error: profileError } = await supabase
      .from("wellness_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching wellness profile:", profileError);
    }

    // Build context from wellness profile
    let wellnessContext = "The user has not yet configured their wellness profile.";
    if (wellnessProfile) {
      const conditions = [];
      const preferences = [];

      // Collect conditions with severity
      const conditionFields = [
        { key: "motion_sickness", label: "Motion Sickness" },
        { key: "fear_of_flights", label: "Fear of Flying" },
        { key: "anxiety", label: "Anxiety" },
        { key: "vomiting_tendency", label: "Vomiting Tendency" },
        { key: "heart_sensitivity", label: "Heart Sensitivity" },
        { key: "claustrophobia", label: "Claustrophobia" },
        { key: "altitude_sensitivity", label: "High-Altitude Sensitivity" },
        { key: "mood_issues", label: "Mood Issues" },
        { key: "mental_wellness", label: "Mental Wellness Concerns" }
      ];

      for (const field of conditionFields) {
        const severity = wellnessProfile[field.key];
        if (severity && severity !== "none") {
          conditions.push(`${field.label}: ${severity}`);
        }
      }

      // Collect preferences
      const preferenceFields = [
        { key: "avoid_flights", label: "Avoid Flights" },
        { key: "prefer_window_seat", label: "Prefer Window Seat" },
        { key: "prefer_aisle_seat", label: "Prefer Aisle Seat" },
        { key: "need_frequent_breaks", label: "Need Frequent Breaks" },
        { key: "need_hydration_reminders", label: "Need Hydration Reminders" },
        { key: "need_calming_notifications", label: "Need Calming Notifications" },
        { key: "need_medical_alerts", label: "Need Medical Alert Options" },
        { key: "need_customized_destinations", label: "Need Customized Destination Suggestions" }
      ];

      for (const field of preferenceFields) {
        if (wellnessProfile[field.key] === true) {
          preferences.push(field.label);
        }
      }

      wellnessContext = `User's Wellness Profile:
${conditions.length > 0 ? `Health Sensitivities: ${conditions.join(", ")}` : "No health sensitivities reported."}
${preferences.length > 0 ? `Travel Preferences: ${preferences.join(", ")}` : "No specific preferences set."}`;
    }

    const systemPrompt = `You are a compassionate and knowledgeable travel wellness assistant. Your role is to:

1. Provide emotional support and understanding for travel-related anxieties and concerns
2. Offer practical travel advice tailored to the user's health sensitivities and preferences
3. Suggest coping strategies, breathing exercises, and comfort tips
4. Recommend destinations and travel styles that match the user's wellness needs
5. Be empathetic, encouraging, and non-judgmental

${wellnessContext}

Always be warm, supportive, and understanding. Keep responses concise but helpful. If suggesting medical advice, remind users to consult healthcare professionals for serious concerns.`;

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
          { role: "user", content: message }
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
      
      throw new Error(`Lovable AI error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log("AI response generated successfully");
    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in wellness-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
