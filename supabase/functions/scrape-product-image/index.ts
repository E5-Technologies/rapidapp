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
    const { manufacturerName, productName, catalogUrl } = await req.json();

    if (!manufacturerName || !productName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Manufacturer name and product name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.log('FIRECRAWL_API_KEY not configured - returning empty result');
      return new Response(
        JSON.stringify({ 
          success: true, 
          imageUrls: [], 
          allLinks: [],
          source: 'no-api-key'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching for product images:', manufacturerName, productName);

    try {
      // Use Firecrawl search to find product images
      const searchQuery = `${manufacturerName} ${productName} product image`;
      
      const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 5,
          scrapeOptions: {
            formats: ['markdown', 'links']
          }
        }),
      });

      const searchData = await searchResponse.json();

      if (!searchResponse.ok || !searchData.success) {
        console.log('Firecrawl search returned error:', searchData?.error || searchData?.code);
        return new Response(
          JSON.stringify({ 
            success: true, 
            imageUrls: [], 
            allLinks: [],
            source: 'search-failed'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract image URLs from search results
      const imageUrls: string[] = [];
      const results = searchData.data || [];
      
      for (const result of results) {
        // Check markdown content for image references
        const markdown = result.markdown || '';
        const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|webp|gif)[^\s)]*)\)/gi;
        let match;
        while ((match = imageRegex.exec(markdown)) !== null) {
          if (match[1] && !imageUrls.includes(match[1])) {
            imageUrls.push(match[1]);
          }
        }
        
        // Also check for raw image URLs in content
        const urlRegex = /(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)(\?[^\s"'<>]*)?)/gi;
        while ((match = urlRegex.exec(markdown)) !== null) {
          if (match[1] && !imageUrls.includes(match[1])) {
            imageUrls.push(match[1]);
          }
        }

        // Check links array for image URLs
        const links = result.links || [];
        for (const link of links) {
          const lower = link.toLowerCase();
          if ((lower.includes('.jpg') || lower.includes('.jpeg') || 
               lower.includes('.png') || lower.includes('.webp')) &&
              !imageUrls.includes(link)) {
            imageUrls.push(link);
          }
        }
      }

      console.log('Found image URLs:', imageUrls.length);

      // Filter to prioritize manufacturer-specific images
      const manufacturerLower = manufacturerName.toLowerCase();
      const productLower = productName.toLowerCase();
      
      const prioritizedImages = imageUrls.filter(url => {
        const lower = url.toLowerCase();
        return lower.includes(manufacturerLower) || 
               lower.includes(productLower.split(' ')[0]) ||
               lower.includes('product');
      });

      const finalImages = prioritizedImages.length > 0 
        ? prioritizedImages.slice(0, 3) 
        : imageUrls.slice(0, 3);

      return new Response(
        JSON.stringify({
          success: true,
          imageUrls: finalImages,
          allLinks: imageUrls.slice(0, 10),
          source: 'search'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (fetchError) {
      console.log('Fetch error, returning empty result:', fetchError instanceof Error ? fetchError.message : 'Unknown error');
      return new Response(
        JSON.stringify({ 
          success: true, 
          imageUrls: [], 
          allLinks: [],
          source: 'fetch-error'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in scrape-product-image:', error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrls: [], 
        allLinks: [],
        source: 'error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
