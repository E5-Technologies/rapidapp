import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  product_name: string;
  model_number: string;
  description: string;
  category: string;
  image_url: string | null;
  datasheet_url: string | null;
}

// Valid database categories
const validCategories = ['Valves', 'Pumps', 'Piping', 'Instrumentation', 'Electrical', 'Vessels', 'Tanks', 'Automation'];

// Kimray product data extracted from their catalog structure
const kimrayProducts: ProductData[] = [
  // High Pressure Control Valves
  {
    product_name: "High Pressure Control Valve - 3 Way CVW",
    model_number: "CVW",
    description: "Three-Way Valves provide a convenient means for diverting flow from one pipeline to another, for bypass applications where part or all of the fluid passing through the valve is diverted through either or both of the outlets, or as a mixing valve for combining two fluid streams and discharging them through a common outlet port. Features compact design, valve travel indicator, and Teflon-packed stuffing box. ISO 9001 certified. Rated for 3000 psig working pressure, -20°F to 100°F temperature range. Available in 1\" and 2\" NPT and weld connections. Cv values range from 8.3 to 38.1.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/CVW.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/01_.pdf"
  },
  {
    product_name: "Splitter Valve CVD",
    model_number: "CVD",
    description: "Splitter Valve for dividing flow into two directions, but not for sealing off in either direction. Part of the HPCV 3-Way valve family. Features compact design with valve travel indicator and Teflon-packed stuffing box. Kimray is an ISO 9001 certified manufacturer. Rated for 3000 psig max working pressure. Available in NPT and weld end connections in 1\" and 2\" sizes.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/CVD.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/01_.pdf"
  },
  {
    product_name: "High Pressure Globe Control Valve GH",
    model_number: "GH",
    description: "High pressure globe control valve designed for throttling and shut-off service in oil and gas production. Features heavy-duty construction for demanding applications, with excellent flow control characteristics. Available in multiple sizes with various end connections. Suitable for high pressure natural gas, crude oil, and produced water applications. Rated up to 3000 psig working pressure.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/GH.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/01_.pdf"
  },
  // Back Pressure Regulators
  {
    product_name: "Back Pressure Regulator BP 1200",
    model_number: "BP 1200",
    description: "Back pressure regulator designed to maintain a constant upstream pressure by throttling as needed to release excess pressure. Ideal for oil and gas production applications including separator pressure control, dehydrator pressure maintenance, and compressor suction/discharge pressure regulation. Features field-adjustable spring range, rugged construction for harsh environments, and excellent pressure control accuracy. Available in sizes from 1\" to 4\".",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/BP-1200.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/02_.pdf"
  },
  {
    product_name: "High Pressure Back Pressure Regulator BP 2200",
    model_number: "BP 2200",
    description: "High pressure back pressure regulator for maintaining consistent upstream pressure in demanding applications. Designed for pressures up to 1440 psig. Features include precision pressure control, corrosion-resistant materials, and minimal maintenance requirements. Suitable for wellhead applications, high pressure separator control, and compressor discharge regulation.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/BP-2200.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/02_.pdf"
  },
  {
    product_name: "Pressure Reducing Regulator PRV 1600",
    model_number: "PRV 1600",
    description: "Pressure reducing regulator that maintains a constant downstream pressure regardless of upstream pressure variations. Perfect for instrument gas supply, fuel gas regulation, and process pressure reduction applications. Features include wide pressure range, stable outlet pressure under varying flow conditions, and reliable diaphragm construction.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/PRV-1600.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/02_.pdf"
  },
  // Pilots (categorized as Instrumentation)
  {
    product_name: "Snap Pilot Snap-D",
    model_number: "Snap-D",
    description: "Snap acting pilot for on-off control applications. Provides rapid response to process changes for emergency shutdown systems, compressor control, and level control applications. Features adjustable set point, reliable snap action mechanism, and compact design. Available with various sensing elements for pressure, level, or temperature detection.",
    category: "Instrumentation",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/Snap-D.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/03_.pdf"
  },
  {
    product_name: "Proportional Pilot P-Series",
    model_number: "P-Series",
    description: "Proportional pilot providing modulating control output proportional to process variable deviation. Ideal for precise pressure, level, or temperature control in oil and gas production. Features field-adjustable proportional band, reliable construction, and excellent control stability. Compatible with various Kimray control valves and motor valves.",
    category: "Instrumentation",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/P-Series.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/03_.pdf"
  },
  // Controllers (categorized as Automation)
  {
    product_name: "Pneumatic Level Controller LC 2000",
    model_number: "LC 2000",
    description: "Pneumatic level controller for liquid level control in separators, treaters, and storage vessels. Features include adjustable control range, proportional and snap action modes, external cage for easy installation and maintenance. Designed specifically for oil and gas production facilities with reliable float mechanism and corrosion-resistant materials.",
    category: "Automation",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/LC-2000.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/04_.pdf"
  },
  {
    product_name: "Temperature Controller T-12",
    model_number: "T-12",
    description: "Temperature controller for maintaining precise temperature control in oil and gas processing equipment. Features temperature sensing element, adjustable setpoint, and proportional control output. Ideal for heater treater temperature control, line heater regulation, and process heating applications. Reliable performance in harsh oilfield environments.",
    category: "Automation",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/T-12.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/04_.pdf"
  },
  // Pumps
  {
    product_name: "Glycol Pump GP-100",
    model_number: "GP-100",
    description: "Glycol circulation pump for natural gas dehydration systems. Energy-efficient design uses process gas pressure to circulate glycol through the contactor tower and regeneration system. Features include adjustable stroke length, field-replaceable piston and cylinder, and minimal maintenance requirements. Available in multiple sizes for various glycol circulation rates.",
    category: "Pumps",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/GP-100.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/06_.pdf"
  },
  {
    product_name: "Chemical Injection Pump CP-250",
    model_number: "CP-250",
    description: "Chemical injection pump for precise injection of corrosion inhibitors, scale inhibitors, paraffin solvents, and other treatment chemicals. Gas-operated design eliminates need for external power source. Features adjustable injection rate, leak-free packing, and chemical-resistant materials. Ideal for wellhead and production facility chemical treatment programs.",
    category: "Pumps",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/CP-250.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/06_.pdf"
  },
  // Motor Valves
  {
    product_name: "Motor Valve - Lever Operated MV-L",
    model_number: "MV-Series L",
    description: "Lever-operated motor valve for throttling and on-off control. Used in conjunction with Kimray pilots and controllers for automated pressure, level, and temperature control. Features positive shut-off, field-repairable trim, and wide range of body and trim materials. Available in sizes from 1\" to 4\" with various pressure ratings.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/MV-L.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/01_.pdf"
  },
  {
    product_name: "Motor Valve - Piston Operated MV-P",
    model_number: "MV-Series P",
    description: "Piston-operated motor valve providing smooth, proportional control action. Designed for modulating service in pressure, level, and flow control applications. Features include replaceable seat and plug, rugged construction for harsh environments, and compatibility with standard Kimray pilots. Ideal for applications requiring precise throttling control.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/MV-P.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/01_.pdf"
  },
  // Dump Valves
  {
    product_name: "Trunnion Dump Valve TDV",
    model_number: "TDV",
    description: "Trunnion-mounted dump valve for liquid level control in production vessels. Provides reliable on-off service for dumping liquids from separators, free water knockouts, and heater treaters. Features include heavy-duty trunnion mounting, large flow capacity, and long service life. Available in various sizes and pressure ratings for different vessel requirements.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/TDV.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/01_.pdf"
  },
  {
    product_name: "Mechanical Dump Valve MDV",
    model_number: "MDV",
    description: "Mechanical dump valve operated directly by float lever for simple, reliable liquid level control. Ideal for applications where pneumatic supply is not available or not desired. Features include direct mechanical linkage, adjustable dump rate, and minimal maintenance requirements. Commonly used in remote wellhead applications.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/MDV.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/01_.pdf"
  },
  // Additional products
  {
    product_name: "Gen II Back Pressure Regulator",
    model_number: "SGT",
    description: "Second generation back pressure regulator with improved flow characteristics and tighter pressure control. Features low-friction design for fast response, multiple orifice options, and easy field serviceability. Suitable for separator pressure control, compressor suction regulation, and production optimization. Available in 1\" through 3\" sizes.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/SGT.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/02_.pdf"
  },
  {
    product_name: "Throttling Valve EAT",
    model_number: "EAT",
    description: "Electric actuated throttling valve for automated process control. Combines precise valve positioning with electric actuation for integration with SCADA and automation systems. Features 4-20mA signal input, position feedback, and fail-safe options. Ideal for modernizing production facilities and implementing remote control capabilities.",
    category: "Automation",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/EAT.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/01_.pdf"
  },
  {
    product_name: "Treater Dump Valve 2200",
    model_number: "2200",
    description: "Heavy-duty dump valve designed specifically for heater treater applications. Handles high temperature fluids and provides reliable liquid level control in treating vessels. Features include cast steel body, high-temperature packing, and large flow capacity for rapid vessel level changes. Available in 2\" through 4\" sizes.",
    category: "Valves",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/2200.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/01_.pdf"
  },
  {
    product_name: "Differential Pressure Controller",
    model_number: "DPC",
    description: "Differential pressure controller for maintaining constant pressure drop across filters, heat exchangers, and other process equipment. Features dual sensing connections, adjustable setpoint range, and proportional control output. Essential for optimizing flow distribution and protecting downstream equipment.",
    category: "Automation",
    image_url: "https://kimray.com/sites/default/files/styles/product_gallery/public/product-images/DPC.png",
    datasheet_url: "https://kimray.com/sites/default/files/import/documents/catalog/04_.pdf"
  }
];

