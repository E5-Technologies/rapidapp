import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalize manufacturer names for better search results
const normalizeManufacturer = (name: string): string => {
  const mappings: Record<string, string> = {
    'balon corporation': 'balon',
    'balon': 'balon valve',
    'bray international': 'bray',
    'bray': 'bray valve',
    'kimray': 'kimray valve',
    'franklin valve': 'franklin valve',
    'flowserve corporation': 'flowserve',
    'flowserve': 'flowserve valve pump',
    'fisher': 'fisher valve emerson',
    'cameron': 'cameron valve',
    'velan inc': 'velan',
    'velan': 'velan valve',
    'bonney forge': 'bonney forge valve',
    'victaulic': 'victaulic',
    'warren valve': 'warren valve',
    'mercer': 'mercer valve',
    'taylor': 'taylor valve',
    'scv': 'scv valve',
    'wkm': 'wkm valve cameron',
    'pbv': 'pbv valve',
    'pgi international': 'pgi valve',
    'kf industries': 'kf valve',
    'wheatley': 'wheatley pump valve',
    'crosby': 'crosby valve',
    'eanardo': 'eanardo valve',
    'crane co': 'crane valve',
    'crane': 'crane valve',
    'baker hughes': 'baker hughes valve',
    'kitz corp': 'kitz valve',
    'kitz': 'kitz valve',
    'danfoss': 'danfoss valve',
    'avk': 'avk valve',
    'swagelok': 'swagelok',
    'spx flow': 'spx valve pump',
    'spx': 'spx valve',
    'neway': 'neway valve',
    'gvc': 'gvc valve',
  };
  
  const lower = name.toLowerCase().trim();
  return mappings[lower] || name;
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

    const normalizedManufacturer = normalizeManufacturer(manufacturerName);
    console.log('Searching for product images:', normalizedManufacturer, productName);

    // Strategy 1: Search DirectIndustry PDF catalogs for this manufacturer's products
    const directIndustryImages = await searchDirectIndustry(apiKey, normalizedManufacturer, productName);
    
    if (directIndustryImages.length > 0) {
      console.log('Found DirectIndustry images:', directIndustryImages.length);
      return new Response(
        JSON.stringify({
          success: true,
          imageUrls: directIndustryImages.slice(0, 3),
          allLinks: directIndustryImages.slice(0, 10),
          source: 'directindustry'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Strategy 2: Try scraping DirectIndustry directly for this manufacturer
    const scrapedImages = await scrapeDirectIndustryPage(apiKey, normalizedManufacturer, productName);
    
    if (scrapedImages.length > 0) {
      console.log('Found scraped images:', scrapedImages.length);
      return new Response(
        JSON.stringify({
          success: true,
          imageUrls: scrapedImages.slice(0, 3),
          allLinks: scrapedImages.slice(0, 10),
          source: 'directindustry-scrape'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Strategy 3: Fallback to general web search
    console.log('No DirectIndustry images, falling back to general search');
    return await fallbackSearch(apiKey, normalizedManufacturer, productName);

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

// Search DirectIndustry using Firecrawl search
async function searchDirectIndustry(apiKey: string, manufacturer: string, product: string): Promise<string[]> {
  try {
    // Search specifically on DirectIndustry
    const searchQuery = `site:directindustry.com ${manufacturer} ${product} catalog`;
    
    console.log('DirectIndustry search query:', searchQuery);
    
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
          formats: ['markdown', 'links', 'html']
        }
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok || !searchData.success) {
      console.log('DirectIndustry search returned error:', searchData?.error || searchData?.code);
      return [];
    }

    const imageUrls: string[] = [];
    const results = searchData.data || [];
    
    console.log('DirectIndustry results found:', results.length);

    for (const result of results) {
      // Get images from result page URL patterns
      const pageUrl = result.url || '';
      
      // Extract images from markdown content
      const markdown = result.markdown || '';
      const html = result.html || '';
      
      // Pattern 1: DirectIndustry image CDN URLs
      const cdnPattern = /(https?:\/\/img\.directindustry\.com[^\s"'<>]+\.(jpg|jpeg|png|webp|gif)(\?[^\s"'<>]*)?)/gi;
      let match;
      while ((match = cdnPattern.exec(markdown + html)) !== null) {
        if (match[1] && !imageUrls.includes(match[1])) {
          imageUrls.push(match[1]);
        }
      }
      
      // Pattern 2: PDF.directindustry.com images
      const pdfPattern = /(https?:\/\/pdf\.directindustry\.com[^\s"'<>]+\.(jpg|jpeg|png|webp|gif)(\?[^\s"'<>]*)?)/gi;
      while ((match = pdfPattern.exec(markdown + html)) !== null) {
        if (match[1] && !imageUrls.includes(match[1])) {
          imageUrls.push(match[1]);
        }
      }
      
      // Pattern 3: Markdown image syntax
      const markdownImgPattern = /!\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|webp|gif)[^\s)]*)\)/gi;
      while ((match = markdownImgPattern.exec(markdown)) !== null) {
        if (match[1] && !imageUrls.includes(match[1])) {
          imageUrls.push(match[1]);
        }
      }
      
      // Pattern 4: Any image URLs in content
      const anyImagePattern = /(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)(\?[^\s"'<>]*)?)/gi;
      while ((match = anyImagePattern.exec(markdown + html)) !== null) {
        const url = match[1];
        // Prefer DirectIndustry, manufacturer, or product-related images
        if (url && !imageUrls.includes(url)) {
          const lowerUrl = url.toLowerCase();
          if (lowerUrl.includes('directindustry') || 
              lowerUrl.includes(manufacturer.split(' ')[0].toLowerCase()) ||
              lowerUrl.includes('product') ||
              lowerUrl.includes('catalog')) {
            imageUrls.unshift(url); // Add to front for priority
          } else {
            imageUrls.push(url);
          }
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

    // Filter out small icons and prioritize product images
    const filteredImages = imageUrls.filter(url => {
      const lower = url.toLowerCase();
      return !lower.includes('icon') && 
             !lower.includes('logo') && 
             !lower.includes('favicon') &&
             !lower.includes('thumb') &&
             !lower.includes('avatar');
    });

    return filteredImages;
  } catch (error) {
    console.log('DirectIndustry search error:', error);
    return [];
  }
}

// Scrape a DirectIndustry page directly
async function scrapeDirectIndustryPage(apiKey: string, manufacturer: string, product: string): Promise<string[]> {
  try {
    // First, use the map API to find relevant pages
    const manufacturerSlug = manufacturer.split(' ')[0].toLowerCase();
    const mapUrl = `https://pdf.directindustry.com/pdf-en/${manufacturerSlug}`;
    
    console.log('Trying to map DirectIndustry for:', mapUrl);
    
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: mapUrl,
        search: product,
        limit: 10,
        includeSubdomains: true
      }),
    });

    const mapData = await mapResponse.json();
    
    if (!mapResponse.ok || !mapData.success) {
      console.log('Map failed, trying direct scrape');
      return await directScrapeFallback(apiKey, manufacturer, product);
    }

    const links = mapData.links || [];
    console.log('Found catalog links:', links.length);
    
    if (links.length === 0) {
      return await directScrapeFallback(apiKey, manufacturer, product);
    }

    // Scrape the first catalog page for images
    const catalogUrl = links[0];
    
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: catalogUrl,
        formats: ['markdown', 'html', 'screenshot']
      }),
    });

    const scrapeData = await scrapeResponse.json();
    
    if (!scrapeResponse.ok || !scrapeData.success) {
      console.log('Scrape failed:', scrapeData?.error);
      return [];
    }

    const imageUrls: string[] = [];
    const content = (scrapeData.data?.markdown || '') + (scrapeData.data?.html || '');
    
    // Extract all image URLs
    const imagePattern = /(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)(\?[^\s"'<>]*)?)/gi;
    let match;
    while ((match = imagePattern.exec(content)) !== null) {
      if (match[1] && !imageUrls.includes(match[1])) {
        imageUrls.push(match[1]);
      }
    }

    // If we got a screenshot, include it as fallback
    if (scrapeData.data?.screenshot) {
      imageUrls.push(`data:image/png;base64,${scrapeData.data.screenshot}`);
    }

    return imageUrls;
  } catch (error) {
    console.log('Scrape DirectIndustry error:', error);
    return [];
  }
}

// Direct scrape fallback for manufacturer pages
async function directScrapeFallback(apiKey: string, manufacturer: string, product: string): Promise<string[]> {
  try {
    // Try to scrape the main DirectIndustry search page
    const searchUrl = `https://www.directindustry.com/manufacturer-industrial/${encodeURIComponent(manufacturer.split(' ')[0])}.html`;
    
    console.log('Trying direct scrape:', searchUrl);
    
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: searchUrl,
        formats: ['markdown', 'links']
      }),
    });

    const scrapeData = await scrapeResponse.json();
    
    if (!scrapeResponse.ok || !scrapeData.success) {
      return [];
    }

    const imageUrls: string[] = [];
    const content = scrapeData.data?.markdown || '';
    
    const imagePattern = /(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)(\?[^\s"'<>]*)?)/gi;
    let match;
    while ((match = imagePattern.exec(content)) !== null) {
      if (match[1] && !imageUrls.includes(match[1])) {
        imageUrls.push(match[1]);
      }
    }

    return imageUrls;
  } catch (error) {
    return [];
  }
}

// Fallback to general web search
async function fallbackSearch(apiKey: string, manufacturerName: string, productName: string) {
  try {
    console.log('Performing fallback web search for:', manufacturerName, productName);
    
    const searchQuery = `${manufacturerName} ${productName} industrial product valve pump image`;
    
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
