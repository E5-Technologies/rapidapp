import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Equipment catalog data for finding catalog URLs
const equipmentCatalog = [
  // Valves
  { name: "Balon Corporation", category: "Valves", catalogUrls: ["https://www.balon.com/downloads/CompleteCatalog.pdf"] },
  { name: "Bray International", category: "Valves", catalogUrls: ["https://www.bray.com/products"] },
  { name: "Kimray", category: "Valves", catalogUrls: ["https://kimray.com/products"] },
  { name: "Franklin Valve", category: "Valves", catalogUrls: ["https://www.franklinvalve.com/products"] },
  { name: "Flowserve", category: "Valves", catalogUrls: ["https://www.flowserve.com/products/products-catalog/valves"] },
  { name: "Fisher", category: "Valves", catalogUrls: ["https://www.emerson.com/en-us/automation/fisher"] },
  { name: "Cameron", category: "Valves", catalogUrls: ["https://www.slb.com/valves"] },
  { name: "Velan", category: "Valves", catalogUrls: ["https://www.velan.com/products"] },
  { name: "Bonney Forge", category: "Valves", catalogUrls: ["https://bonneyforge.com/products/valves.php"] },
  { name: "Victaulic", category: "Valves", catalogUrls: ["https://www.victaulic.com/products"] },
  { name: "Crane", category: "Valves", catalogUrls: ["https://www.craneco.com/industrial-valves"] },
  { name: "Baker Hughes", category: "Valves", catalogUrls: ["https://www.bakerhughes.com/products/valves"] },
  { name: "Swagelok", category: "Valves", catalogUrls: ["https://www.swagelok.com/en/catalog/Products/Valve"] },
  { name: "Emerson", category: "Automation", catalogUrls: ["https://www.emerson.com/en-us/automation"] },
  { name: "Rosemount", category: "Automation", catalogUrls: ["https://www.emerson.com/en-us/automation/rosemount"] },
  { name: "Siemens", category: "Automation", catalogUrls: ["https://www.siemens.com/products"] },
  { name: "Honeywell", category: "Automation", catalogUrls: ["https://process.honeywell.com/products"] },
  { name: "ABB", category: "Automation", catalogUrls: ["https://new.abb.com/process-automation"] },
  { name: "Yokogawa", category: "Automation", catalogUrls: ["https://www.yokogawa.com/products"] },
  { name: "Goulds Pumps", category: "Pumps", catalogUrls: ["https://www.gouldspumps.com/products"] },
  { name: "Xylem", category: "Pumps", catalogUrls: ["https://www.xylem.com/products"] },
  { name: "Sulzer", category: "Pumps", catalogUrls: ["https://www.sulzer.com/en/products/pumps"] },
  { name: "KSB", category: "Pumps", catalogUrls: ["https://www.ksb.com/products"] },
  { name: "Grundfos", category: "Pumps", catalogUrls: ["https://product-selection.grundfos.com/products"] },
  { name: "Weir", category: "Pumps", catalogUrls: ["https://www.global.weir/products"] },
  { name: "Ebara", category: "Pumps", catalogUrls: ["https://www.ebara.com/products"] },
  { name: "Pentair", category: "Pumps", catalogUrls: ["https://www.pentair.com/products/pumps"] },
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

// Scrape product images from manufacturer catalog using Firecrawl
async function scrapeProductImages(manufacturerName: string, productType: string, catalogUrl: string): Promise<{ images: string[], screenshot?: string }> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.log('FIRECRAWL_API_KEY not configured, skipping image scraping');
    return { images: [] };
  }

  try {
    console.log(`Scraping ${catalogUrl} for ${productType} images...`);
    
    // Use Firecrawl search to find product-specific pages
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${manufacturerName} ${productType} product image`,
        limit: 5,
        scrapeOptions: {
          formats: ['markdown', 'links']
        }
      }),
    });

    let productImages: string[] = [];
    let screenshot: string | undefined;

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('Search results:', searchData.data?.length || 0);
      
      // Extract image URLs from search results
      for (const result of searchData.data || []) {
        const links = result.links || [];
        const imageLinks = links.filter((link: string) => {
          const lower = link.toLowerCase();
          return lower.endsWith('.jpg') || 
                 lower.endsWith('.jpeg') || 
                 lower.endsWith('.png') || 
                 lower.endsWith('.webp') ||
                 lower.includes('/images/') ||
                 lower.includes('/product');
        });
        productImages.push(...imageLinks);
      }
    }

    // If no images from search, try direct scrape of catalog URL
    if (productImages.length === 0) {
      console.log('No images from search, trying direct scrape...');
      
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: catalogUrl,
          formats: ['links', 'screenshot'],
          onlyMainContent: true,
          waitFor: 2000,
        }),
      });

      if (scrapeResponse.ok) {
        const scrapeData = await scrapeResponse.json();
        const links = scrapeData.data?.links || [];
        screenshot = scrapeData.data?.screenshot;
        
        // Filter for product images
        productImages = links.filter((link: string) => {
          const lower = link.toLowerCase();
          const productLower = productType.toLowerCase();
          return (lower.endsWith('.jpg') || 
                  lower.endsWith('.jpeg') || 
                  lower.endsWith('.png') || 
                  lower.endsWith('.webp')) &&
                 (lower.includes('product') || 
                  lower.includes(productLower) ||
                  lower.includes('catalog'));
        });
      }
    }

    console.log(`Found ${productImages.length} product images`);
    return { 
      images: [...new Set(productImages)].slice(0, 5),
      screenshot 
    };
  } catch (error) {
    console.error('Error scraping images:', error);
    return { images: [] };
  }
}

// Compare captured image with scraped product images using AI
async function compareImagesWithAI(
  capturedImage: string, 
  productImages: string[], 
  identification: any,
  apiKey: string
): Promise<{ bestMatch: string | null, confidence: number, matchDetails: string }> {
  if (productImages.length === 0) {
    return { bestMatch: null, confidence: 0, matchDetails: 'No product images available for comparison' };
  }

  try {
    const imageContent = [
      {
        type: "text",
        text: `You are analyzing an industrial equipment image to find the best matching product.

The equipment has been identified as:
- Category: ${identification.category}
- Type: ${identification.type}
- Manufacturer: ${identification.manufacturer}
- Features: ${identification.features?.join(', ') || 'Unknown'}

Compare the FIRST image (captured by user) with the following product images from the manufacturer's catalog. 
Determine which product image is the closest visual match to the captured image.

Respond in JSON format:
{
  "bestMatchIndex": <0-based index of best matching image, or -1 if no good match>,
  "confidence": <0-100>,
  "matchDetails": "explanation of why this is the best match",
  "productName": "likely product name/model if identifiable"
}`
      },
      {
        type: "image_url",
        image_url: { url: capturedImage }
      },
      ...productImages.slice(0, 3).map((img, idx) => ({
        type: "image_url",
        image_url: { url: img }
      }))
    ];

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
      console.error('AI comparison failed:', response.status);
      return { bestMatch: null, confidence: 0, matchDetails: 'AI comparison failed' };
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      const matchIndex = result.bestMatchIndex;
      
      if (matchIndex >= 0 && matchIndex < productImages.length) {
        return {
          bestMatch: productImages[matchIndex],
          confidence: result.confidence || 70,
          matchDetails: result.matchDetails || 'Match found'
        };
      }
    }

    return { bestMatch: null, confidence: 0, matchDetails: 'No matching product found' };
  } catch (error) {
    console.error('Error comparing images:', error);
    return { bestMatch: null, confidence: 0, matchDetails: 'Comparison error' };
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

    // Create lists for AI prompt
    const manufacturersList = suppliers?.map(s => s.name).join(', ') || equipmentCatalog.map(e => e.name).join(', ');
    const categoriesList = [...new Set([
      ...(suppliers?.map(s => s.category) || []),
      ...equipmentCatalog.map(e => e.category)
    ])].join(', ');

    console.log("Step 1: Analyzing equipment image with AI...");
    console.log("Known categories:", categoriesList);

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
            content: `You are an expert in oil and gas industry equipment identification. You have access to a database of equipment suppliers in these categories: ${categoriesList}.

Known manufacturers in our database: ${manufacturersList}

Analyze images of industrial equipment and identify:
1. Equipment category (must be one of: ${categoriesList})
2. Specific equipment type (e.g., ball valve, gate valve, control valve, centrifugal pump, pressure gauge, etc.)
3. Manufacturer - Try to match to one of our known manufacturers if visible on the equipment
4. Material composition if visible (stainless steel, carbon steel, brass, etc.)
5. Size/specifications if visible
6. Key identifying features (brand markings, model numbers, distinctive design elements)

IMPORTANT: Look carefully for:
- Brand logos or text on the equipment
- Model numbers or part numbers
- Distinctive design features unique to specific manufacturers

Respond in JSON format with:
{
  "category": "Valves|Pumps|Tanks|Vessels|Automation|Instrumentation",
  "type": "specific equipment type",
  "manufacturer": "exact manufacturer name from our database or 'Unknown'",
  "material": "material type if visible",
  "size": "size/specs if visible",
  "confidence": 0-100,
  "features": ["feature1", "feature2"],
  "description": "brief description of what was identified",
  "searchTerms": ["keyword1", "keyword2"],
  "modelNumber": "model/part number if visible"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this oil and gas equipment. Look for brand markings, model numbers, and match the manufacturer to our database if possible:"
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
      const errorText = await identifyResponse.text();
      console.error("AI gateway error:", identifyResponse.status, errorText);
      throw new Error(`AI analysis failed: ${identifyResponse.status}`);
    }

    const identifyData = await identifyResponse.json();
    const aiResponse = identifyData.choices[0].message.content;
    
    console.log("AI identification response:", aiResponse);
    
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

    console.log("Step 2: Scraping product images from manufacturer catalogs...");

    // Step 2: Find catalog URL and scrape product images
    let scrapedImages: { images: string[], screenshot?: string } = { images: [] };
    let catalogUrl = findCatalogUrl(identification.manufacturer);
    
    // Also check suppliers table for catalog URL
    if (!catalogUrl && suppliers) {
      const supplierMatch = suppliers.find(s => 
        s.name.toLowerCase().includes(identification.manufacturer.toLowerCase()) ||
        identification.manufacturer.toLowerCase().includes(s.name.toLowerCase())
      );
      if (supplierMatch?.catalog_url) {
        catalogUrl = supplierMatch.catalog_url;
      }
    }

    if (catalogUrl) {
      scrapedImages = await scrapeProductImages(
        identification.manufacturer, 
        identification.type,
        catalogUrl
      );
    } else if (identification.category !== 'Unknown') {
      // Try to find any manufacturer in the same category
      const categoryManufacturers = equipmentCatalog.filter(
        e => e.category.toLowerCase() === identification.category.toLowerCase()
      );
      
      if (categoryManufacturers.length > 0) {
        const firstCatalog = categoryManufacturers[0].catalogUrls[0];
        scrapedImages = await scrapeProductImages(
          categoryManufacturers[0].name,
          identification.type,
          firstCatalog
        );
      }
    }

    console.log(`Step 3: Comparing images (${scrapedImages.images.length} scraped images)...`);

    // Step 3: Compare captured image with scraped images
    let matchResult = { bestMatch: null as string | null, confidence: 0, matchDetails: '' };
    
    if (scrapedImages.images.length > 0) {
      matchResult = await compareImagesWithAI(
        image,
        scrapedImages.images,
        identification,
        LOVABLE_API_KEY
      );
    }

    // Find matching suppliers from the database
    let matchedSuppliers: any[] = [];
    
    if (suppliers && suppliers.length > 0) {
      // First, try to match by manufacturer name
      if (identification.manufacturer && identification.manufacturer !== "Unknown") {
        matchedSuppliers = suppliers.filter(s => 
          s.name.toLowerCase().includes(identification.manufacturer.toLowerCase()) ||
          identification.manufacturer.toLowerCase().includes(s.name.toLowerCase())
        );
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

    // Add scraped product image to the response
    const bestProductImage = matchResult.bestMatch || scrapedImages.images[0] || scrapedImages.screenshot;

    console.log("Identification complete. Matched suppliers:", matchedSuppliers.length);
    console.log("Best product image found:", bestProductImage ? 'Yes' : 'No');

    return new Response(
      JSON.stringify({
        identification: {
          ...identification,
          productImage: bestProductImage,
          imageMatchConfidence: matchResult.confidence,
          matchDetails: matchResult.matchDetails
        },
        matchedSuppliers,
        scrapedImages: scrapedImages.images,
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
        matchedSuppliers: [],
        scrapedImages: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
