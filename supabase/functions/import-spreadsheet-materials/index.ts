import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandData {
  name: string;
  category: string;
  catalogUrls: string[];
}

// All brands from the spreadsheet
const spreadsheetBrands: BrandData[] = [
  // VALVES
  { name: "Balon Corporation", category: "Valves", catalogUrls: ["https://www.balon.com/downloads/CompleteCatalog.pdf"] },
  { name: "Bray International", category: "Valves", catalogUrls: ["https://www.bray.com/docs/default-source/brochures/product-brochures/en_bpac_1003_maxicheck.pdf", "https://www.bray.com/docs/default-source/brochures/product-brochures/en_bpac_1001_ezivac.pdf"] },
  { name: "Kimray", category: "Valves", catalogUrls: ["https://kimray.com/products"] },
  { name: "Franklin Valve", category: "Valves", catalogUrls: ["https://www.franklinvalve.com/Assets/franklin-valve-dbb-brochure-november-2025.pdf"] },
  { name: "Flowserve", category: "Valves", catalogUrls: ["https://www.flowserve.com/products/products-catalog/valves"] },
  { name: "Fisher", category: "Valves", catalogUrls: ["https://www.emerson.com/documents/automation/brochure-catalog-of-fisher-control-valves-instruments-en-11736646.pdf"] },
  { name: "Cameron", category: "Valves", catalogUrls: ["https://www.slb.com/valves"] },
  { name: "Velan", category: "Valves", catalogUrls: ["https://www.velan.com/products"] },
  { name: "Bonney Forge", category: "Valves", catalogUrls: ["https://bonneyforge.com/products/valves.php"] },
  { name: "Victaulic", category: "Valves", catalogUrls: ["https://www.victaulic.com/vtc_product_categories/ball/"] },
  { name: "Warren Valve", category: "Valves", catalogUrls: ["https://www.warrenvalve.com/products"] },
  { name: "Mercer", category: "Valves", catalogUrls: ["https://www.mercervalve.net/products/"] },
  { name: "Taylor Valve", category: "Valves", catalogUrls: ["https://taylorvalve.com/product/taylor-valve-products/safety-relief-valves/"] },
  { name: "SCV Valve", category: "Valves", catalogUrls: ["https://www.scvvalve.com/products"] },
  { name: "WKM", category: "Valves", catalogUrls: ["https://www.valvesalesinc.com/brands/wkm"] },
  { name: "PBV", category: "Valves", catalogUrls: ["https://f-e-t.com/products/valves"] },
  { name: "KF Industries", category: "Valves", catalogUrls: ["https://www.kfvalves.com/products"] },
  { name: "Wheatley", category: "Valves", catalogUrls: ["https://www.americanwheatley.com/products"] },
  { name: "Crosby", category: "Valves", catalogUrls: ["https://www.emerson.com/en-us/automation/crosby"] },
  { name: "Crane Co", category: "Valves", catalogUrls: ["https://www.craneco.com/industrial-valves"] },
  { name: "Baker Hughes", category: "Valves", catalogUrls: ["https://www.bakerhughes.com/products/valves"] },
  { name: "Kitz Corp", category: "Valves", catalogUrls: ["https://www.kitzus.com/products/valves"] },
  { name: "Danfoss", category: "Valves", catalogUrls: ["https://www.danfoss.com/en/products/dcv/valves-accessories/"] },
  { name: "AVK", category: "Valves", catalogUrls: ["https://www.avkvalves.com/products"] },
  { name: "Swagelok", category: "Valves", catalogUrls: ["https://www.swagelok.com/en/catalog/Products/Valve"] },
  { name: "SPX Flow", category: "Valves", catalogUrls: ["https://www.spxflow.com/en/Products/Valves"] },
  { name: "Neway Valve", category: "Valves", catalogUrls: ["https://www.newayvalve.com/products"] },
  { name: "GVC", category: "Valves", catalogUrls: ["https://globalvalveandcontrols.com/products"] },
  
  // AUTOMATION
  { name: "Emerson Rosemount", category: "Automation", catalogUrls: ["https://www.emerson.com/en-us/automation/rosemount"] },
  { name: "Endress+Hauser", category: "Automation", catalogUrls: ["https://www.endress.com/en/products"] },
  { name: "Siemens Process Instrumentation", category: "Automation", catalogUrls: ["https://www.siemens.com/us/en/products/automation/process-instrumentation.html"] },
  { name: "Honeywell Process Solutions", category: "Automation", catalogUrls: ["https://process.honeywell.com/us/en"] },
  { name: "Rockwell Automation", category: "Automation", catalogUrls: ["https://www.rockwellautomation.com/en-us/tools/product-catalog.html"] },
  { name: "Schneider Electric", category: "Automation", catalogUrls: ["https://www.se.com/us/en/work/products/industrial-automation/"] },
  { name: "ABB Automation", category: "Automation", catalogUrls: ["https://new.abb.com/process-automation/measurements"] },
  { name: "Yokogawa", category: "Automation", catalogUrls: ["https://www.yokogawa.com/solutions/products-systems/"] },
  { name: "KROHNE", category: "Automation", catalogUrls: ["https://www.krohne.com/en/products-solutions/"] },
  { name: "WIKA", category: "Automation", catalogUrls: ["https://www.wika.com/en-us/products.html"] },
  { name: "Pepperl+Fuchs", category: "Automation", catalogUrls: ["https://www.pepperl-fuchs.com/global/en/"] },
  { name: "IFM Efector", category: "Automation", catalogUrls: ["https://www.ifm.com/us/en/product/"] },
  { name: "Phoenix Contact", category: "Automation", catalogUrls: ["https://www.phoenixcontact.com/en-us/products"] },
  { name: "Mitsubishi Electric", category: "Automation", catalogUrls: ["https://us.mitsubishielectric.com/fa/en/"] },
  { name: "Omron Automation", category: "Automation", catalogUrls: ["https://automation.omron.com/en/us/"] },
  { name: "Brooks Instrument", category: "Automation", catalogUrls: ["https://www.brooksinstrument.com/en/products"] },
  { name: "FCI Flow", category: "Automation", catalogUrls: ["https://www.fluidcomponents.com/products"] },
  { name: "GE Panametrics", category: "Automation", catalogUrls: ["https://www.gemeasurement.com/"] },
  { name: "MSA Safety", category: "Automation", catalogUrls: ["https://www.msanet.com/products"] },
  
  // TANKS
  { name: "Petrosmith", category: "Tanks", catalogUrls: ["https://petrosmith.com/tanks/"] },
  { name: "PermianLide", category: "Tanks", catalogUrls: ["https://www.permianlide.com/"] },
  { name: "Fox Tank Company", category: "Tanks", catalogUrls: ["https://foxtankcompany.com/"] },
  { name: "Warrior Tank", category: "Tanks", catalogUrls: ["https://www.warriortank.com/"] },
  { name: "Global Vessel & Tank", category: "Tanks", catalogUrls: ["https://www.globalvesselandtank.com/storage-tanks"] },
  { name: "LONG Industries", category: "Tanks", catalogUrls: ["https://longindustries.us/tanks/"] },
  { name: "CST Industries", category: "Tanks", catalogUrls: ["https://www.cstindustries.com/oil-gas/"] },
  { name: "Newberry Tanks", category: "Tanks", catalogUrls: ["https://newberrytanks.com/products/vertical-api-tanks/"] },
  { name: "Advance Tank", category: "Tanks", catalogUrls: ["https://advancetank.com/"] },
  { name: "Highland Tank", category: "Tanks", catalogUrls: ["https://www.highlandtank.com/api-650-storage-tanks-for-the-oil-natural-gas-industry/"] },
  { name: "Tank Connection", category: "Tanks", catalogUrls: ["https://tankconnection.com/"] },
  { name: "Manchester Tank", category: "Tanks", catalogUrls: ["https://www.manchestertank.com/"] },
  
  // VESSELS
  { name: "Houston Vessel Manufacturing", category: "Vessels", catalogUrls: ["https://www.houstonvessel.com/pressure-vessels"] },
  { name: "PBP Fabrication", category: "Vessels", catalogUrls: ["https://pbpfab.com/products/pressure-vessels"] },
  { name: "Granite Peak Fabrication", category: "Vessels", catalogUrls: ["https://granitepeakfabrication.com/products-services/asme-vessels"] },
  { name: "Buckeye Fabricating", category: "Vessels", catalogUrls: ["https://buckeyefabricating.com/pressure-vessels"] },
  { name: "Roben Manufacturing", category: "Vessels", catalogUrls: ["https://robenmfg.com/roben-asme-pressure-vessels"] },
  { name: "Metalforms", category: "Vessels", catalogUrls: ["https://www.metalformshx.com/asme-pressure-vessel-fabrication"] },
  { name: "Tex-Fab", category: "Vessels", catalogUrls: ["https://www.texfab.com/services-pressure-vessels.php"] },
  { name: "EML Manufacturing", category: "Vessels", catalogUrls: ["https://emlmanufacturing.com/pressure-vessel"] },
  { name: "Didion Vessel", category: "Vessels", catalogUrls: ["https://didionvessel.com/pressure-vessels"] },
  { name: "TransTech Energy", category: "Vessels", catalogUrls: ["https://www.transtechenergy.com/asme-pressure-vessel-fabrication-services"] },
  { name: "H+M Industrial", category: "Vessels", catalogUrls: ["https://www.hm-ec.com/hm-services/pressure-vessel-fabrication-in-houston-tx"] },
  { name: "Energy Weldfab", category: "Vessels", catalogUrls: ["https://www.energyweldfab.com/oil-gas-equipment"] },
  { name: "Samuel Pressure Vessel", category: "Vessels", catalogUrls: ["https://www.samuelpressurevesselgroup.com/pressure-vessels"] },
  { name: "Precision Custom Components", category: "Vessels", catalogUrls: ["https://www.pccenergy.com/capabilities/pressure-vessels"] },
  { name: "APEX Engineered Products", category: "Vessels", catalogUrls: ["https://www.apexep.com/products/pressure-vessels"] },
  { name: "Modern Welding Company", category: "Vessels", catalogUrls: ["https://www.modweldco.com/pressure-vessels"] },
  { name: "Ascension Industries", category: "Vessels", catalogUrls: ["https://www.ascensionindustries.com/pressure-vessels"] },
  { name: "Steel Structures Inc", category: "Vessels", catalogUrls: ["https://www.steelstructuresinc.com/capabilities"] },
  { name: "Steel-Pro Inc", category: "Vessels", catalogUrls: ["https://www.steelpro-inc.com/pressure-vessels"] },
  
  // PUMPS
  { name: "Goulds Pumps", category: "Pumps", catalogUrls: ["https://www.xylem.com/en-us/brands/goulds-pumps/"] },
  { name: "Flowserve Pumps", category: "Pumps", catalogUrls: ["https://www.flowserve.com/products/products-catalog/pumps"] },
  { name: "Sulzer", category: "Pumps", catalogUrls: ["https://www.sulzer.com/en/products/pumps"] },
  { name: "KSB", category: "Pumps", catalogUrls: ["https://www.ksb.com/en-us/products/pumps"] },
  { name: "Nikkiso", category: "Pumps", catalogUrls: ["https://www.nikkiso.com/products/pump/"] },
  { name: "Grundfos", category: "Pumps", catalogUrls: ["https://product-selection.grundfos.com/us/products"] },
  { name: "Weir Warman", category: "Pumps", catalogUrls: ["https://www.global.weir/products/warman-pumps/"] },
  { name: "Gorman-Rupp", category: "Pumps", catalogUrls: ["https://www.gormanrupp.com/products"] },
  { name: "Ebara", category: "Pumps", catalogUrls: ["https://www.ebara.com/en/products/pump"] },
  { name: "Pentair", category: "Pumps", catalogUrls: ["https://www.pentair.com/en/products/pumps.html"] },
  { name: "Cornell Pump", category: "Pumps", catalogUrls: ["https://www.cornellpump.com/products"] },
  { name: "Blackmer", category: "Pumps", catalogUrls: ["https://www.psgdover.com/brands/blackmer"] },
  { name: "Pulsafeeder", category: "Pumps", catalogUrls: ["https://www.pulsafeeder.com/products"] },
  { name: "Seepex", category: "Pumps", catalogUrls: ["https://www.seepex.com/products"] },
  { name: "Wilden", category: "Pumps", catalogUrls: ["https://www.psgdover.com/brands/wilden"] },
  { name: "Hydra-Cell", category: "Pumps", catalogUrls: ["https://www.hydra-cell.com/products"] },
  { name: "Netzsch Pumps", category: "Pumps", catalogUrls: ["https://pumps.netzsch.com/products"] },
];

