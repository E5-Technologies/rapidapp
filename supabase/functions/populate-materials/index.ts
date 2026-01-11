import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EquipmentSupplier {
  id: string;
  name: string;
  category: string;
  catalog_url: string | null;
}

// Scrape product images from DirectIndustry catalog
async function scrapeDirectIndustryImages(
  manufacturerName: string,
  category: string,
  apiKey: string
): Promise<{ images: string[], products: { name: string, image: string }[] }> {
  const products: { name: string, image: string }[] = [];
  const images: string[] = [];
  
  try {
    // Search DirectIndustry for this manufacturer's products
    const searchQuery = `site:directindustry.com ${manufacturerName} ${category}`;
    console.log(`Searching DirectIndustry for: ${searchQuery}`);
    
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        scrapeOptions: {
          formats: ['markdown', 'html']
        }
      }),
    });

    if (!searchResponse.ok) {
      console.error(`DirectIndustry search failed: ${searchResponse.status}`);
      return { images, products };
    }

    const searchData = await searchResponse.json();
    console.log(`Found ${searchData.data?.length || 0} DirectIndustry results`);
    
    // Extract images from search results
    if (searchData.data && Array.isArray(searchData.data)) {
      for (const result of searchData.data) {
        // Extract product name from title
        const productName = result.title?.replace(/\s*-\s*DirectIndustry.*$/i, '').trim() || '';
        
        // Extract images from markdown content
        const markdownContent = result.markdown || '';
        const htmlContent = result.html || '';
        
        // Find DirectIndustry CDN images
        const directIndustryImageRegex = /https?:\/\/(?:img|media|cdn)\.directindustry\.com\/[^\s"'<>)]+\.(?:jpg|jpeg|png|webp|gif)/gi;
        const mdImages = markdownContent.match(directIndustryImageRegex) || [];
        const htmlImages = htmlContent.match(directIndustryImageRegex) || [];
        
        // Also check for catalog PDF images
        const pdfImageRegex = /https?:\/\/pdf\.directindustry\.com\/[^\s"'<>)]+\.(?:jpg|jpeg|png|webp)/gi;
        const pdfImages = markdownContent.match(pdfImageRegex) || [];
        
        const allImages = [...new Set([...mdImages, ...htmlImages, ...pdfImages])];
        
        // Filter for product images (exclude logos, icons, etc.)
        const productImages = allImages.filter(img => 
          !img.includes('logo') && 
          !img.includes('icon') && 
          !img.includes('favicon') &&
          (img.includes('product') || img.includes('catalog') || img.includes('/p/') || img.includes('/photos/'))
        );
        
        if (productImages.length > 0 && productName) {
          products.push({
            name: productName,
            image: productImages[0]
          });
          images.push(...productImages);
        }
      }
    }
    
    return { images: [...new Set(images)], products };
  } catch (error) {
    console.error(`Error scraping DirectIndustry for ${manufacturerName}:`, error);
    return { images, products };
  }
}

