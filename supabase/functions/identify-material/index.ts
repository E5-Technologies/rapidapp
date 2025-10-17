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
    const { image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing material image with AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert in oil and gas industry materials. Analyze images of industrial equipment and identify:
1. Type of equipment (valve, pump, piping, instrumentation, electrical, vessel)
2. Specific type (e.g., ball valve, gate valve, control valve, centrifugal pump, etc.)
3. Visible manufacturer or brand if any
4. Material composition if visible (stainless steel, carbon steel, brass, etc.)
5. Approximate size class and pressure rating if visible
6. Key identifying features

Respond in JSON format with:
{
  "category": "Valves|Pumps|Piping|Instrumentation|Electrical|Vessels",
  "type": "specific type",
  "manufacturer": "brand name or unknown",
  "material": "material type",
  "confidence": 0-100,
  "features": ["feature1", "feature2"],
  "searchTerms": ["keyword1", "keyword2"]
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this oil and gas material/equipment:"
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("AI response:", aiResponse);
    
    // Parse the JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const identification = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      category: "Unknown",
      type: "Unknown",
      manufacturer: "unknown",
      confidence: 50,
      features: [],
      searchTerms: []
    };

    return new Response(
      JSON.stringify(identification),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in identify-material:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        category: "Unknown",
        confidence: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