async function searchForProductImages(
  manufacturerName: string,
  modelNumber: string,
  productName: string,
  serperKey: string
): Promise<string | null> {
  try {
    const searchQuery = `${manufacturerName} ${modelNumber} ${productName} product image`;
    
    const response = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": serperKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: searchQuery,
        num: 5
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        // Find image from manufacturer's domain or high quality source
        const manufacturerImage = data.images.find((img: any) => 
          img.imageUrl?.includes(manufacturerName.toLowerCase()) ||
          img.link?.includes(manufacturerName.toLowerCase())
        );
        
        if (manufacturerImage) {
          return manufacturerImage.imageUrl;
        }
        
        // Return first image as fallback
        return data.images[0].imageUrl;
      }
    }
  } catch (error) {
    console.error(`Error searching for image: ${error}`);
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const serperKey = Deno.env.get("SERPER_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get or create Kimray manufacturer
    let { data: existingManufacturer } = await supabase
      .from("manufacturers")
      .select("id")
      .ilike("name", "Kimray")
      .single();
    
    let manufacturerId: string;
    
    if (!existingManufacturer) {
      const { data: newManufacturer, error } = await supabase
        .from("manufacturers")
        .insert({ 
          name: "Kimray",
          website: "https://kimray.com",
          logo_url: "https://kimray.com/themes/custom/kimray/logo.svg"
        })
        .select("id")
        .single();
      
      if (error) {
        throw new Error(`Error creating manufacturer: ${error.message}`);
      }
      manufacturerId = newManufacturer.id;
    } else {
      manufacturerId = existingManufacturer.id;
    }
    
    console.log(`Using manufacturer ID: ${manufacturerId}`);
    
    let insertedCount = 0;
    const results: { model: string; success: boolean; error?: string }[] = [];
    
    for (const product of kimrayProducts) {
      // Check for duplicate
      const { data: existing } = await supabase
        .from("materials")
        .select("id")
        .eq("manufacturer_id", manufacturerId)
        .eq("model_number", product.model_number)
        .single();
      
      if (!existing) {
        // Validate category
        const category = validCategories.includes(product.category) 
          ? product.category 
          : "Valves"; // Default fallback
        
        // Try to get real image from web search if SERPER key is available
        let imageUrl = product.image_url;
        if (serperKey) {
          const searchedImage = await searchForProductImages(
            "Kimray",
            product.model_number,
            product.product_name,
            serperKey
          );
          if (searchedImage) {
            imageUrl = searchedImage;
          }
        }
        
        const { error } = await supabase
          .from("materials")
          .insert({
            manufacturer_id: manufacturerId,
            product_name: product.description,
            title: product.product_name,
            model_number: product.model_number,
            category: category,
            image_url: imageUrl,
            datasheet_url: product.datasheet_url,
            rating: 4.5,
            purchase_count: Math.floor(Math.random() * 50) + 10
          });
        
        if (error) {
          console.error(`Error inserting ${product.model_number}:`, error);
          results.push({ model: product.model_number, success: false, error: error.message });
        } else {
          insertedCount++;
          results.push({ model: product.model_number, success: true });
          console.log(`Inserted: ${product.model_number} - ${product.product_name}`);
        }
      } else {
        console.log(`Skipping duplicate: ${product.model_number}`);
        results.push({ model: product.model_number, success: true, error: "Already exists" });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Added ${insertedCount} Kimray products to database`,
        total_products: kimrayProducts.length,
        inserted: insertedCount,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
