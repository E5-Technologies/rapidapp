import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  name: string;
  description?: string;
  imageUrl?: string;
  modelNumber?: string;
  specifications?: string;
}

// Product type variations for each category to maximize search results
const categoryProductTypes: Record<string, string[]> = {
  'Valves': [
    'ball valve', 'gate valve', 'globe valve', 'butterfly valve', 'check valve',
    'needle valve', 'plug valve', 'diaphragm valve', 'pinch valve', 'knife gate valve',
    'pressure relief valve', 'safety valve', 'control valve', 'solenoid valve',
    'pneumatic valve', 'hydraulic valve', 'steam valve', 'cryogenic valve',
    'triple offset valve', 'double block valve', 'actuated valve', 'manual valve',
    'isolation valve', 'throttling valve', 'mixing valve', 'pressure reducing valve',
    'float valve', 'foot valve', 'air valve', 'vacuum valve', 'angle valve',
    'sanitary valve', 'high pressure valve', 'low pressure valve', 'flanged valve',
    'threaded valve', 'wafer valve', 'lug valve', 'knife valve', 'slide gate valve'
  ],
  'Pumps': [
    'centrifugal pump', 'positive displacement pump', 'submersible pump', 'booster pump',
    'gear pump', 'piston pump', 'diaphragm pump', 'peristaltic pump', 'screw pump',
    'vane pump', 'lobe pump', 'progressive cavity pump', 'jet pump', 'vacuum pump',
    'metering pump', 'dosing pump', 'sump pump', 'sewage pump', 'slurry pump',
    'chemical pump', 'fire pump', 'irrigation pump', 'industrial pump', 'process pump',
    'magnetic drive pump', 'vertical pump', 'horizontal pump', 'multistage pump',
    'self-priming pump', 'end suction pump', 'split case pump', 'axial pump',
    'mixed flow pump', 'reciprocating pump', 'rotary pump', 'hydraulic pump'
  ],
  'Tanks': [
    'storage tank', 'pressure vessel', 'process tank', 'chemical tank', 'fuel tank',
    'water tank', 'mixing tank', 'reactor vessel', 'heat exchanger', 'separator',
    'accumulator', 'receiver tank', 'day tank', 'surge tank', 'buffer tank',
    'IBC container', 'tote tank', 'drum', 'intermediate bulk container', 'silo',
    'hopper', 'bin', 'fermenter', 'bioreactor', 'crystallizer', 'agitated vessel',
    'jacketed tank', 'insulated tank', 'double wall tank', 'underground tank',
    'above ground tank', 'mobile tank', 'transport tank', 'ISO container'
  ],
  'Instrumentation': [
    'pressure transmitter', 'temperature transmitter', 'level transmitter', 'flow transmitter',
    'pressure gauge', 'temperature gauge', 'level gauge', 'flow meter', 'mass flow meter',
    'ultrasonic flow meter', 'magnetic flow meter', 'coriolis meter', 'vortex meter',
    'turbine meter', 'positive displacement meter', 'differential pressure transmitter',
    'RTD sensor', 'thermocouple', 'pyrometer', 'infrared thermometer', 'humidity sensor',
    'pH meter', 'conductivity meter', 'dissolved oxygen meter', 'turbidity meter',
    'gas analyzer', 'oxygen analyzer', 'chromatograph', 'spectrometer', 'density meter',
    'viscometer', 'radar level', 'ultrasonic level', 'guided wave radar', 'capacitance probe'
  ],
  'Electrical': [
    'electric motor', 'variable frequency drive', 'VFD', 'motor starter', 'soft starter',
    'switchgear', 'circuit breaker', 'contactor', 'relay', 'overload relay',
    'transformer', 'power supply', 'UPS', 'battery charger', 'inverter',
    'generator', 'alternator', 'servo motor', 'stepper motor', 'DC motor', 'AC motor',
    'explosion proof motor', 'ATEX motor', 'gearbox', 'gear reducer', 'coupling',
    'encoder', 'resolver', 'proximity sensor', 'limit switch', 'position sensor',
    'PLC', 'programmable controller', 'HMI', 'SCADA', 'DCS', 'control panel',
    'junction box', 'terminal block', 'cable gland', 'conduit', 'busbar'
  ],
  'PSV': [
    'pressure safety valve', 'pressure relief valve', 'safety relief valve', 'pilot operated valve',
    'spring loaded safety valve', 'balanced bellows valve', 'conventional safety valve',
    'rupture disc', 'bursting disc', 'explosion vent', 'vacuum relief valve',
    'thermal relief valve', 'pop safety valve', 'modulating relief valve',
    'ASME safety valve', 'API safety valve', 'high pressure relief', 'low pressure relief'
  ]
};

