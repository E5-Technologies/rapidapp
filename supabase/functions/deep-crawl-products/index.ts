import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Manufacturers from the spreadsheets with catalog URLs
const manufacturerData: Record<string, { manufacturers: string[], catalogBaseUrl: string }> = {
  'Valves': {
    manufacturers: [
      'Emerson', 'Flowserve', 'Crane', 'Velan', 'KITZ', 'Bürkert', 'Parker', 'Swagelok',
      'AVK', 'Bray', 'Neles', 'Metso', 'SAMSON', 'Spirax Sarco', 'ARI-Armaturen', 'ITT',
      'Honeywell', 'Belimo', 'Pentair', 'Weir', 'GF Piping Systems', 'Cameron', 'Danfoss',
      'Rotork', 'AUMA', 'TLV', 'Fisher', 'VAG', 'Mueller', 'Valvitalia', 'Neway',
      'Bonney Forge', 'Walworth', 'OMAL', 'Asahi', 'GEMÜ', 'Saunders', 'Böhmer', 'Habonim',
      'Armstrong', 'Milwaukee Valve', 'DeZurik', 'Watts', 'Apollo', 'Stockham', 'Nibco', 'Xomox'
    ],
    catalogBaseUrl: 'https://pdf.directindustry.com/pdf/'
  },
  'Pumps': {
    manufacturers: [
      'Grundfos', 'Flowserve', 'KSB', 'Sulzer', 'Xylem', 'RUHRPUMPEN', 'Gorman-Rupp', 'EBARA',
      'Verder', 'Tapflo', 'Seepex', 'Wilo', 'Johnson Pump', 'Tsurumi', 'ANDRITZ', 'Price Pump',
      'Haskel', 'SAER', 'Lutz', 'Brinkmann', 'Zenit', 'Pedrollo', 'Lowara', 'Calpeda',
      'Viking Pump', 'Netzsch', 'Bornemann', 'SPX FLOW', 'IMO Pump', 'Wilden', 'Aro',
      'Yamada', 'Iwaki', 'March Pump', 'Finish Thompson', 'Liquiflo', 'ITT Goulds', 'Weir',
      'Blackmer', 'Graco', 'Sundyne', 'Peerless', 'Berkeley'
    ],
    catalogBaseUrl: 'https://pdf.directindustry.com/pdf/'
  },
  'Tanks': {
    manufacturers: [
      'Snyder Industries', 'Assmann', 'Enduramaxx', 'Sintex', 'Roth', 'ZCL Composites',
      'Containment Solutions', 'CST Industries', 'Permastore', 'Superior Tank', 'Highland Tank',
      'TF Warren', 'Pfaudler', 'De Dietrich', 'Paul Mueller', 'GEA', 'Tetra Pak', 'Alfa Laval',
      'Walker Stainless', 'Apache Stainless', 'Lee Industries', 'Allegheny Bradford',
      'Tank Connection', 'McDermott', 'Caldwell Tanks', 'Chicago Bridge & Iron', 'Matrix Service',
      'DN Tanks', 'Worthington', 'Trinity', 'Chart Industries', 'CIMC', 'Wessels', 'Flexcon'
    ],
    catalogBaseUrl: 'https://pdf.directindustry.com/pdf/'
  },
  'Instrumentation': {
    manufacturers: [
      'Emerson', 'Rosemount', 'Yokogawa', 'Endress+Hauser', 'ABB', 'Siemens', 'Honeywell',
      'Schneider Electric', 'WIKA', 'VEGA', 'KROHNE', 'Azbil', 'Foxboro', 'Badger Meter',
      'SMAR', 'Fuji Electric', 'Baumer', 'ifm', 'Balluff', 'Pepperl+Fuchs', 'OMEGA',
      'Danfoss', 'Ashcroft', 'Setra', 'GE Measurement', 'Keller', 'Aplisens', 'BD Sensors',
      'Trafag', 'Magnetrol', 'SICK', 'Micro Motion', 'Turck', 'Banner', 'Dwyer', 'Fluke', 'Ametek'
    ],
    catalogBaseUrl: 'https://pdf.directindustry.com/pdf/'
  },
  'Electrical': {
    manufacturers: [
      'Siemens', 'ABB', 'Schneider Electric', 'GE', 'Mitsubishi Electric', 'Rockwell Automation',
      'Eaton', 'Bosch Rexroth', 'WEG', 'Danfoss', 'Emerson', 'Yaskawa', 'Omron', 'Hitachi',
      'Toshiba', 'Fuji Electric', 'LS Electric', 'Nidec', 'Baldor', 'TECO-Westinghouse',
      'Brook Crompton', 'Regal Rexnord', 'Leeson', 'Kollmorgen', 'SEW-Eurodrive', 'Lenze',
      'Bonfiglioli', 'Nord Drivesystems', 'Vacon', 'Delta Electronics', 'Parker', 'Allen-Bradley'
    ],
    catalogBaseUrl: 'https://pdf.directindustry.com/pdf/'
  },
  'PSV': {
    manufacturers: [
      'Emerson', 'Fisher', 'LESER', 'Baker Hughes', 'Consolidated', 'Crosby', 'Anderson Greenwood',
      'Pentair', 'Curtiss-Wright', 'KSB', 'ARI-Armaturen', 'Spirax Sarco', 'IMI Critical Engineering',
      'Weir', 'Velan', 'Valvitalia', 'Neway', 'Bonney Forge', 'OMAL', 'GEMÜ', 'Böhmer',
      'Habonim', 'Armstrong', 'Watts', 'TLV', 'SAMSON', 'Masoneilan', 'Sempell', 'Farris'
    ],
    catalogBaseUrl: 'https://pdf.directindustry.com/pdf/'
  }
};

