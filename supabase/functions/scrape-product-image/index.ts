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

    if (!manufacturerName || !catalogUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Manufacturer name and catalog URL are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.log('FIRECRAWL_API_KEY not configured - returning empty result');
      // Return success with empty data instead of error
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

    // Format URL
    let formattedUrl = catalogUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping catalog for product images:', formattedUrl);
    console.log('Looking for:', manufacturerName, productName);

    try {
      // Try to scrape the catalog page for images - with reduced wait time
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: ['links'],
          onlyMainContent: true,
          waitFor: 500, // Reduced wait time
          timeout: 8000, // 8 second timeout for Firecrawl
        }),
      });

      const scrapeData = await scrapeResponse.json();

      // Handle any Firecrawl error gracefully
      if (!scrapeResponse.ok || !scrapeData.success) {
        console.log('Firecrawl returned error, returning empty result:', scrapeData?.error || scrapeData?.code);
        return new Response(
          JSON.stringify({ 
            success: true, 
            imageUrls: [], 
            allLinks: [],
            source: 'scrape-failed'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract image URLs from the scraped content - handle nested data structure
      const data = scrapeData.data || scrapeData;
      const links = data?.links || [];
      
      // Filter for image links
      const imageLinks = links.filter((link: string) => {
        const lower = link.toLowerCase();
        return lower.endsWith('.jpg') || 
               lower.endsWith('.jpeg') || 
               lower.endsWith('.png') || 
               lower.endsWith('.webp') ||
               lower.includes('/images/') ||
               lower.includes('/img/') ||
               lower.includes('/assets/');
      });

      console.log('Found image links:', imageLinks.length);

      // Try to find product-specific images
      const productImages = imageLinks.filter((link: string) => {
        const lower = link.toLowerCase();
        const productLower = (productName || '').toLowerCase();
        const manufacturerLower = manufacturerName.toLowerCase();
        
        return lower.includes(productLower) || 
               lower.includes(manufacturerLower) ||
               lower.includes('product') ||
               lower.includes('catalog');
      });

      return new Response(
        JSON.stringify({
          success: true,
          imageUrls: productImages.length > 0 ? productImages.slice(0, 5) : imageLinks.slice(0, 5),
          allLinks: imageLinks.slice(0, 10),
          source: 'scrape'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (fetchError) {
      // Handle any fetch error gracefully - return success with empty data
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
    // Even on complete failure, return success with empty data to prevent UI errors
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