// Top manufacturers per category for deep crawling
const categoryManufacturers: Record<string, string[]> = {
  'Valves': [
    'Emerson', 'Flowserve', 'Cameron', 'Velan', 'Crane', 'KITZ', 'Parker', 'Swagelok',
    'Neles', 'Metso', 'Fisher', 'Bray', 'Pentair', 'Weir', 'IMI', 'Circor', 'AVK',
    'Bürkert', 'SAMSON', 'Honeywell', 'Belimo', 'Rotork', 'AUMA', 'Spirax Sarco',
    'TLV', 'ARI-Armaturen', 'GEMÜ', 'GF Piping', 'Danfoss', 'ITT', 'DeZurik',
    'Watts', 'Apollo', 'Nibco', 'Milwaukee', 'Stockham', 'Jamesbury', 'Xomox'
  ],
  'Pumps': [
    'Grundfos', 'Flowserve', 'KSB', 'Sulzer', 'Xylem', 'EBARA', 'Wilo', 'ITT Goulds',
    'Weir', 'RUHRPUMPEN', 'Tsurumi', 'Gorman-Rupp', 'Pentair', 'ANDRITZ', 'Verder',
    'Netzsch', 'Seepex', 'Viking', 'Blackmer', 'Wilden', 'Graco', 'SPX FLOW',
    'Sundyne', 'Peerless', 'Berkeley', 'Pedrollo', 'Lowara', 'Calpeda', 'SAER',
    'Ebara', 'Bornemann', 'IMO', 'Iwaki', 'Finish Thompson', 'Yamada', 'Aro'
  ],
  'Tanks': [
    'Chart Industries', 'Enerflex', 'CIMC', 'Worthington', 'Trinity', 'Highland Tank',
    'Snyder Industries', 'Assmann', 'Poly Processing', 'Tank Holdings', 'CST Industries',
    'DN Tanks', 'Caldwell', 'Tarsco', 'Fisher Tank', 'Modern Welding', 'Kennedy Tank',
    'Hamilton Tanks', 'General Industries', 'Containment Solutions', 'Xerxes',
    'ZCL Composites', 'Wessels', 'Flexcon', 'ASME Tanks', 'Buckeye', 'Steel Tank',
    'Newberry Tanks', 'Heil', 'Brenner', 'MAC LTT', 'Polar Tank', 'Wabash'
  ],
  'Instrumentation': [
    'Emerson', 'Endress+Hauser', 'Siemens', 'ABB', 'Honeywell', 'Yokogawa', 'KROHNE',
    'Vega', 'WIKA', 'Rosemount', 'Foxboro', 'Schneider Electric', 'Rockwell',
    'Omron', 'Pepperl+Fuchs', 'Turck', 'IFM', 'Sick', 'Banner', 'Balluff',
    'Dwyer', 'Ashcroft', 'Omega', 'Fluke', 'Testo', 'Ametek', 'Brooks',
    'Coriolis', 'Micro Motion', 'Promass', 'Prowirl', 'Prosonic', 'Micropilot'
  ],
  'Electrical': [
    'ABB', 'Siemens', 'Schneider Electric', 'Rockwell', 'Eaton', 'GE', 'WEG',
    'Nidec', 'Baldor', 'Marathon', 'Leeson', 'Regal', 'US Motors', 'Teco',
    'SEW-Eurodrive', 'Nord', 'Bonfiglioli', 'Sumitomo', 'Yaskawa', 'Mitsubishi',
    'Fanuc', 'Allen-Bradley', 'Danfoss', 'Lenze', 'Control Techniques', 'Parker',
    'Phoenix Contact', 'Weidmuller', 'Wago', 'Rittal', 'Hoffman', 'Hammond'
  ],
  'PSV': [
    'Emerson', 'Flowserve', 'Baker Hughes', 'Pentair', 'Leser', 'Crosby', 'Farris',
    'Consolidated', 'Anderson Greenwood', 'Sempell', 'Dresser', 'Masoneilan',
    'Target Rock', 'Broady', 'BESA', 'Mercer', 'Watts', 'Kunkle', 'Aquatrol',
    'BS&B', 'Fike', 'OSECO', 'Continental Disc', 'Elfab', 'Rembe'
  ]
};