// Product types with specifications
const productTemplates: Record<string, Array<{
  type: string;
  specs: string[];
  sizeRange: string;
  pressureClass: string;
  materials: string[];
  modelPrefixes: string[];
}>> = {
  'Valves': [
    { type: 'Ball Valve', specs: ['Full port design', 'Fire-safe API 607', 'PTFE/RPTFE seats', 'Blowout-proof stem'], sizeRange: '1/4" - 48"', pressureClass: 'ASME Class 150-2500', materials: ['Carbon Steel', 'Stainless Steel 316', 'Duplex', 'Alloy 20'], modelPrefixes: ['BV', 'FB', 'HP', 'SS'] },
    { type: 'Gate Valve', specs: ['Rising stem design', 'OS&Y construction', 'Pressure seal bonnet', 'Flexible wedge'], sizeRange: '2" - 60"', pressureClass: 'ASME Class 150-2500', materials: ['WCB', 'LCB', 'CF8M', 'Alloy Steel'], modelPrefixes: ['GV', 'WG', 'PG', 'FW'] },
    { type: 'Globe Valve', specs: ['Y-pattern body', 'Integral seat', 'Stellite hardfacing', 'Cryogenic service'], sizeRange: '1/2" - 24"', pressureClass: 'ASME Class 150-4500', materials: ['A105', 'F316', 'F347', 'Inconel'], modelPrefixes: ['GL', 'YG', 'CG', 'HG'] },
    { type: 'Check Valve', specs: ['Tilting disc design', 'Dual plate configuration', 'Silent type', 'Non-slam'], sizeRange: '2" - 48"', pressureClass: 'ASME Class 150-2500', materials: ['Carbon Steel', 'Stainless Steel', 'Bronze', 'Ductile Iron'], modelPrefixes: ['CV', 'TD', 'DP', 'SC'] },
    { type: 'Butterfly Valve', specs: ['Double offset design', 'Triple offset metallic seal', 'Wafer/Lug style', 'Fire-safe'], sizeRange: '2" - 120"', pressureClass: 'ASME Class 150-600', materials: ['Carbon Steel', 'Stainless Steel', 'Ductile Iron', 'Aluminum Bronze'], modelPrefixes: ['BF', 'TO', 'DO', 'WF'] },
    { type: 'Control Valve', specs: ['Cage guided trim', 'Anti-cavitation design', 'Low noise internals', 'Digital positioner ready'], sizeRange: '1" - 24"', pressureClass: 'ASME Class 150-2500', materials: ['WCB', 'CF8M', 'Hastelloy', 'Monel'], modelPrefixes: ['CV', 'EZ', 'GX', 'ES'] },
    { type: 'Plug Valve', specs: ['Pressure balanced design', 'Self-lubricating sleeve', 'Full bore', 'Bi-directional'], sizeRange: '1" - 36"', pressureClass: 'ASME Class 150-900', materials: ['Carbon Steel', 'Stainless Steel', 'Alloy Steel'], modelPrefixes: ['PV', 'SL', 'PB', 'FP'] },
    { type: 'Needle Valve', specs: ['Integral bonnet', 'Vee stem design', 'Panel mount', 'High pressure service'], sizeRange: '1/8" - 2"', pressureClass: 'Up to 60,000 psi', materials: ['316 SS', 'Alloy 625', 'Monel', 'Hastelloy C'], modelPrefixes: ['NV', 'HP', 'SS', 'IB'] },
  ],
  'Pumps': [
    { type: 'Centrifugal Pump', specs: ['Back pull-out design', 'API 610 compliant', 'Mechanical seal', 'Enclosed impeller'], sizeRange: '25-500 GPM', pressureClass: 'Up to 500 psi', materials: ['Cast Iron', '316 SS', 'Duplex SS', 'CD4MCu'], modelPrefixes: ['CP', 'OH', 'BB', 'VS'] },
    { type: 'Positive Displacement Pump', specs: ['Internal gear design', 'External gear design', 'High viscosity capability', 'Bi-directional'], sizeRange: '0.1-2000 GPM', pressureClass: 'Up to 1500 psi', materials: ['Carbon Steel', '316 SS', 'Ductile Iron', 'Hastelloy'], modelPrefixes: ['PD', 'IG', 'EG', 'GP'] },
    { type: 'Submersible Pump', specs: ['Explosion-proof motor', 'Non-clog impeller', 'Double mechanical seal', 'Oil-filled motor'], sizeRange: '100-50000 GPM', pressureClass: 'Up to 200 ft TDH', materials: ['Cast Iron', 'Stainless Steel', 'Bronze'], modelPrefixes: ['SP', 'DW', 'SW', 'SL'] },
    { type: 'Progressive Cavity Pump', specs: ['Single screw design', 'Run-dry protection', 'Reversible rotation', 'Variable speed'], sizeRange: '0.2-2500 GPM', pressureClass: 'Up to 600 psi', materials: ['Cast Iron', 'Stainless Steel', 'Hardened Steel'], modelPrefixes: ['PC', 'SC', 'MO', 'EZ'] },
    { type: 'Diaphragm Pump', specs: ['Air-operated design', 'PTFE diaphragms', 'Self-priming', 'Deadhead capable'], sizeRange: '0.5-300 GPM', pressureClass: 'Up to 125 psi', materials: ['Aluminum', 'Stainless Steel', 'Polypropylene', 'PVDF'], modelPrefixes: ['DP', 'AO', 'DD', 'PP'] },
    { type: 'Metering Pump', specs: ['Precision dosing', 'Diaphragm/Plunger options', 'Electronic stroke control', 'API 675 compliant'], sizeRange: '0.001-500 GPH', pressureClass: 'Up to 30,000 psi', materials: ['316 SS', 'PVC', 'PVDF', 'Hastelloy'], modelPrefixes: ['MP', 'DS', 'PL', 'ED'] },
    { type: 'Multistage Pump', specs: ['Horizontal/Vertical options', 'Diffuser type stages', 'API 610 BB3/BB5', 'High head capability'], sizeRange: '50-5000 GPM', pressureClass: 'Up to 5000 psi', materials: ['Carbon Steel', 'Stainless Steel', 'Duplex SS'], modelPrefixes: ['MS', 'BB', 'HM', 'VM'] },
  ],
  'Tanks': [
    { type: 'Storage Tank', specs: ['API 650 design', 'Fixed/Floating roof', 'Bottom outlet', 'Level instrumentation ready'], sizeRange: '500-5,000,000 gal', pressureClass: 'Atmospheric', materials: ['Carbon Steel', 'Stainless Steel', 'Fiberglass'], modelPrefixes: ['ST', 'FR', 'FL', 'AP'] },
    { type: 'Pressure Vessel', specs: ['ASME Section VIII', 'Horizontal/Vertical', 'Saddle/Leg supports', 'Code stamped'], sizeRange: '100-100,000 gal', pressureClass: 'Up to 3000 psi', materials: ['Carbon Steel', 'Stainless Steel', 'Alloy Steel', 'Clad'], modelPrefixes: ['PV', 'HV', 'VV', 'RX'] },
    { type: 'Process Tank', specs: ['Agitated design', 'Jacketed vessel', 'Sanitary finish', 'CIP/SIP ready'], sizeRange: '50-50,000 gal', pressureClass: 'Up to 150 psi', materials: ['304 SS', '316L SS', 'Hastelloy', 'Glass-lined'], modelPrefixes: ['PT', 'MX', 'RX', 'JT'] },
    { type: 'Separator', specs: ['Three-phase design', 'Coalescing internals', 'Level control', 'Sand handling'], sizeRange: '100-10,000 bbl', pressureClass: 'Up to 1500 psi', materials: ['Carbon Steel', 'Stainless Steel', 'Clad'], modelPrefixes: ['SP', 'TP', 'FW', 'HT'] },
    { type: 'Heat Exchanger', specs: ['Shell & tube design', 'TEMA standards', 'Removable bundle', 'Multiple pass'], sizeRange: '10-50,000 sq ft', pressureClass: 'Up to 3000 psi', materials: ['Carbon Steel', 'Stainless Steel', 'Titanium', 'Duplex'], modelPrefixes: ['HX', 'ST', 'PT', 'AC'] },
  ],
  'Instrumentation': [
    { type: 'Pressure Transmitter', specs: ['Differential/Gauge/Absolute', 'HART/Foundation Fieldbus', 'Remote seal options', '0.04% accuracy'], sizeRange: '0-15,000 psi', pressureClass: 'N/A', materials: ['316 SS', 'Hastelloy C', 'Monel', 'Tantalum'], modelPrefixes: ['PT', 'DP', 'GP', 'AP'] },
    { type: 'Flow Meter', specs: ['Magnetic/Coriolis/Vortex', 'HART protocol', 'Integral display', 'Custody transfer'], sizeRange: '1/4" - 96"', pressureClass: 'Up to 5800 psi', materials: ['316 SS', 'Hastelloy', 'Titanium', 'PFA-lined'], modelPrefixes: ['FM', 'MG', 'CM', 'VX'] },
    { type: 'Level Transmitter', specs: ['Radar/Ultrasonic/GWR', 'SIL2/3 certified', 'Tank gauging', 'Interface measurement'], sizeRange: 'Up to 230 ft', pressureClass: 'Up to 5800 psi', materials: ['316 SS', 'PTFE', 'Hastelloy', 'Titanium'], modelPrefixes: ['LT', 'RD', 'US', 'GW'] },
    { type: 'Temperature Transmitter', specs: ['RTD/Thermocouple input', 'Dual sensor', 'HART protocol', 'SIL2 rated'], sizeRange: '-328°F to 3200°F', pressureClass: 'N/A', materials: ['316 SS', 'Inconel', 'Hastelloy', 'Ceramic'], modelPrefixes: ['TT', 'RT', 'TC', 'DS'] },
    { type: 'Control Valve Positioner', specs: ['Digital HART', 'Explosion-proof', 'Partial stroke testing', 'Advanced diagnostics'], sizeRange: 'N/A', pressureClass: 'N/A', materials: ['Aluminum', 'Stainless Steel'], modelPrefixes: ['VP', 'DV', 'SV', 'EP'] },
  ],
  'Electrical': [
    { type: 'Electric Motor', specs: ['NEMA Premium efficiency', 'Explosion-proof Class I Div 1', 'Inverter duty', 'IEEE 841'], sizeRange: '1/4 - 15,000 HP', pressureClass: 'N/A', materials: ['Cast Iron', 'Steel', 'Aluminum'], modelPrefixes: ['EM', 'XP', 'ID', 'NP'] },
    { type: 'Variable Frequency Drive', specs: ['Low/Medium voltage', 'AFE technology', 'Dynamic braking', 'Bypass contactor'], sizeRange: '0.5 - 10,000 HP', pressureClass: 'N/A', materials: ['Steel enclosure'], modelPrefixes: ['VFD', 'LV', 'MV', 'AC'] },
    { type: 'Motor Control Center', specs: ['NEMA Type 12 enclosure', 'Arc-resistant', 'Smart MCC', 'IEC/NEMA rated'], sizeRange: 'N/A', pressureClass: 'N/A', materials: ['Steel'], modelPrefixes: ['MCC', 'SM', 'AR', 'IM'] },
    { type: 'Soft Starter', specs: ['Reduced voltage', 'Torque control', 'Built-in bypass', 'Motor protection'], sizeRange: '5 - 1200 HP', pressureClass: 'N/A', materials: ['Steel enclosure'], modelPrefixes: ['SS', 'RV', 'TC', 'BP'] },
    { type: 'Generator', specs: ['Diesel/Natural gas', 'Standby/Prime rated', 'EPA Tier 4', 'Paralleling ready'], sizeRange: '20 - 3000 kW', pressureClass: 'N/A', materials: ['Steel enclosure'], modelPrefixes: ['GN', 'DG', 'NG', 'ST'] },
  ],
  'PSV': [
    { type: 'Pressure Relief Valve', specs: ['Spring-loaded design', 'API 526 certified', 'ASME Section VIII', 'Full nozzle'], sizeRange: '1" x 2" - 8" x 10"', pressureClass: '15-6500 psi', materials: ['Carbon Steel', 'Stainless Steel', 'Alloy Steel'], modelPrefixes: ['PRV', 'SR', 'SL', 'FN'] },
    { type: 'Pilot Operated Relief Valve', specs: ['Modulating/Pop action', 'High capacity', 'Back pressure compensation', 'Remote sensing'], sizeRange: '1" - 8"', pressureClass: '15-6000 psi', materials: ['Carbon Steel', 'Stainless Steel', 'Alloy'], modelPrefixes: ['PORV', 'PL', 'MP', 'HC'] },
    { type: 'Safety Relief Valve', specs: ['Balanced bellows', 'Cryogenic service', 'Steam/Gas/Liquid', 'ASME/CE certified'], sizeRange: '1/2" - 6"', pressureClass: '15-4500 psi', materials: ['316 SS', 'Bronze', 'Carbon Steel'], modelPrefixes: ['SRV', 'BB', 'CR', 'UV'] },
    { type: 'Rupture Disc', specs: ['Forward/Reverse acting', 'Graphite/Metal designs', 'Burst tolerance ±2%', 'Vacuum support'], sizeRange: '1/2" - 36"', pressureClass: '2-60,000 psi', materials: ['316 SS', 'Inconel', 'Hastelloy', 'Nickel'], modelPrefixes: ['RD', 'FA', 'RA', 'GS'] },
  ]
};

