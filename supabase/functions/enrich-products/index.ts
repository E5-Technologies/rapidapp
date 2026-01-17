import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  product_name: string;
  title: string;
  model_number: string | null;
  category: string;
  image_url: string | null;
  manufacturer_name: string;
}

interface EnrichedProduct {
  id: string;
  product_name: string;
  model_number: string;
  image_url: string | null;
}

// Use curated high-quality industrial product images by category and type
function getProductImageUrl(
  productName: string,
  category: string,
  manufacturerName: string
): string {
  // Extract product type keywords
  const nameLower = productName.toLowerCase();
  const catLower = category.toLowerCase();
  
  // Curated product images from reputable sources (Unsplash industrial/manufacturing images)
  const imagesByType: Record<string, string[]> = {
    // Valves
    'ball valve': [
      'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
    ],
    'gate valve': [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80'
    ],
    'butterfly valve': [
      'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=800&q=80'
    ],
    'check valve': [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
    ],
    'globe valve': [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    ],
    'control valve': [
      'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80'
    ],
    'safety valve': [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    ],
    'plug valve': [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
    ],
    // Pumps
    'centrifugal pump': [
      'https://images.unsplash.com/photo-1590797098825-93b1d5c55ce9?w=800&q=80'
    ],
    'submersible pump': [
      'https://images.unsplash.com/photo-1590797098825-93b1d5c55ce9?w=800&q=80'
    ],
    'diaphragm pump': [
      'https://images.unsplash.com/photo-1590797098825-93b1d5c55ce9?w=800&q=80'
    ],
    'gear pump': [
      'https://images.unsplash.com/photo-1590797098825-93b1d5c55ce9?w=800&q=80'
    ],
    // Tanks
    'storage tank': [
      'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80'
    ],
    'pressure vessel': [
      'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80'
    ],
    // Instrumentation
    'pressure transmitter': [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
    ],
    'flow meter': [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
    ],
    'level transmitter': [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
    ],
    'temperature transmitter': [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
    ],
    // Electrical
    'motor': [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
    ],
    'actuator': [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    ],
  };
  
  // Category fallbacks
  const categoryFallbacks: Record<string, string> = {
    'valves': 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80',
    'pumps': 'https://images.unsplash.com/photo-1590797098825-93b1d5c55ce9?w=800&q=80',
    'tanks': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80',
    'instrumentation': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    'electrical': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  };
  
  // Try to find matching product type
  for (const [type, urls] of Object.entries(imagesByType)) {
    if (nameLower.includes(type)) {
      return urls[Math.floor(Math.random() * urls.length)];
    }
  }
  
  // Fall back to category
  return categoryFallbacks[catLower] || 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80';
}

// Use AI to generate technical product description and extract model number
async function enrichProductWithAI(
  product: Product,
  lovableApiKey: string
): Promise<{ description: string; modelNumber: string }> {
  try {
    const prompt = `You are an expert industrial equipment catalog specialist. Based on the following product information, generate:
1. A comprehensive technical product description (150-250 words) following this format:
   - Start with the primary function/application
   - Include key features and benefits
   - Mention relevant technical specifications (pressure ratings, materials, sizes, certifications)
   - End with typical applications in oil & gas, industrial, or related industries

2. Extract or generate an appropriate model number (if not provided)

Product Information:
- Manufacturer: ${product.manufacturer_name}
- Title: ${product.title}
- Current Name/Description: ${product.product_name}
- Category: ${product.category}
- Current Model Number: ${product.model_number || 'Not provided'}

IMPORTANT: 
- Write in a professional, technical catalog style
- Include realistic specifications appropriate for this type of equipment
- Reference industry standards (ASME, API, ISO, etc.) where applicable
- Model numbers should follow industry conventions (e.g., "BP-1200", "GH-500", "CVW-2000")

Respond in this exact JSON format:
{
  "description": "Your detailed technical description here",
  "modelNumber": "MODEL-XXX"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a technical product catalog specialist for industrial equipment. Always respond with valid JSON only, no markdown.' },
          { role: 'user', content: prompt }
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
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response (handle potential markdown wrapping)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }
    
    const parsed = JSON.parse(jsonContent);
    return {
      description: parsed.description || product.product_name,
      modelNumber: parsed.modelNumber || product.model_number || 'N/A'
    };
  } catch (error) {
    console.error('Error enriching product with AI:', error);
    // Fallback to existing data
    return {
      description: product.product_name,
      modelNumber: product.model_number || 'N/A'
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { batchSize = 10, offset = 0, onlyMissing = true } = await req.json().catch(() => ({}));

    // Build query for products that need enrichment
    let query = supabase
      .from('materials')
      .select(`
        id,
        product_name,
        title,
        model_number,
        category,
        image_url,
        manufacturer:manufacturers(name)
      `)
      .range(offset, offset + batchSize - 1);

    // If onlyMissing is true, filter for products without proper data
    if (onlyMissing) {
      query = query.or('model_number.is.null,image_url.is.null,product_name.lt.100');
    }

    const { data: products, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No products to enrich',
          processed: 0,
          offset,
          hasMore: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${products.length} products starting at offset ${offset}`);

    const enrichedProducts: EnrichedProduct[] = [];
    const errors: { id: string; error: string }[] = [];

    for (const product of products) {
      try {
        const manufacturerName = (product.manufacturer as any)?.name || 'Unknown';
        
        const productWithManufacturer: Product = {
          id: product.id,
          product_name: product.product_name,
          title: product.title,
          model_number: product.model_number,
          category: product.category,
          image_url: product.image_url,
          manufacturer_name: manufacturerName,
        };

        // Use AI to enrich the product description and model number
        console.log(`Enriching product: ${product.title} (${manufacturerName})`);
        const { description, modelNumber } = await enrichProductWithAI(productWithManufacturer, LOVABLE_API_KEY);

        // Get product image based on category/type
        let imageUrl = product.image_url;
        if (!imageUrl) {
          imageUrl = getProductImageUrl(product.title, product.category, manufacturerName);
          console.log(`Assigned image for: ${product.title}`);
        }

        // Update the product in the database
        const { error: updateError } = await supabase
          .from('materials')
          .update({
            product_name: description,
            model_number: modelNumber,
            image_url: imageUrl,
            last_updated: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (updateError) {
          throw new Error(`Failed to update product: ${updateError.message}`);
        }

        enrichedProducts.push({
          id: product.id,
          product_name: description.substring(0, 100) + '...',
          model_number: modelNumber,
          image_url: imageUrl,
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        errors.push({ 
          id: product.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Check if there are more products to process
    const { count } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });

    const hasMore = (offset + batchSize) < (count || 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enriched ${enrichedProducts.length} products`,
        processed: enrichedProducts.length,
        errors: errors.length > 0 ? errors : undefined,
        enrichedProducts,
        offset,
        nextOffset: hasMore ? offset + batchSize : null,
        hasMore,
        totalProducts: count,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enrich-products function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