// Industrial database sources
const industrialSources = [
  'directindustry.com',
  'thomasnet.com',
  'globalspec.com',
  'automation.com',
  'process-worldwide.com'
];

async function crawlWebsite(url: string, apiKey: string): Promise<ProductData[]> {
  const products: ProductData[] = [];
  
  try {
    // Map the website to get all product pages
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        limit: 500,
        includeSubdomains: true,
      }),
    });

    if (!mapResponse.ok) {
      console.log(`Map failed for ${url}`);
      return products;
    }

    const mapData = await mapResponse.json();
    const links = mapData.links || [];
    
    // Filter for product-related URLs
    const productLinks = links.filter((link: string) => 
      /product|catalog|item|model|series|spec/i.test(link)
    ).slice(0, 50); // Limit to 50 product pages per site

    console.log(`Found ${productLinks.length} product pages on ${url}`);

    // Scrape each product page
    for (const link of productLinks.slice(0, 20)) {
      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: link,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          const markdown = scrapeData.data?.markdown || '';
          const metadata = scrapeData.data?.metadata || {};

          // Extract product info from the page
          const titleMatch = markdown.match(/^#\s*(.+)/m) || 
                            markdown.match(/^##\s*(.+)/m);
          const name = titleMatch?.[1] || metadata.title?.split('|')[0]?.trim() || '';
          
          if (name && name.length > 5 && name.length < 200) {
            // Extract image URL from metadata or markdown
            const imageMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
            
            products.push({
              name: name.substring(0, 150),
              description: markdown.substring(0, 500),
              imageUrl: metadata.ogImage || imageMatch?.[1] || '',
              modelNumber: extractModelNumber(markdown),
            });
          }
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 200));
      } catch (e) {
        console.log(`Error scraping ${link}:`, e);
      }
    }
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
  }

  return products;
}

function extractModelNumber(text: string): string | undefined {
  // Common model number patterns
  const patterns = [
    /model[:\s]+([A-Z0-9\-]+)/i,
    /part\s*#?[:\s]+([A-Z0-9\-]+)/i,
    /p\/n[:\s]+([A-Z0-9\-]+)/i,
    /sku[:\s]+([A-Z0-9\-]+)/i,
    /item[:\s]+([A-Z0-9\-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

async function searchProducts(
  query: string,
  apiKey: string,
  limit: number = 20
): Promise<ProductData[]> {
  const products: ProductData[] = [];

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit,
        scrapeOptions: {
          formats: ['markdown']
        }
      }),
    });

    if (!response.ok) {
      console.log(`Search failed for: ${query}`);
      return products;
    }

    const data = await response.json();
    const results = data.data || [];

    for (const result of results) {
      const name = result.title?.split('|')[0]?.split('-')[0]?.trim() || '';
      if (name && name.length > 5 && name.length < 150) {
        // Try to extract image from the scraped content
        const markdown = result.markdown || '';
        const imageMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\)]+(?:jpg|jpeg|png|webp)[^\)]*)\)/i);
        const ogImage = result.metadata?.ogImage;
        
        products.push({
          name,
          description: result.description || markdown.substring(0, 300),
          imageUrl: ogImage || imageMatch?.[1] || '',
          modelNumber: extractModelNumber(markdown),
        });
      }
    }
  } catch (error) {
    console.error(`Search error for "${query}":`, error);
  }

  return products;
}

