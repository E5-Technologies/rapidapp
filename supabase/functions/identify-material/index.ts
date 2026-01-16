import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Equipment catalog data for finding catalog URLs
const equipmentCatalog = [
  { name: "Balon Corporation", category: "Valves", catalogUrls: ["https://www.balon.com/downloads/CompleteCatalog.pdf"] },
  { name: "Bray International", category: "Valves", catalogUrls: ["https://www.bray.com/products"] },
  { name: "Kimray", category: "Valves", catalogUrls: ["https://kimray.com/products"] },
  { name: "Flowserve", category: "Valves", catalogUrls: ["https://www.flowserve.com/products/products-catalog/valves"] },
  { name: "Fisher", category: "Valves", catalogUrls: ["https://www.emerson.com/en-us/automation/fisher"] },
  { name: "Cameron", category: "Valves", catalogUrls: ["https://www.slb.com/valves"] },
  { name: "Velan", category: "Valves", catalogUrls: ["https://www.velan.com/products"] },
  { name: "Crane", category: "Valves", catalogUrls: ["https://www.craneco.com/industrial-valves"] },
  { name: "Baker Hughes", category: "Valves", catalogUrls: ["https://www.bakerhughes.com/products/valves"] },
  { name: "Swagelok", category: "Valves", catalogUrls: ["https://www.swagelok.com/en/catalog/Products/Valve"] },
  { name: "Emerson", category: "Automation", catalogUrls: ["https://www.emerson.com/en-us/automation"] },
  { name: "Siemens", category: "Automation", catalogUrls: ["https://www.siemens.com/products"] },
  { name: "ABB", category: "Automation", catalogUrls: ["https://new.abb.com/process-automation"] },
  { name: "Goulds Pumps", category: "Pumps", catalogUrls: ["https://www.gouldspumps.com/products"] },
  { name: "Sulzer", category: "Pumps", catalogUrls: ["https://www.sulzer.com/en/products/pumps"] },
  { name: "KSB", category: "Pumps", catalogUrls: ["https://www.ksb.com/products"] },
  { name: "Grundfos", category: "Pumps", catalogUrls: ["https://product-selection.grundfos.com/products"] },
];

// Find catalog URL for a manufacturer
const findCatalogUrl = (manufacturerName: string): string | null => {
  const normalizedName = manufacturerName.toLowerCase().trim();
  const manufacturer = equipmentCatalog.find(m => 
    normalizedName.includes(m.name.toLowerCase()) || 
    m.name.toLowerCase().includes(normalizedName)
  );
  return manufacturer?.catalogUrls[0] || null;
};

