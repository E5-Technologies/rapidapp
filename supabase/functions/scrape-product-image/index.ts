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

    console.log('Searching DirectIndustry for product images:', manufacturerName, productName);

    try {
      // Search DirectIndustry specifically for product images
      const searchQuery = `site:pdf.directindustry.com ${manufacturerName} ${productName}`;
      
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
        console.log('DirectIndustry search returned error:', searchData?.error || searchData?.code);
        // Fallback to general web search
        return await fallbackSearch(apiKey, manufacturerName, productName);
      }

      // Extract image URLs from search results
      const imageUrls: string[] = [];
      const results = searchData.data || [];
      
      console.log('DirectIndustry results found:', results.length);

      for (const result of results) {
        // Check markdown content for image references
        const markdown = result.markdown || '';
        
        // Look for DirectIndustry image patterns
        const directIndustryImageRegex = /(https?:\/\/[^\s"'<>]*directindustry[^\s"'<>]*\.(jpg|jpeg|png|webp|gif)(\?[^\s"'<>]*)?)/gi;
        let match;
        while ((match = directIndustryImageRegex.exec(markdown)) !== null) {
          if (match[1] && !imageUrls.includes(match[1])) {
            imageUrls.push(match[1]);
          }
        }

        // Also look for any image URLs in the content
        const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|webp|gif)[^\s)]*)\)/gi;
        while ((match = imageRegex.exec(markdown)) !== null) {
          if (match[1] && !imageUrls.includes(match[1])) {
            imageUrls.push(match[1]);
          }
        }
        
        // Raw image URLs in content
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

      console.log('Found DirectIndustry image URLs:', imageUrls.length);

      // If no images found from DirectIndustry, try general search
      if (imageUrls.length === 0) {
        console.log('No DirectIndustry images, falling back to general search');
        return await fallbackSearch(apiKey, manufacturerName, productName);
      }

      // Prioritize manufacturer-specific images
      const manufacturerLower = manufacturerName.toLowerCase();
      const productLower = productName.toLowerCase().split(' ')[0];
      
      const prioritizedImages = imageUrls.filter(url => {
        const lower = url.toLowerCase();
        return lower.includes(manufacturerLower) || 
               lower.includes(productLower) ||
               lower.includes('product') ||
               lower.includes('catalog');
      });

      const finalImages = prioritizedImages.length > 0 
        ? prioritizedImages.slice(0, 3) 
        : imageUrls.slice(0, 3);

      return new Response(
        JSON.stringify({
          success: true,
          imageUrls: finalImages,
          allLinks: imageUrls.slice(0, 10),
          source: 'directindustry'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (fetchError) {
      console.log('Fetch error:', fetchError instanceof Error ? fetchError.message : 'Unknown error');
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

// Fallback to general web search if DirectIndustry doesn't have results
async function fallbackSearch(apiKey: string, manufacturerName: string, productName: string) {
  try {
    console.log('Performing fallback web search for:', manufacturerName, productName);
    
    const searchQuery = `${manufacturerName} ${productName} industrial product image`;
    
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
      console.log('Fallback search failed:', searchData?.error);
      return new Response(
        JSON.stringify({ 
          success: true, 
          imageUrls: [], 
          allLinks: [],
          source: 'fallback-failed'
        }),
        { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } }
      );
    }

    const imageUrls: string[] = [];
    const results = searchData.data || [];
    
    for (const result of results) {
      const markdown = result.markdown || '';
      
      // Extract image URLs
      const urlRegex = /(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)(\?[^\s"'<>]*)?)/gi;
      let match;
      while ((match = urlRegex.exec(markdown)) !== null) {
        if (match[1] && !imageUrls.includes(match[1])) {
          imageUrls.push(match[1]);
        }
      }

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

    console.log('Fallback found images:', imageUrls.length);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrls: imageUrls.slice(0, 3),
        allLinks: imageUrls.slice(0, 10),
        source: 'fallback-search'
      }),
      { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.log('Fallback error:', error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrls: [], 
        allLinks: [],
        source: 'fallback-error'
      }),
      { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } }
    );
  }
}