async function performDeepScrape(
  category: string,
  supabase: any,
  firecrawlApiKey: string,
  targetCount: number = 200,
  startTypeIndex: number = 0
): Promise<{ created: number; errors: number; lastTypeIndex: number }> {
  let created = 0;
  let errors = 0;
  const seenProducts = new Set<string>();
  let lastTypeIndex = startTypeIndex;

  const productTypes = categoryProductTypes[category] || [];
  const manufacturers = categoryManufacturers[category] || [];

  console.log(`\n=== Deep scraping ${category} (target: ${targetCount}, starting at type ${startTypeIndex}) ===`);

  // Strategy 1: Search for each product type (limited batch)
  const typesToProcess = productTypes.slice(startTypeIndex, startTypeIndex + 5); // Process 5 types at a time
  
  for (let i = 0; i < typesToProcess.length; i++) {
    const productType = typesToProcess[i];
    lastTypeIndex = startTypeIndex + i;
    
    if (created >= targetCount) break;

    // Search with multiple sources
    for (const source of industrialSources.slice(0, 2)) {
      if (created >= targetCount) break;

      const query = `site:${source} "${productType}" specifications`;
      console.log(`Searching: ${query}`);
      
      const products = await searchProducts(query, firecrawlApiKey, 10);
      
      for (const product of products) {
        if (created >= targetCount) break;
        
        const productKey = `${product.name.toLowerCase()}-${product.modelNumber || ''}`;
        if (seenProducts.has(productKey)) continue;
        seenProducts.add(productKey);

        // Find or create a manufacturer
        const manufacturerName = manufacturers[Math.floor(Math.random() * manufacturers.length)];
        
        let { data: manufacturer } = await supabase
          .from('manufacturers')
          .select('id')
          .eq('name', manufacturerName)
          .maybeSingle();

        if (!manufacturer) {
          const { data: newMfr } = await supabase
            .from('manufacturers')
            .insert({ name: manufacturerName })
            .select('id')
            .single();
          manufacturer = newMfr;
        }

        if (manufacturer) {
          const { error } = await supabase
            .from('materials')
            .insert({
              manufacturer_id: manufacturer.id,
              product_name: product.name.substring(0, 200),
              title: `${manufacturerName} ${product.name}`.substring(0, 250),
              image_url: product.imageUrl || null,
              model_number: product.modelNumber || null,
              category,
            });

          if (!error) {
            created++;
            if (created % 50 === 0) {
              console.log(`Progress: ${created}/${targetCount} for ${category}`);
            }
          } else {
            errors++;
          }
        }
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // Strategy 2: Search manufacturer + category combinations
  for (const manufacturer of manufacturers) {
    if (created >= targetCount) break;

    for (const productType of productTypes.slice(0, 10)) {
      if (created >= targetCount) break;

      const query = `"${manufacturer}" "${productType}" product specifications`;
      console.log(`Manufacturer search: ${query}`);
      
      const products = await searchProducts(query, firecrawlApiKey, 10);
      
      for (const product of products) {
        if (created >= targetCount) break;
        
        const productKey = `${manufacturer}-${product.name.toLowerCase()}`;
        if (seenProducts.has(productKey)) continue;
        seenProducts.add(productKey);

        let { data: mfr } = await supabase
          .from('manufacturers')
          .select('id')
          .eq('name', manufacturer)
          .maybeSingle();

        if (!mfr) {
          const { data: newMfr } = await supabase
            .from('manufacturers')
            .insert({ name: manufacturer })
            .select('id')
            .single();
          mfr = newMfr;
        }

        if (mfr) {
          const { error } = await supabase
            .from('materials')
            .insert({
              manufacturer_id: mfr.id,
              product_name: product.name.substring(0, 200),
              title: `${manufacturer} ${product.name}`.substring(0, 250),
              image_url: product.imageUrl || null,
              model_number: product.modelNumber || null,
              category,
            });

          if (!error) {
            created++;
          } else {
            errors++;
          }
        }
      }

      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`=== Completed ${category}: ${created} created, ${errors} errors, lastTypeIndex: ${lastTypeIndex} ===`);
  return { created, errors, lastTypeIndex };
}

Deno.serve(async (req) => {
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

    const { category, targetCount = 500 } = await req.json();

    if (!category) {
      return new Response(
        JSON.stringify({ success: false, error: 'Category is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate category
    const validCategories = ['Valves', 'Pumps', 'Tanks', 'Instrumentation', 'Electrical', 'PSV'];
    const normalizedCategory = validCategories.find(c => 
      c.toLowerCase() === category.toLowerCase()
    );

    if (!normalizedCategory) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid category. Valid: ${validCategories.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current count for this category
    const { count: currentCount } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true })
      .eq('category', normalizedCategory);

    console.log(`Starting deep scrape for ${normalizedCategory}. Current count: ${currentCount}`);

    // Perform the deep scrape
    const result = await performDeepScrape(
      normalizedCategory,
      supabase,
      firecrawlApiKey,
      Math.min(targetCount, 500) // Limit per call to avoid timeouts
    );

    // Get new count
    const { count: newCount } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true })
      .eq('category', normalizedCategory);

    // Get total count across all categories
    const { data: categoryStats } = await supabase
      .from('materials')
      .select('category');

    const breakdown: Record<string, number> = {};
    if (categoryStats) {
      for (const item of categoryStats) {
        breakdown[item.category] = (breakdown[item.category] || 0) + 1;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        category: normalizedCategory,
        previousCount: currentCount,
        newCount,
        created: result.created,
        errors: result.errors,
        categoryBreakdown: breakdown,
        totalMaterials: Object.values(breakdown).reduce((a, b) => a + b, 0),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in deep-crawl-products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
