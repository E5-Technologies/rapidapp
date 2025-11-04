import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManufacturerScrapeRequest {
  manufacturerUrls: string[];
  materialCategory?: string;
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

    // Check if user has admin role
    const { data: hasAdminRole, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { manufacturerUrls, materialCategory }: ManufacturerScrapeRequest = await req.json();
    
    // Input validation
    if (!manufacturerUrls || !Array.isArray(manufacturerUrls) || manufacturerUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one manufacturer URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (manufacturerUrls.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Maximum 10 URLs allowed per request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate all URLs
    for (const url of manufacturerUrls) {
      if (typeof url !== 'string' || !url.startsWith('https://')) {
        return new Response(
          JSON.stringify({ error: 'All URLs must be valid HTTPS URLs' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        new URL(url);
      } catch {
        return new Response(
          JSON.stringify({ error: `Invalid URL format: ${url}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (materialCategory && (typeof materialCategory !== 'string' || materialCategory.length > 50)) {
      return new Response(
        JSON.stringify({ error: 'Material category must be 50 characters or less' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SERPER_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('Required API keys not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log(`Starting scrape for ${manufacturerUrls.length} manufacturers`);
    
    const results = [];

    for (const url of manufacturerUrls) {
      try {
        console.log(`Scraping ${url}...`);
        
        // Search for product data sheets on this manufacturer's website
        const searchQuery = `site:${url} ${materialCategory || 'valve pump equipment'} product data sheet specifications PDF`;
        
        const serperResponse = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: searchQuery,
            num: 10,
          }),
        });

        if (!serperResponse.ok) {
          console.error(`Serper API error for ${url}:`, serperResponse.status);
          continue;
        }

        const searchResults = await serperResponse.json();
        
        // Extract product images from the search
        const images = searchResults.images?.slice(0, 5) || [];
        
        // Use AI to extract product information
        const aiPrompt = `Analyze these search results from ${url} to extract oil and gas industry products with their specifications.

Search Results:
${JSON.stringify(searchResults, null, 2)}

Extract and return ONLY valid JSON array with products found:
[
  {
    "manufacturer": "manufacturer name from ${url}",
    "productName": "full product name",
    "category": "product category (Valves, Pumps, etc.)",
    "modelNumber": "model/serial number",
    "imageUrl": "direct product image URL if available",
    "datasheetUrl": "PDF datasheet URL if available",
    "specifications": ["key specification 1", "key specification 2"],
    "description": "brief product description",
    "rating": 4.5
  }
]

Only include products with clear names and specifications. Return empty array if no products found. Return ONLY the JSON array.`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'user', content: aiPrompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI API error for ${url}:`, aiResponse.status);
          continue;
        }

        const aiData = await aiResponse.json();
        const extractedContent = aiData.choices[0].message.content;
        
        // Parse the AI response
        let products = [];
        try {
          const cleanedContent = extractedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          products = JSON.parse(cleanedContent);
          
          if (!Array.isArray(products)) {
            products = [products];
          }
        } catch (parseError) {
          console.error(`Error parsing AI response for ${url}:`, parseError);
          continue;
        }

        console.log(`Found ${products.length} products from ${url}`);

        // Store products in database
        for (const product of products) {
          try {
            // First, find or create manufacturer
            let manufacturer = await supabase
              .from('manufacturers')
              .select('id')
              .eq('name', product.manufacturer)
              .single();

            if (!manufacturer.data) {
              const newManufacturer = await supabase
                .from('manufacturers')
                .insert({
                  name: product.manufacturer,
                  website: url,
                })
                .select()
                .single();
              
              manufacturer = newManufacturer;
            }

            if (manufacturer.data) {
              // Insert or update material
              const materialData = {
                manufacturer_id: manufacturer.data.id,
                title: product.productName,
                product_name: product.modelNumber || product.productName,
                category: product.category || 'Equipment',
                image_url: product.imageUrl || images[0]?.imageUrl || null,
                datasheet_url: product.datasheetUrl || null,
                rating: product.rating || 4.0,
              };

              await supabase
                .from('materials')
                .upsert(materialData, { onConflict: 'product_name' });

              results.push({
                manufacturer: product.manufacturer,
                product: product.productName,
                success: true,
              });
            }
          } catch (dbError) {
            console.error(`Database error for product ${product.productName}:`, dbError);
            results.push({
              manufacturer: product.manufacturer,
              product: product.productName,
              success: false,
              error: dbError instanceof Error ? dbError.message : 'Unknown error',
            });
          }
        }

      } catch (urlError) {
        console.error(`Error scraping ${url}:`, urlError);
        results.push({
          url,
          success: false,
          error: urlError instanceof Error ? urlError.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedUrls: manufacturerUrls.length,
        productsFound: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-manufacturer-data function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
