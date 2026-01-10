import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { image } = body;

    // Input validation
    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid image data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Size limit: 10MB
    if (image.length > 10485760) {
      return new Response(
        JSON.stringify({ error: 'Image size exceeds 10MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch all equipment suppliers from the database
    const { data: suppliers, error: suppliersError } = await supabaseClient
      .from('equipment_suppliers')
      .select('*');

    if (suppliersError) {
      console.error("Error fetching suppliers:", suppliersError);
    }

    // Create a list of known manufacturers for the AI prompt
    const manufacturersList = suppliers?.map(s => s.name).join(', ') || '';
    const categoriesList = [...new Set(suppliers?.map(s => s.category) || [])].join(', ');

    console.log("Analyzing equipment image with AI...");
    console.log("Known categories:", categoriesList);

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
            content: `You are an expert in oil and gas industry equipment identification. You have access to a database of equipment suppliers in these categories: ${categoriesList}.

Known manufacturers in our database: ${manufacturersList}

Analyze images of industrial equipment and identify:
1. Equipment category (must be one of: ${categoriesList})
2. Specific equipment type (e.g., ball valve, gate valve, control valve, centrifugal pump, pressure vessel, etc.)
3. Manufacturer - Try to match to one of our known manufacturers if visible
4. Material composition if visible (stainless steel, carbon steel, brass, etc.)
5. Size/specifications if visible
6. Key identifying features

IMPORTANT: When identifying the manufacturer, try to match it exactly to one of these known names: ${manufacturersList}

Respond in JSON format with:
{
  "category": "Valves|Pumps|Tanks|Vessels|Automation",
  "type": "specific equipment type",
  "manufacturer": "exact manufacturer name from our database or 'Unknown'",
  "material": "material type if visible",
  "size": "size/specs if visible",
  "confidence": 0-100,
  "features": ["feature1", "feature2"],
  "description": "brief description of what was identified",
  "searchTerms": ["keyword1", "keyword2"]
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this oil and gas equipment. Match the manufacturer to our database if possible:"
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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service payment required." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
      manufacturer: "Unknown",
      confidence: 50,
      features: [],
      searchTerms: []
    };

    // Find matching suppliers from the database
    let matchedSuppliers = [];
    
    if (suppliers && suppliers.length > 0) {
      // First, try to match by manufacturer name
      if (identification.manufacturer && identification.manufacturer !== "Unknown") {
        const manufacturerMatch = suppliers.filter(s => 
          s.name.toLowerCase().includes(identification.manufacturer.toLowerCase()) ||
          identification.manufacturer.toLowerCase().includes(s.name.toLowerCase())
        );
        matchedSuppliers = manufacturerMatch;
      }
      
      // If no manufacturer match, filter by category
      if (matchedSuppliers.length === 0 && identification.category) {
        matchedSuppliers = suppliers.filter(s => 
          s.category.toLowerCase() === identification.category.toLowerCase()
        );
      }
      
      // Limit to top 5 results
      matchedSuppliers = matchedSuppliers.slice(0, 5);
    }

    console.log("Matched suppliers:", matchedSuppliers.length);

    return new Response(
      JSON.stringify({
        identification,
        matchedSuppliers
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in identify-material:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        identification: {
          category: "Unknown",
          confidence: 0
        },
        matchedSuppliers: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