// Scrape images from manufacturer catalog URL
async function scrapeCatalogImages(
  catalogUrl: string,
  manufacturerName: string,
  apiKey: string
): Promise<{ images: string[], products: { name: string, image: string }[] }> {
  const products: { name: string, image: string }[] = [];
  const images: string[] = [];
  
  try {
    console.log(`Scraping catalog: ${catalogUrl}`);
    
    // Skip PDF catalogs (can't scrape easily)
    if (catalogUrl.endsWith('.pdf')) {
      console.log(`Skipping PDF catalog: ${catalogUrl}`);
      return { images, products };
    }
    
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: catalogUrl,
        formats: ['markdown', 'html', 'links'],
        onlyMainContent: true,
      }),
    });

    if (!scrapeResponse.ok) {
      console.error(`Catalog scrape failed: ${scrapeResponse.status}`);
      return { images, products };
    }

    const scrapeData = await scrapeResponse.json();
    const data = scrapeData.data || scrapeData;
    
    const markdown = data.markdown || '';
    const html = data.html || '';
    
    // Extract all images
    const imageRegex = /https?:\/\/[^\s"'<>)]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>)]*)?/gi;
    const mdImages = markdown.match(imageRegex) || [];
    const htmlImages = html.match(imageRegex) || [];
    
    const allImages = [...new Set([...mdImages, ...htmlImages])];
    
    // Filter for product images
    const productImages = allImages.filter(img => {
      const lowerImg = img.toLowerCase();
      return !lowerImg.includes('logo') && 
             !lowerImg.includes('icon') && 
             !lowerImg.includes('favicon') &&
             !lowerImg.includes('banner') &&
             !lowerImg.includes('header') &&
             img.length < 500; // Avoid overly long URLs
    });
    
    // Try to extract product names and associate with images
    const productNameRegex = /(?:^|\n)\s*(?:#+\s*)?([A-Z][A-Za-z0-9\s\-\.]+(?:Valve|Pump|Tank|Vessel|Transmitter|Sensor|Controller|Actuator))/gm;
    const productNameMatches: string[] = markdown.match(productNameRegex) || [];
    const productNames = [...new Set<string>(productNameMatches)].map(n => n.trim());
    
    // Associate images with product names
    for (let i = 0; i < Math.min(productImages.length, 10); i++) {
      const productName = productNames[i] || `${manufacturerName} Product ${i + 1}`;
      products.push({
        name: productName,
        image: productImages[i]
      });
    }
    
    return { images: productImages.slice(0, 20), products };
  } catch (error) {
    console.error(`Error scraping catalog ${catalogUrl}:`, error);
    return { images, products };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { supplierIds, limit = 5 } = await req.json();
    
    // Get suppliers to process
    let query = supabase
      .from('equipment_suppliers')
      .select('id, name, category, catalog_url')
      .not('catalog_url', 'is', null);
    
    if (supplierIds && supplierIds.length > 0) {
      query = query.in('id', supplierIds);
    }
    
    const { data: suppliers, error: suppliersError } = await query.limit(limit);
    
    if (suppliersError) {
      throw suppliersError;
    }

    console.log(`Processing ${suppliers?.length || 0} suppliers`);
    
    const results: any[] = [];
    
    for (const supplier of (suppliers || []) as EquipmentSupplier[]) {
      console.log(`Processing supplier: ${supplier.name} (${supplier.category})`);
      
      // First, ensure manufacturer exists
      let { data: manufacturer } = await supabase
        .from('manufacturers')
        .select('id')
        .eq('name', supplier.name)
        .single();
      
      if (!manufacturer) {
        // Create manufacturer
        const { data: newManufacturer, error: createError } = await supabase
          .from('manufacturers')
          .insert({
            name: supplier.name,
            website: supplier.catalog_url,
          })
          .select('id')
          .single();
        
        if (createError) {
          console.error(`Failed to create manufacturer ${supplier.name}:`, createError);
          continue;
        }
        manufacturer = newManufacturer;
      }
      
      // Try DirectIndustry first (better product images)
      let scraped = await scrapeDirectIndustryImages(
        supplier.name,
        supplier.category,
        firecrawlApiKey
      );
      
      // If no results, try the catalog URL directly
      if (scraped.products.length === 0 && supplier.catalog_url) {
        scraped = await scrapeCatalogImages(
          supplier.catalog_url,
          supplier.name,
          firecrawlApiKey
        );
      }
      
      console.log(`Found ${scraped.products.length} products for ${supplier.name}`);
      
      // Insert materials for each product found
      let materialsCreated = 0;
      for (const product of scraped.products) {
        // Check if material already exists
        const { data: existing } = await supabase
          .from('materials')
          .select('id')
          .eq('manufacturer_id', manufacturer.id)
          .eq('product_name', product.name)
          .single();
        
        if (!existing) {
          const { error: insertError } = await supabase
            .from('materials')
            .insert({
              manufacturer_id: manufacturer.id,
              category: supplier.category,
              title: product.name.split(' ').slice(0, 3).join(' '),
              product_name: product.name,
              image_url: product.image,
              datasheet_url: supplier.catalog_url,
              rating: 4.5,
              purchase_count: Math.floor(Math.random() * 100),
            });
          
          if (insertError) {
            console.error(`Failed to insert material:`, insertError);
          } else {
            materialsCreated++;
          }
        }
      }
      
      results.push({
        supplier: supplier.name,
        category: supplier.category,
        productsFound: scraped.products.length,
        materialsCreated,
      });
      
      // Rate limit to avoid API issues
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error populating materials:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});