// Generate realistic description
function generateDescription(manufacturer: string, template: typeof productTemplates['Valves'][0], category: string): string {
  const spec1 = template.specs[Math.floor(Math.random() * template.specs.length)];
  const spec2 = template.specs[(Math.floor(Math.random() * template.specs.length) + 1) % template.specs.length];
  const material = template.materials[Math.floor(Math.random() * template.materials.length)];
  
  const descriptions = [
    `The ${manufacturer} ${template.type} features ${spec1.toLowerCase()} and ${spec2.toLowerCase()}. Available in ${template.sizeRange} with pressure ratings up to ${template.pressureClass}. Constructed from ${material} for superior corrosion resistance and durability in demanding industrial applications.`,
    `Engineered for reliability, this ${manufacturer} ${template.type} incorporates ${spec1.toLowerCase()} technology. Suitable for ${template.sizeRange} applications with ${template.pressureClass} pressure capability. ${material} construction ensures long service life in oil & gas, chemical, and power generation industries.`,
    `${manufacturer} ${template.type} delivers exceptional performance with ${spec1.toLowerCase()}. Size range ${template.sizeRange}, rated for ${template.pressureClass}. Premium ${material} materials meet stringent API, ASME, and ISO standards for critical process applications.`,
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Generate model number
function generateModelNumber(template: typeof productTemplates['Valves'][0], index: number): string {
  const prefix = template.modelPrefixes[Math.floor(Math.random() * template.modelPrefixes.length)];
  const series = Math.floor(Math.random() * 9000) + 1000;
  const suffix = ['A', 'B', 'C', 'X', 'P', 'S', 'H'][Math.floor(Math.random() * 7)];
  return `${prefix}-${series}${suffix}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { category = 'all', targetCount = 200, startIndex = 0 } = await req.json();

    // Determine which categories to process
    let categoriesToProcess: string[];
    if (category === 'all') {
      categoriesToProcess = Object.keys(manufacturerData);
    } else {
      // Normalize category name
      const validCategories = Object.keys(manufacturerData);
      const normalizedCategory = validCategories.find(c => 
        c.toLowerCase() === category.toLowerCase()
      );
      
      if (!normalizedCategory) {
        return new Response(
          JSON.stringify({ success: false, error: `Invalid category. Valid: ${validCategories.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      categoriesToProcess = [normalizedCategory];
    }

    console.log(`Processing categories: ${categoriesToProcess.join(', ')}`);

    let totalCreated = 0;
    let totalErrors = 0;
    const results: Record<string, { created: number; errors: number }> = {};

    for (const cat of categoriesToProcess) {
      const manufacturers = manufacturerData[cat]?.manufacturers || [];
      const templates = productTemplates[cat] || [];
      
      if (templates.length === 0) continue;

      let catCreated = 0;
      let catErrors = 0;
      const productsPerManufacturer = Math.ceil(targetCount / manufacturers.length);

      // Process manufacturers starting from startIndex
      const mfgsToProcess = manufacturers.slice(startIndex, startIndex + 10); // Process 10 manufacturers per call

      for (const mfgName of mfgsToProcess) {
        if (catCreated >= targetCount) break;

        // Ensure manufacturer exists
        let { data: mfg } = await supabase
          .from('manufacturers')
          .select('id')
          .eq('name', mfgName)
          .maybeSingle();

        if (!mfg) {
          const { data: newMfg, error: mfgError } = await supabase
            .from('manufacturers')
            .insert({ 
              name: mfgName, 
              website: `https://www.${mfgName.toLowerCase().replace(/\s+/g, '')}.com` 
            })
            .select('id')
            .single();
          
          if (mfgError) {
            console.error(`Failed to create manufacturer ${mfgName}:`, mfgError);
            catErrors++;
            continue;
          }
          mfg = newMfg;
        }

        // Generate products for each template type
        for (const template of templates) {
          if (catCreated >= targetCount) break;

          // Check for duplicates
          const { data: existing } = await supabase
            .from('materials')
            .select('id')
            .eq('manufacturer_id', mfg.id)
            .ilike('title', `%${template.type}%`)
            .limit(1);

          if (existing && existing.length > 0) {
            console.log(`${mfgName} ${template.type} already exists, skipping`);
            continue;
          }

          const modelNumber = generateModelNumber(template, catCreated);
          const description = generateDescription(mfgName, template, cat);
          const title = `${mfgName} ${template.type}`;

          // Map category for database
          const dbCategory = cat === 'PSV' ? 'Valves' : cat;

          const { error: insertError } = await supabase
            .from('materials')
            .insert({
              manufacturer_id: mfg.id,
              category: dbCategory,
              title: title,
              product_name: description,
              model_number: modelNumber,
              rating: 0,
              purchase_count: 0,
            });

          if (insertError) {
            console.error(`Failed to insert ${title}:`, insertError.message);
            catErrors++;
          } else {
            catCreated++;
            totalCreated++;
          }
        }
      }

      results[cat] = { created: catCreated, errors: catErrors };
      totalErrors += catErrors;
    }

    // Get total counts
    const { count: totalCount } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });

    // Get breakdown by category
    const { data: breakdown } = await supabase
      .from('materials')
      .select('category');
    
    const categoryBreakdown: Record<string, number> = {};
    if (breakdown) {
      for (const item of breakdown) {
        categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${totalCreated} products`,
        totalCreated,
        totalErrors,
        results,
        totalProductsInDatabase: totalCount,
        categoryBreakdown,
        nextStartIndex: startIndex + 10,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deep-crawl-products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
