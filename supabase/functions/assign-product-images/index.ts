import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Curated high-quality industrial product images by category and type
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
  'needle valve': [
    'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80'
  ],
  'relief valve': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
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
  'piston pump': [
    'https://images.unsplash.com/photo-1590797098825-93b1d5c55ce9?w=800&q=80'
  ],
  'progressive cavity': [
    'https://images.unsplash.com/photo-1590797098825-93b1d5c55ce9?w=800&q=80'
  ],
  'multistage pump': [
    'https://images.unsplash.com/photo-1590797098825-93b1d5c55ce9?w=800&q=80'
  ],
  // Tanks
  'storage tank': [
    'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80'
  ],
  'pressure vessel': [
    'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80'
  ],
  'separator': [
    'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80'
  ],
  'heat exchanger': [
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
  'pressure gauge': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
  ],
  'analyzer': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
  ],
  // Electrical
  'motor': [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
  ],
  'actuator': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
  ],
  'vfd': [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
  ],
  'transformer': [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
  ],
  'generator': [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
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

function getProductImageUrl(productTitle: string, category: string): string {
  const titleLower = productTitle.toLowerCase();
  const catLower = category.toLowerCase();
  
  // Try to find matching product type
  for (const [type, urls] of Object.entries(imagesByType)) {
    if (titleLower.includes(type)) {
      return urls[Math.floor(Math.random() * urls.length)];
    }
  }
  
  // Fall back to category
  return categoryFallbacks[catLower] || 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { batchSize = 500, offset = 0 } = await req.json().catch(() => ({}));

    console.log(`Processing batch: offset=${offset}, batchSize=${batchSize}`);

    // Fetch products without images
    const { data: products, error: fetchError } = await supabase
      .from('materials')
      .select('id, title, category, image_url')
      .is('image_url', null)
      .range(offset, offset + batchSize - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No products without images found',
          processed: 0,
          offset,
          hasMore: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${products.length} products without images`);

    // Build updates
    const updates = products.map(product => ({
      id: product.id,
      image_url: getProductImageUrl(product.title, product.category),
      last_updated: new Date().toISOString(),
    }));

    // Update in batches of 100
    let updatedCount = 0;
    for (let i = 0; i < updates.length; i += 100) {
      const batch = updates.slice(i, i + 100);
      
      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('materials')
          .update({ 
            image_url: update.image_url, 
            last_updated: update.last_updated 
          })
          .eq('id', update.id);
        
        if (!updateError) {
          updatedCount++;
        }
      }
    }

    // Check if there are more products
    const { count } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true })
      .is('image_url', null);

    const hasMore = (count || 0) > 0;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Assigned images to ${updatedCount} products`,
        processed: updatedCount,
        offset,
        nextOffset: hasMore ? offset + batchSize : null,
        hasMore,
        remainingWithoutImages: count,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in assign-product-images function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
