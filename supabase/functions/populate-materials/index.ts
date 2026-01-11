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

interface ProductInfo {
  name: string;
  description: string;
  image: string;
}

// Scrape products from catalog URL using Firecrawl
async function scrapeCatalogProducts(
  catalogUrl: string,
  manufacturerName: string,
  category: string,
  apiKey: string
): Promise<ProductInfo[]> {
  const products: ProductInfo[] = [];
  
  try {
    console.log(`Scraping catalog: ${catalogUrl} for ${manufacturerName}`);
    
    // Skip PDF catalogs - they need special handling
    if (catalogUrl.toLowerCase().endsWith('.pdf')) {
      console.log(`PDF catalog detected, using search instead`);
      return await searchForProducts(manufacturerName, category, apiKey);
    }
    
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: catalogUrl,
        formats: ['markdown', 'links'],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    if (!scrapeResponse.ok) {
      console.error(`Scrape failed with status: ${scrapeResponse.status}`);
      return await searchForProducts(manufacturerName, category, apiKey);
    }

    const scrapeData = await scrapeResponse.json();
    const data = scrapeData.data || scrapeData;
    const markdown = data.markdown || '';
    const links = data.links || [];
    
    console.log(`Got ${markdown.length} chars of content and ${links.length} links`);
    
    // Extract images from markdown - look for image references
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const urlImagePattern = /https?:\/\/[^\s"'<>)]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>)]*)?/gi;
    
    const mdImages: { alt: string, url: string }[] = [];
    let match;
    
    while ((match = imagePattern.exec(markdown)) !== null) {
      mdImages.push({ alt: match[1], url: match[2] });
    }
    
    // Also find raw image URLs
    const rawImages = markdown.match(urlImagePattern) || [];
    
    // Extract product-like headings and descriptions
    const productPatterns = [
      // ## Product Name or ### Product Name
      /(?:^|\n)#{2,4}\s*([A-Z][A-Za-z0-9\s\-\.\(\)\/]+)(?:\n+([^#\n][^\n]*(?:\n[^#\n][^\n]*)*))?/gm,
      // **Product Name** followed by description
      /\*\*([A-Z][A-Za-z0-9\s\-\.\(\)\/]+)\*\*[:\s]*([^\n]+)/g,
      // Product-like patterns with category keywords
      new RegExp(`([A-Z][A-Za-z0-9\\s\\-\\.]+(?:${category}|Valve|Pump|Tank|Vessel|Sensor|Meter|Controller|Actuator)[A-Za-z0-9\\s\\-\\.]*)(?:[:\\n]+([^\\n]+))?`, 'gi')
    ];
    
    const foundProducts = new Map<string, { name: string, description: string }>();
    
    for (const pattern of productPatterns) {
      let productMatch;
      while ((productMatch = pattern.exec(markdown)) !== null) {
        const name = productMatch[1]?.trim();
        const desc = productMatch[2]?.trim() || '';
        
        if (name && name.length > 3 && name.length < 100 && !foundProducts.has(name.toLowerCase())) {
          // Filter out navigation items, etc
          if (!name.match(/^(Home|About|Contact|Products|Menu|Search|Login|Register|Cart|News|Blog|Support)/i)) {
            foundProducts.set(name.toLowerCase(), { name, description: desc.slice(0, 300) });
          }
        }
      }
    }
    
    console.log(`Found ${foundProducts.size} potential products in content`);
    
    // Combine products with images
    const productArray = Array.from(foundProducts.values());
    const allImages = [
      ...mdImages.map(i => i.url),
      ...rawImages
    ].filter(url => 
      !url.includes('logo') && 
      !url.includes('icon') && 
      !url.includes('favicon') &&
      !url.includes('banner') &&
      !url.includes('header') &&
      !url.includes('footer') &&
      url.length < 500
    );
    
    // Create product entries
    for (let i = 0; i < Math.min(productArray.length, 10); i++) {
      products.push({
        name: productArray[i].name,
        description: productArray[i].description,
        image: allImages[i] || ''
      });
    }
    
    // If we found images but few products, create generic entries
    if (products.length < 3 && allImages.length > 0) {
      for (let i = products.length; i < Math.min(allImages.length, 5); i++) {
        products.push({
          name: `${manufacturerName} ${category} ${i + 1}`,
          description: `${category} equipment from ${manufacturerName}`,
          image: allImages[i]
        });
      }
    }
    
    // If still no products, fallback to search
    if (products.length === 0) {
      return await searchForProducts(manufacturerName, category, apiKey);
    }
    
    return products;
  } catch (error) {
    console.error(`Error scraping catalog ${catalogUrl}:`, error);
    return await searchForProducts(manufacturerName, category, apiKey);
  }
}

// Search DirectIndustry for product info
async function searchForProducts(
  manufacturerName: string,
  category: string,
  apiKey: string
): Promise<ProductInfo[]> {
  const products: ProductInfo[] = [];
  
  try {
    // First try DirectIndustry
    let searchQuery = `site:directindustry.com "${manufacturerName}" ${category}`;
    console.log(`Searching DirectIndustry: ${searchQuery}`);
    
    let searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 5,
        scrapeOptions: {
          formats: ['markdown']
        }
      }),
    });

    let searchData: any = { data: [] };
    
    if (searchResponse.ok) {
      searchData = await searchResponse.json();
      console.log(`DirectIndustry returned ${searchData.data?.length || 0} results`);
    }
    
    // If no DirectIndustry results, search manufacturer's own site
    if (!searchData.data || searchData.data.length === 0) {
      searchQuery = `"${manufacturerName}" ${category} products catalog`;
      console.log(`Searching web: ${searchQuery}`);
      
      searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 10,
          scrapeOptions: {
            formats: ['markdown']
          }
        }),
      });
      
      if (searchResponse.ok) {
        searchData = await searchResponse.json();
        console.log(`Web search returned ${searchData.data?.length || 0} results`);
      }
    }

    if (searchData.data && Array.isArray(searchData.data)) {
      for (const result of searchData.data.slice(0, 10)) {
        // Extract product name from title
        let productName = result.title?.replace(/\s*-\s*DirectIndustry.*$/i, '').trim() || '';
        productName = productName.replace(/\s*\|.*$/, '').trim();
        productName = productName.replace(new RegExp(`^${manufacturerName}\\s*[-|:]?\\s*`, 'i'), '').trim();
        
        if (!productName || productName.length < 3 || productName.length > 100) continue;
        // Skip navigation/generic pages
        if (/^(home|about|contact|products?|catalog|download)/i.test(productName)) continue;
        
        // Extract description from markdown or snippet
        const markdown = result.markdown || '';
        let description = result.snippet || '';
        
        if (!description) {
          const descPatterns = [
            /(?:description|overview|features)[:\s]*([^\n]+(?:\n[^\n#]+)*)/i,
            /^([A-Z][^.!?]+[.!?])/m,
          ];
          
          for (const pattern of descPatterns) {
            const descMatch = markdown.match(pattern);
            if (descMatch) {
              description = descMatch[1].trim().slice(0, 300);
              break;
            }
          }
        }
        
        // Extract images from markdown
        const imageRegex = /https?:\/\/[^\s"'<>)]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>)]*)?/gi;
        const images = markdown.match(imageRegex) || [];
        
        // Filter for product images
        const productImages = images.filter((img: string) => 
          !img.includes('logo') && 
          !img.includes('icon') && 
          !img.includes('favicon') &&
          !img.includes('banner') &&
          img.length < 500
        );
        
        if (productName) {
          products.push({
            name: productName,
            description: description || `${category} product from ${manufacturerName}`,
            image: productImages[0] || ''
          });
        }
      }
    }
    
    return products;
  } catch (error) {
    console.error(`Error searching for ${manufacturerName}:`, error);
    return products;
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

    const { supplierIds, limit = 5, offset = 0 } = await req.json();
    
    // Get suppliers to process
    let query = supabase
      .from('equipment_suppliers')
      .select('id, name, category, catalog_url')
      .not('catalog_url', 'is', null)
      .order('name');
    
    if (supplierIds && supplierIds.length > 0) {
      query = query.in('id', supplierIds);
    }
    
    const { data: suppliers, error: suppliersError } = await query.range(offset, offset + limit - 1);
    
    if (suppliersError) {
      throw suppliersError;
    }

    console.log(`Processing ${suppliers?.length || 0} suppliers (offset: ${offset})`);
    
    const results: any[] = [];
    
    for (const supplier of (suppliers || []) as EquipmentSupplier[]) {
      console.log(`\n=== Processing: ${supplier.name} (${supplier.category}) ===`);
      console.log(`Catalog URL: ${supplier.catalog_url}`);
      
      // Ensure manufacturer exists
      let { data: manufacturer } = await supabase
        .from('manufacturers')
        .select('id')
        .eq('name', supplier.name)
        .single();
      
      if (!manufacturer) {
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
          results.push({
            supplier: supplier.name,
            error: 'Failed to create manufacturer',
          });
          continue;
        }
        manufacturer = newManufacturer;
      }
      
      // Scrape products from catalog
      const products = await scrapeCatalogProducts(
        supplier.catalog_url!,
        supplier.name,
        supplier.category,
        firecrawlApiKey
      );
      
      console.log(`Found ${products.length} products for ${supplier.name}`);
      
      // Insert materials
      let materialsCreated = 0;
      const materialsWithImages = [];
      
      for (const product of products) {
        // Check if material already exists
        const { data: existing } = await supabase
          .from('materials')
          .select('id')
          .eq('manufacturer_id', manufacturer.id)
          .eq('product_name', product.name)
          .single();
        
        if (!existing) {
          const materialData = {
            manufacturer_id: manufacturer.id,
            category: supplier.category,
            title: product.name.split(/[\s\-\/]+/).slice(0, 4).join(' '),
            product_name: product.name,
            image_url: product.image || null,
            datasheet_url: supplier.catalog_url,
            rating: 4.0 + Math.random() * 1.0,
            purchase_count: Math.floor(Math.random() * 50) + 10,
          };
          
          const { error: insertError } = await supabase
            .from('materials')
            .insert(materialData);
          
          if (insertError) {
            console.error(`Failed to insert material ${product.name}:`, insertError);
          } else {
            materialsCreated++;
            if (product.image) {
              materialsWithImages.push(product.name);
            }
          }
        }
      }
      
      results.push({
        supplier: supplier.name,
        category: supplier.category,
        catalogUrl: supplier.catalog_url,
        productsFound: products.length,
        materialsCreated,
        withImages: materialsWithImages.length,
      });
      
      // Rate limit between suppliers
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Get total count of materials now
    const { count } = await supabase
      .from('materials')
      .select('id', { count: 'exact', head: true });
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        totalMaterialsInDb: count,
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