// Compare captured image with database material images using AI
async function compareWithDatabaseImages(
  capturedImage: string, 
  materials: any[],
  initialIdentification: any,
  apiKey: string
): Promise<{ matchedMaterial: any | null, confidence: number, matchDetails: string }> {
  if (materials.length === 0) {
    return { matchedMaterial: null, confidence: 0, matchDetails: 'No materials in database to compare' };
  }

  try {
    // Filter materials that have images and are in similar category
    const materialsWithImages = materials.filter(m => 
      m.image_url && 
      (m.category?.toLowerCase() === initialIdentification.category?.toLowerCase() ||
       initialIdentification.category === 'Unknown')
    ).slice(0, 8); // Limit to 8 for API efficiency

    if (materialsWithImages.length === 0) {
      console.log('No materials with images found in matching category');
      return { matchedMaterial: null, confidence: 0, matchDetails: 'No matching materials with images' };
    }

    console.log(`Comparing captured image against ${materialsWithImages.length} database materials...`);

    // Create comparison prompt with database images
    const imageContent: any[] = [
      {
        type: "text",
        text: `You are analyzing industrial equipment images to find an exact or closest match.

The captured equipment appears to be:
- Category: ${initialIdentification.category}
- Type: ${initialIdentification.type}
- Manufacturer: ${initialIdentification.manufacturer}

I have a captured image (IMAGE 1) and ${materialsWithImages.length} product images from our database.
Compare the captured image to each database product image and find the BEST MATCH.

Database products:
${materialsWithImages.map((m, i) => `${i + 2}. ${m.title} - ${m.product_name} (${m.manufacturer?.name || 'Unknown manufacturer'})`).join('\n')}

Analyze visual features like:
- Shape and form factor
- Size and proportions
- Color and material finish
- Brand markings and labels
- Valve/pump type and design
- Connection types

Respond in JSON format:
{
  "bestMatchIndex": <1-based index of best matching database product (2-${materialsWithImages.length + 1}), or 0 if no good match>,
  "confidence": <0-100 confidence score>,
  "matchDetails": "explanation of why this is the best match",
  "isExactMatch": <true if this appears to be the exact same product, false if similar>
}`
      },
      {
        type: "image_url",
        image_url: { url: capturedImage }
      }
    ];

    // Add database material images
    for (const material of materialsWithImages) {
      imageContent.push({
        type: "image_url",
        image_url: { url: material.image_url }
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: imageContent }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI image comparison failed:', response.status);
      return { matchedMaterial: null, confidence: 0, matchDetails: 'AI comparison failed' };
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI comparison response:', aiResponse);
    
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      const matchIndex = result.bestMatchIndex;
      
      // Index 2 in the prompt = index 0 in materialsWithImages array
      if (matchIndex >= 2 && matchIndex <= materialsWithImages.length + 1) {
        const matchedMaterial = materialsWithImages[matchIndex - 2];
        return {
          matchedMaterial,
          confidence: result.confidence || 70,
          matchDetails: result.matchDetails || 'Match found in database'
        };
      }
    }

    return { matchedMaterial: null, confidence: 0, matchDetails: 'No matching product found in database' };
  } catch (error) {
    console.error('Error comparing with database images:', error);
    return { matchedMaterial: null, confidence: 0, matchDetails: 'Comparison error' };
  }
}

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

    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid image data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Fetch materials with images from database
    const { data: allMaterials, error: materialsError } = await supabaseClient
      .from('materials')
      .select(`
        id, title, product_name, category, image_url, model_number, serial_number,
        manufacturer_id, rating, datasheet_url,
        manufacturer:manufacturers(id, name, logo_url)
      `)
      .not('image_url', 'is', null)
      .limit(500);

    if (materialsError) {
      console.error("Error fetching materials:", materialsError);
    }

    const materials = allMaterials || [];
    console.log(`Loaded ${materials.length} materials with images from database`);

    // Get unique categories from materials
    const categories = [...new Set(materials.map(m => m.category))].filter(Boolean);
    console.log("Available categories:", categories.join(', '));
    
    // Extract manufacturer names (handle array result from join)
    const getManufacturerName = (m: any) => {
      if (Array.isArray(m.manufacturer)) {
        return m.manufacturer[0]?.name;
      }
      return m.manufacturer?.name;
    };

    // Fetch equipment suppliers
    const { data: suppliers } = await supabaseClient
      .from('equipment_suppliers')
      .select('*');

    const manufacturersList = [...new Set(materials.map(m => getManufacturerName(m)).filter(Boolean))].join(', ');

    console.log("Step 1: Initial AI identification of equipment...");

    // Step 1: Initial AI identification
    const identifyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are an expert in oil and gas industry equipment identification.

Available categories in our database: ${categories.join(', ')}
Known manufacturers in our database: ${manufacturersList}

Analyze the image and identify:
1. Equipment category (MUST be one of: ${categories.join(', ')})
2. Specific equipment type (e.g., ball valve, gate valve, control valve, centrifugal pump, pressure gauge)
3. Manufacturer - Match to known manufacturers if visible
4. Material if visible (stainless steel, carbon steel, brass)
5. Key identifying features

Look carefully for brand logos, model numbers, and distinctive design elements.

Respond in JSON format:
{
  "category": "one of the categories above",
  "type": "specific equipment type",
  "manufacturer": "manufacturer name or 'Unknown'",
  "material": "material type if visible",
  "confidence": 0-100,
  "features": ["feature1", "feature2"],
  "description": "brief description",
  "searchTerms": ["keyword1", "keyword2"],
  "modelNumber": "model/part number if visible"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this industrial equipment. Look for brand markings and model numbers:"
              },
              {
                type: "image_url",
                image_url: { url: image }
              }
            ]
          }
        ],
      }),
    });

    if (!identifyResponse.ok) {
      if (identifyResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI analysis failed: ${identifyResponse.status}`);
    }

    const identifyData = await identifyResponse.json();
    const aiResponse = identifyData.choices[0].message.content;
    
    console.log("AI identification response:", aiResponse);
    
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const identification = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      category: "Unknown",
      type: "Unknown",
      manufacturer: "Unknown",
      confidence: 50,
      features: [],
      searchTerms: []
    };

    console.log("Step 2: Comparing captured image against database materials...");

    // Step 2: Compare with database images
    const dbMatchResult = await compareWithDatabaseImages(
      image,
      materials,
      identification,
      LOVABLE_API_KEY
    );

    console.log("Database match result:", dbMatchResult.matchedMaterial?.title || 'No match', dbMatchResult.confidence);

    // Step 3: Find similar materials based on search terms
    let similarMaterials: any[] = [];
    
    if (dbMatchResult.matchedMaterial) {
      // Get materials similar to the matched one
      const matchedCategory = dbMatchResult.matchedMaterial.category;
      const matchedManufacturer = getManufacturerName(dbMatchResult.matchedMaterial);
      
      similarMaterials = materials
        .filter(m => 
          m.id !== dbMatchResult.matchedMaterial.id &&
          (m.category === matchedCategory || getManufacturerName(m) === matchedManufacturer)
        )
        .slice(0, 10);
    } else if (identification.category !== 'Unknown') {
      // Get materials from the same category
      similarMaterials = materials
        .filter(m => m.category?.toLowerCase() === identification.category?.toLowerCase())
        .slice(0, 10);
    }

    // Find matching suppliers
    let matchedSuppliers: any[] = [];
    if (suppliers && suppliers.length > 0) {
      if (identification.manufacturer && identification.manufacturer !== "Unknown") {
        matchedSuppliers = suppliers.filter(s => 
          s.name.toLowerCase().includes(identification.manufacturer.toLowerCase()) ||
          identification.manufacturer.toLowerCase().includes(s.name.toLowerCase())
        );
      }
      
      if (matchedSuppliers.length === 0 && identification.category) {
        matchedSuppliers = suppliers.filter(s => 
          s.category.toLowerCase() === identification.category.toLowerCase()
        );
      }
      
      matchedSuppliers = matchedSuppliers.slice(0, 5);
    }

    const catalogUrl = findCatalogUrl(identification.manufacturer);

    console.log("Identification complete.");
    console.log("Database match:", dbMatchResult.matchedMaterial ? 'Yes' : 'No');
    console.log("Similar materials found:", similarMaterials.length);

    return new Response(
      JSON.stringify({
        identification: {
          ...identification,
          productImage: dbMatchResult.matchedMaterial?.image_url,
          imageMatchConfidence: dbMatchResult.confidence,
          matchDetails: dbMatchResult.matchDetails
        },
        matchedMaterial: dbMatchResult.matchedMaterial,
        similarMaterials,
        matchedSuppliers,
        catalogUrl
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
        matchedMaterial: null,
        similarMaterials: [],
        matchedSuppliers: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