interface ProductInfo {
  name: string;
  description: string;
  image: string;
  modelNumber?: string;
}

// Search for products using Firecrawl
async function searchForProducts(
  manufacturerName: string,
  category: string,
  apiKey: string
): Promise<ProductInfo[]> {
  const products: ProductInfo[] = [];
  
  try {
    // Search DirectIndustry first for better product data
    let searchQuery = `site:directindustry.com "${manufacturerName}" ${category}`;
    console.log(`Searching: ${searchQuery}`);
    
    let searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 8,
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
    
    // If no DirectIndustry results, search the web
    if (!searchData.data || searchData.data.length === 0) {
      searchQuery = `"${manufacturerName}" ${category} products specifications`;
      console.log(`Fallback search: ${searchQuery}`);
      
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
        
        if (!productName || productName.length < 3 || productName.length > 120) continue;
        // Skip navigation/generic pages
        if (/^(home|about|contact|products?|catalog|download|careers|news|blog)/i.test(productName)) continue;
        
        // Extract description from markdown or snippet
        const markdown = result.markdown || '';
        let description = result.snippet || '';
        
        if (!description) {
          const descPatterns = [
            /(?:description|overview|features|specifications)[:\s]*([^\n]+(?:\n[^\n#]+)*)/i,
            /^([A-Z][^.!?]+[.!?])/m,
          ];
          
          for (const pattern of descPatterns) {
            const descMatch = markdown.match(pattern);
            if (descMatch) {
              description = descMatch[1].trim().slice(0, 400);
              break;
            }
          }
        }
        
        // Extract model number if present
        const modelMatch = productName.match(/\b([A-Z]{1,4}[-\s]?\d{2,6}[A-Z]?)\b/);
        const modelNumber = modelMatch ? modelMatch[1] : undefined;
        
        // Extract images from markdown
        const imageRegex = /https?:\/\/[^\s"'<>)]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>)]*)?/gi;
        const images = markdown.match(imageRegex) || [];
        
        // Filter for product images
        const productImages = images.filter((img: string) => 
          !img.includes('logo') && 
          !img.includes('icon') && 
          !img.includes('favicon') &&
          !img.includes('banner') &&
          !img.includes('avatar') &&
          !img.includes('placeholder') &&
          img.length < 500
        );
        
        if (productName) {
          products.push({
            name: productName,
            description: description || `${category} product from ${manufacturerName}`,
            image: productImages[0] || '',
            modelNumber
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

    const { startIndex = 0, batchSize = 5, category } = await req.json();
    
    // Filter brands by category if specified
    let brandsToProcess = spreadsheetBrands;
    if (category) {
      brandsToProcess = spreadsheetBrands.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }
    
    // Get the batch to process
    const batch = brandsToProcess.slice(startIndex, startIndex + batchSize);
    
    console.log(`Processing batch of ${batch.length} brands starting at index ${startIndex}`);
    console.log(`Total brands in category: ${brandsToProcess.length}`);
    
    const results: any[] = [];
    let totalMaterialsCreated = 0;
    
    for (const brand of batch) {
      console.log(`\n=== Processing: ${brand.name} (${brand.category}) ===`);
      
      // Ensure manufacturer exists
      let { data: manufacturer } = await supabase
        .from('manufacturers')
        .select('id')
        .eq('name', brand.name)
        .maybeSingle();
      
      if (!manufacturer) {
        const { data: newManufacturer, error: createError } = await supabase
          .from('manufacturers')
          .insert({
            name: brand.name,
            website: brand.catalogUrls[0],
          })
          .select('id')
          .single();
        
        if (createError) {
          console.error(`Failed to create manufacturer ${brand.name}:`, createError);
          results.push({
            brand: brand.name,
            category: brand.category,
            error: 'Failed to create manufacturer',
          });
          continue;
        }
        manufacturer = newManufacturer;
      }
      
      // Search for products
      const products = await searchForProducts(
        brand.name,
        brand.category,
        firecrawlApiKey
      );
      
      console.log(`Found ${products.length} products for ${brand.name}`);
      
      // Insert materials
      let materialsCreated = 0;
      
      for (const product of products) {
        // Check if material already exists
        const { data: existing } = await supabase
          .from('materials')
          .select('id')
          .eq('manufacturer_id', manufacturer.id)
          .eq('product_name', product.name)
          .maybeSingle();
        
        if (!existing) {
          const materialData = {
            manufacturer_id: manufacturer.id,
            category: brand.category,
            title: product.name.split(/[\s\-\/]+/).slice(0, 5).join(' '),
            product_name: product.name,
            image_url: product.image || null,
            datasheet_url: brand.catalogUrls[0],
            model_number: product.modelNumber || null,
            rating: 4.0 + Math.random() * 1.0,
            purchase_count: Math.floor(Math.random() * 100) + 10,
          };
          
          const { error: insertError } = await supabase
            .from('materials')
            .insert(materialData);
          
          if (insertError) {
            console.error(`Failed to insert material ${product.name}:`, insertError);
          } else {
            materialsCreated++;
            totalMaterialsCreated++;
          }
        }
      }
      
      results.push({
        brand: brand.name,
        category: brand.category,
        productsFound: products.length,
        materialsCreated,
      });
      
      // Rate limit between brands
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Get total count of materials now
    const { count: totalMaterials } = await supabase
      .from('materials')
      .select('id', { count: 'exact', head: true });
    
    // Get count by category
    const { data: categoryCounts } = await supabase
      .from('materials')
      .select('category')
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        data?.forEach(m => {
          counts[m.category] = (counts[m.category] || 0) + 1;
        });
        return { data: counts };
      });
    
    return new Response(
      JSON.stringify({
        success: true,
        processedBrands: results.length,
        totalBrandsInSpreadsheet: spreadsheetBrands.length,
        nextIndex: startIndex + batch.length,
        hasMore: startIndex + batch.length < brandsToProcess.length,
        materialsCreatedThisBatch: totalMaterialsCreated,
        totalMaterialsInDb: totalMaterials,
        materialsByCategory: categoryCounts,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error importing materials:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
