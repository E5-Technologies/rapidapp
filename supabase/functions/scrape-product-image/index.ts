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
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = catalogUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping catalog for product images:', formattedUrl);
    console.log('Looking for:', manufacturerName, productName);

    // First, try to scrape the catalog page for images
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['links', 'screenshot'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error('Firecrawl scrape error:', scrapeData);
      
      // Fallback: Try to get branding/logo info
      const brandingResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: ['branding'],
        }),
      });

      const brandingData = await brandingResponse.json();
      
      if (brandingResponse.ok && brandingData.data?.branding?.images?.logo) {
        return new Response(
          JSON.stringify({
            success: true,
            logoUrl: brandingData.data.branding.images.logo,
            source: 'branding'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Could not fetch product images' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract image URLs from the scraped content
    const links = scrapeData.data?.links || [];
    const screenshot = scrapeData.data?.screenshot;
    
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
        screenshot: screenshot,
        allLinks: imageLinks.slice(0, 10),
        source: 'scrape'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scraping product images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape images';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
