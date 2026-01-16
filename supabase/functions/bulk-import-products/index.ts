import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive product templates with realistic technical specifications
const productCatalog = {
  Valve: {
    manufacturers: [
      'Emerson', 'Flowserve', 'Crane', 'Velan', 'KITZ', 'Parker', 'Swagelok', 'Bray', 'Neles', 'Metso',
      'Spirax Sarco', 'Honeywell', 'Pentair', 'Weir', 'Cameron', 'Danfoss', 'Fisher', 'Mueller',
      'Bonney Forge', 'GEMÜ', 'Habonim', 'Armstrong', 'Apollo Valves', 'Watts', 'Nibco', 'Circor',
      'Jamesbury', 'DeZurik', 'Masoneilan', 'Keystone', 'KSB', 'IMI', 'Tyco', 'Belimo', 'TLV',
      'AVK', 'SAMSON', 'ARI-Armaturen', 'ITT', 'Rotork', 'AUMA'
    ],
    types: [
      {
        name: 'Gate Valve',
        prefixes: ['GV', 'GT', 'WGV', 'FGV'],
        sizes: ['1/4"', '3/8"', '1/2"', '3/4"', '1"', '1-1/2"', '2"', '3"', '4"', '6"', '8"', '10"', '12"', '14"', '16"'],
        pressures: ['150#', '300#', '600#', '900#', '1500#', '2500#'],
        materials: ['Carbon Steel', '316 SS', 'Alloy 20', 'Hastelloy C', 'Duplex SS', 'Bronze', 'WCB', 'CF8M'],
        description: 'Full bore gate valve designed for on/off isolation service. Features rising stem design with bolted bonnet construction. Stellite-faced wedge and seat rings provide excellent shut-off capability. Ideal for high-pressure applications in oil & gas, refining, and petrochemical industries. API 600/API 6D compliant with fire-safe design per API 607.',
        features: ['Rising stem design', 'Bolted bonnet construction', 'Stellite-faced trim', 'Fire-safe certified API 607', 'Fugitive emission tested', 'Bi-directional shutoff'],
      },
      {
        name: 'Ball Valve',
        prefixes: ['BV', 'FB', 'TB', 'RB', 'DBB'],
        sizes: ['1/4"', '3/8"', '1/2"', '3/4"', '1"', '1-1/2"', '2"', '3"', '4"', '6"', '8"'],
        pressures: ['150#', '300#', '600#', '900#', '1500#', '2500#', '3000 PSI', '6000 PSI'],
        materials: ['Carbon Steel', '316 SS', 'Alloy 20', 'Hastelloy C', 'Duplex SS', 'Monel', 'Inconel'],
        description: 'Quarter-turn ball valve with floating or trunnion-mounted ball design. Full port or reduced port configurations available. Fire-safe design per API 607/API 6FA with anti-static device. PTFE or metal seats for various service conditions. Double block and bleed capability for critical isolation applications.',
        features: ['Quarter-turn operation', 'Full port design', 'Anti-static device', 'Fire-safe API 607', 'Double block and bleed', 'Stem blowout proof'],
      },
      {
        name: 'Globe Valve',
        prefixes: ['GL', 'GC', 'CV', 'RG', 'AGV'],
        sizes: ['1/2"', '3/4"', '1"', '1-1/2"', '2"', '3"', '4"', '6"', '8"', '10"', '12"'],
        pressures: ['150#', '300#', '600#', '900#', '1500#', '2500#'],
        materials: ['Carbon Steel', '316 SS', 'Alloy 20', 'Chrome Moly', 'WCB', 'LCC'],
        description: 'Globe valve for precise throttling and flow control applications. Y-pattern, angle, and straight-through designs available. Stellite-faced plug and seat for extended service life. Bolted bonnet with inside screw construction. Suitable for steam, water, oil, and gas service with excellent flow characteristics.',
        features: ['Precise throttling control', 'Y-pattern available', 'Stellite-faced trim', 'Inside screw design', 'Replaceable seat ring', 'Flow characteristic options'],
      },
      {
        name: 'Check Valve',
        prefixes: ['CH', 'SW', 'LF', 'DC', 'NRV'],
        sizes: ['1/2"', '3/4"', '1"', '1-1/2"', '2"', '3"', '4"', '6"', '8"', '10"', '12"', '14"', '16"'],
        pressures: ['150#', '300#', '600#', '900#', '1500#'],
        materials: ['Carbon Steel', '316 SS', 'Ductile Iron', 'Bronze', 'WCB', 'CF8M'],
        description: 'Swing check valve prevents backflow in pipeline systems. Bolted cover design for easy maintenance access. Silent operation with resilient or metal seat options. Wafer, lug, and flanged body styles available. Tilting disc design reduces pressure drop and provides reliable operation.',
        features: ['Prevents backflow', 'Silent operation', 'Low pressure drop', 'Resilient seat option', 'Bolted cover access', 'API 6D compliant'],
      },
      {
        name: 'Butterfly Valve',
        prefixes: ['BF', 'HPB', 'TRB', 'DB', 'WBV'],
        sizes: ['2"', '3"', '4"', '6"', '8"', '10"', '12"', '14"', '16"', '18"', '20"', '24"', '30"', '36"'],
        pressures: ['150#', '300#', '600#'],
        materials: ['Ductile Iron', 'Carbon Steel', '316 SS', 'Duplex SS', 'Super Duplex'],
        description: 'High-performance butterfly valve with triple offset or double offset design. Metal-to-metal seating for zero leakage and high temperature service. Quarter-turn operation with low torque requirements. Suitable for control and isolation applications. Fire-safe design per API 607.',
        features: ['Triple offset design', 'Metal-to-metal seating', 'Zero leakage', 'Low torque operation', 'Fire-safe API 607', 'Bi-directional shutoff'],
      },
      {
        name: 'Control Valve',
        prefixes: ['CV', 'ES', 'ED', 'EW', 'GX'],
        sizes: ['1/2"', '3/4"', '1"', '1-1/2"', '2"', '3"', '4"', '6"', '8"'],
        pressures: ['150#', '300#', '600#', '900#', '1500#'],
        materials: ['316 SS', 'Alloy 20', 'Hastelloy C', 'Duplex SS', 'WCB'],
        description: 'Pneumatic or electric control valve with digital positioner for precise flow control. Equal percentage, linear, or quick opening trim characteristics available. 4-20mA input with HART, Foundation Fieldbus, or Profibus PA communication. Low noise trim options for cavitation and flashing service.',
        features: ['Digital positioner', 'HART communication', '4-20mA input', 'Low noise trim', 'Anti-cavitation design', 'SIL 2/3 capable'],
      },
      {
        name: 'Plug Valve',
        prefixes: ['PV', 'LP', 'EP', 'SL'],
        sizes: ['1"', '1-1/2"', '2"', '3"', '4"', '6"', '8"', '10"', '12"'],
        pressures: ['150#', '300#', '600#'],
        materials: ['Carbon Steel', '316 SS', 'Ductile Iron', 'Ni-Resist'],
        description: 'Lubricated or non-lubricated plug valve for heavy-duty slurry and viscous fluid service. Quick quarter-turn operation with minimal pressure drop. Pressure-balanced design for low operating torque. Ideal for refinery, chemical, and petrochemical applications.',
        features: ['Quarter-turn operation', 'Low pressure drop', 'Slurry service capable', 'Pressure-balanced design', 'Field-adjustable packing', 'Fire-safe option'],
      },
      {
        name: 'Needle Valve',
        prefixes: ['NV', 'FN', 'MN', 'HPN'],
        sizes: ['1/8"', '1/4"', '3/8"', '1/2"', '3/4"', '1"'],
        pressures: ['3000 PSI', '6000 PSI', '10000 PSI', '15000 PSI'],
        materials: ['316 SS', 'Alloy 20', 'Monel', 'Hastelloy C', 'Titanium'],
        description: 'Precision needle valve for fine flow adjustment in instrumentation systems. Integral bonnet construction with regulating stem and non-rotating tip. Metal-to-metal seat for positive shutoff. Designed for high pressure instrument and sampling applications.',
        features: ['Fine flow adjustment', 'Integral bonnet', 'Non-rotating tip', 'Metal seat', 'High pressure rated', 'Panel mount option'],
      },
      {
        name: 'Relief Valve',
        prefixes: ['RV', 'PRV', 'SRV', 'BPV'],
        sizes: ['1/2"', '3/4"', '1"', '1-1/2"', '2"', '3"', '4"'],
        pressures: ['15 PSIG', '50 PSIG', '100 PSIG', '150 PSIG', '300 PSIG', '600 PSIG'],
        materials: ['Carbon Steel', '316 SS', 'Bronze', 'Hastelloy'],
        description: 'Pressure relief valve designed per API 526 for overpressure protection. Direct spring-loaded or pilot-operated designs available. Pop action or modulating service configurations. ASME UV certified for steam, gas, and liquid service applications.',
        features: ['API 526 design', 'ASME UV certified', 'Set pressure accuracy', 'Full nozzle design', 'Resilient seat option', 'Lifting lever included'],
      },
      {
        name: 'Solenoid Valve',
        prefixes: ['SV', 'EV', 'MV', 'ESV'],
        sizes: ['1/8"', '1/4"', '3/8"', '1/2"', '3/4"', '1"', '1-1/2"', '2"'],
        pressures: ['150 PSI', '300 PSI', '600 PSI', '1000 PSI', '3000 PSI'],
        materials: ['Brass', '316 SS', 'Aluminum', 'Engineered Plastic'],
        description: 'Direct-acting or pilot-operated solenoid valve for automation systems. 24VDC, 120VAC, or 240VAC coil options with low power consumption. Explosion-proof enclosures available for Class I Div 1/2 hazardous areas. Fast response time with millions of cycles life expectancy.',
        features: ['Fast response time', 'Low power consumption', 'Explosion-proof option', 'Manual override', 'DIN connector', 'IP65/67 enclosure'],
      },
    ],
  },
  Pump: {
    manufacturers: [
      'Grundfos', 'Flowserve', 'KSB', 'Sulzer', 'Xylem', 'RUHRPUMPEN', 'Gorman-Rupp', 'EBARA', 'Wilo',
      'Tsurumi', 'ANDRITZ', 'Viking Pump', 'Netzsch', 'SPX FLOW', 'Wilden', 'Yamada', 'Iwaki',
      'Sundyne', 'Weir Minerals', 'ITT Goulds', 'Peerless Pump', 'Blackmer', 'Moyno', 'Crane',
      'Milton Roy', 'Alfa Laval', 'Ampco', 'Fristam', 'Waukesha', 'SPP Pumps', 'Carver',
      'Ingersoll Rand', 'Atlas Copco', 'Graco', 'Warren Rupp', 'Sandpiper', 'Versa-Matic',
      'All-Flo', 'Flojet', 'Shurflo'
    ],
    types: [
      {
        name: 'Centrifugal Pump',
        prefixes: ['CP', 'CF', 'ESH', 'HDS', 'LCC'],
        flows: ['50 GPM', '100 GPM', '250 GPM', '500 GPM', '1000 GPM', '2000 GPM', '5000 GPM'],
        heads: ['50 ft', '100 ft', '150 ft', '200 ft', '300 ft', '500 ft'],
        materials: ['Cast Iron', '316 SS', 'CD4MCu', 'Alloy 20', 'Hastelloy', 'Titanium'],
        description: 'End suction centrifugal pump with back pull-out design per API 610. Closed impeller for general process service or open impeller for solids handling. Mechanical seal standard with API 682 Plan 11/21/53A/53B configurations. Heavy-duty bearing frame for extended MTBF.',
        features: ['API 610 compliant', 'Back pull-out design', 'API 682 mechanical seal', 'Heavy-duty bearings', 'Baseplate mounted', 'Closed impeller'],
      },
      {
        name: 'Positive Displacement Pump',
        prefixes: ['PD', 'GP', 'RP', 'VK'],
        flows: ['1 GPM', '5 GPM', '10 GPM', '25 GPM', '50 GPM', '100 GPM', '250 GPM'],
        pressures: ['100 PSI', '200 PSI', '500 PSI', '1000 PSI', '2000 PSI'],
        materials: ['Cast Iron', 'Ductile Iron', '316 SS', 'Hardened Steel'],
        description: 'Internal or external gear pump for viscous fluid transfer. Positive displacement provides consistent flow regardless of pressure changes. Cast iron or stainless steel construction with hardened gears. Integral relief valve for overpressure protection.',
        features: ['Constant flow output', 'Self-priming', 'Bi-directional capable', 'Relief valve included', 'Low NPSH required', 'Viscosity range to 1M cP'],
      },
      {
        name: 'Submersible Pump',
        prefixes: ['SP', 'WS', 'SS', 'DS'],
        flows: ['25 GPM', '50 GPM', '100 GPM', '250 GPM', '500 GPM', '1000 GPM', '2500 GPM'],
        heads: ['25 ft', '50 ft', '100 ft', '200 ft', '400 ft'],
        materials: ['Cast Iron', '316 SS', 'Duplex SS'],
        description: 'Submersible pump for drainage, dewatering, and sewage applications. Non-clog impeller design handles solids up to 3" diameter. Thermal motor protection with moisture sensors. Oil-filled motor housing for extended underwater operation.',
        features: ['Non-clog impeller', 'Thermal protection', 'Moisture sensors', 'Oil-filled motor', 'Explosion-proof option', 'Variable speed compatible'],
      },
      {
        name: 'Diaphragm Pump',
        prefixes: ['DP', 'AODD', 'PP', 'AF'],
        flows: ['5 GPM', '15 GPM', '30 GPM', '60 GPM', '120 GPM', '240 GPM'],
        pressures: ['60 PSI', '100 PSI', '125 PSI'],
        materials: ['Aluminum', 'Cast Iron', '316 SS', 'PTFE', 'Polypropylene', 'PVDF'],
        description: 'Air-operated double diaphragm (AODD) pump for chemical transfer and general industrial applications. Self-priming with dry-run capability and deadhead safe operation. PTFE, Santoprene, or Buna-N diaphragms for chemical compatibility. Ideal for abrasive, corrosive, and shear-sensitive fluids.',
        features: ['Self-priming', 'Dry-run capable', 'Deadhead safe', 'No electricity required', 'Portable design', 'Easy maintenance'],
      },
      {
        name: 'Progressive Cavity Pump',
        prefixes: ['PC', 'MN', 'NE', 'BN'],
        flows: ['1 GPM', '10 GPM', '50 GPM', '100 GPM', '500 GPM', '1000 GPM'],
        pressures: ['75 PSI', '150 PSI', '300 PSI', '600 PSI', '900 PSI'],
        materials: ['Cast Iron', '316 SS', 'Duplex SS'],
        description: 'Progressive cavity pump for high-viscosity fluids and slurries. Single or multi-stage configurations for various pressure requirements. Gentle pumping action for shear-sensitive materials. Stator materials include NBR, EPDM, and Viton for chemical compatibility.',
        features: ['High viscosity capable', 'Low shear pumping', 'Multi-stage options', 'Reversible flow', 'Low pulsation', 'Solids handling'],
      },
      {
        name: 'Metering Pump',
        prefixes: ['MP', 'DM', 'EM', 'HP'],
        flows: ['0.1 GPH', '1 GPH', '10 GPH', '50 GPH', '100 GPH', '500 GPH'],
        pressures: ['100 PSI', '250 PSI', '500 PSI', '1000 PSI', '3000 PSI'],
        materials: ['316 SS', 'Alloy 20', 'Hastelloy C', 'PTFE', 'PVC'],
        description: 'Precision metering pump with electronic or mechanical stroke adjustment. Diaphragm or plunger design for accurate chemical dosing. 4-20mA flow proportional control with external pacing capability. FDA/NSF certified models for water treatment applications.',
        features: ['±1% accuracy', 'Electronic stroke control', '4-20mA input', 'External pacing', 'Turndown ratio 100:1', 'Leak-free diaphragm'],
      },
      {
        name: 'Vertical Turbine Pump',
        prefixes: ['VT', 'DT', 'VTP', 'LB'],
        flows: ['100 GPM', '500 GPM', '1000 GPM', '2500 GPM', '5000 GPM', '10000 GPM'],
        heads: ['50 ft', '100 ft', '200 ft', '500 ft', '1000 ft', '2000 ft'],
        materials: ['Cast Iron', 'Bronze', '316 SS', 'Duplex SS'],
        description: 'Vertical turbine pump for deep well and industrial water supply applications. Multi-stage bowl assembly for high head requirements. Lineshaft or submersible motor drive options. Engineered to API 610 VS or Hydraulic Institute standards.',
        features: ['Multi-stage design', 'High head capability', 'API 610 VS', 'Submersible option', 'Bronze bearings', 'Engineered to order'],
      },
      {
        name: 'Slurry Pump',
        prefixes: ['SL', 'AH', 'ZG', 'HS'],
        flows: ['100 GPM', '500 GPM', '1000 GPM', '2500 GPM', '5000 GPM'],
        heads: ['50 ft', '100 ft', '200 ft', '400 ft'],
        materials: ['High Chrome Iron', 'Ni-Hard', 'Natural Rubber', 'Polyurethane'],
        description: 'Heavy-duty slurry pump for mining, dredging, and aggregate applications. Hard metal or rubber lined construction for maximum abrasion resistance. Expeller seal eliminates gland water requirement. Wide passage impeller handles large solids.',
        features: ['Abrasion resistant', 'Rubber or hard metal', 'Expeller seal', 'Wide passage impeller', 'Interchangeable liners', 'Split case option'],
      },
      {
        name: 'Magnetic Drive Pump',
        prefixes: ['MD', 'MDP', 'HMD', 'LMD'],
        flows: ['5 GPM', '25 GPM', '50 GPM', '100 GPM', '250 GPM', '500 GPM'],
        heads: ['50 ft', '100 ft', '150 ft', '200 ft', '300 ft'],
        materials: ['316 SS', 'Alloy 20', 'Hastelloy C', 'PTFE Lined'],
        description: 'Sealless magnetic drive pump for hazardous and corrosive chemical service. Eliminates mechanical seal for zero leakage operation. Rear earth magnet coupling with high torque capacity. Secondary containment built into design.',
        features: ['Sealless design', 'Zero leakage', 'Rare earth magnets', 'Secondary containment', 'Dry-run protection', 'ATEX certified option'],
      },
      {
        name: 'Sanitary Pump',
        prefixes: ['SAN', 'LKH', 'SRU', 'SMP'],
        flows: ['25 GPM', '50 GPM', '100 GPM', '250 GPM', '500 GPM', '1000 GPM'],
        heads: ['50 ft', '100 ft', '150 ft', '200 ft'],
        materials: ['316L SS', '304 SS', 'Hastelloy'],
        description: '3-A certified sanitary pump for food, dairy, beverage, and pharmaceutical applications. CIP/SIP cleanable design with electropolished wetted surfaces. Balanced single mechanical seal with flush port. Tri-clamp connections standard.',
        features: ['3-A certified', 'CIP/SIP cleanable', 'Electropolished', 'Tri-clamp connections', 'FDA compliant', 'EHEDG approved'],
      },
    ],
  },
  PSV: {
    manufacturers: [
      'Emerson', 'Fisher', 'LESER', 'Baker Hughes', 'Consolidated', 'Crosby', 'Anderson Greenwood',
      'Pentair', 'Curtiss-Wright', 'Weir', 'Dresser', 'Farris', 'Target Rock', 'King', 'Mercer',
      'Cash', 'Kunkle', 'Aquatrol', 'Apollo', 'Watts', 'Tyco', 'IMI Critical', 'Broady',
      'Spirax Sarco', 'TLV', 'SAMSON', 'Sempell', 'Varec', 'Protectoseal', 'Groth'
    ],
    types: [
      {
        name: 'Spring Loaded Safety Valve',
        prefixes: ['SL', 'JB', 'JOS', 'JLT', 'HSV'],
        sizes: ['1"x2"', '1.5"x3"', '2"x3"', '3"x4"', '4"x6"', '6"x8"', '8"x10"'],
        setPressures: ['15 PSIG', '50 PSIG', '100 PSIG', '150 PSIG', '300 PSIG', '600 PSIG', '1500 PSIG', '2500 PSIG'],
        materials: ['Carbon Steel', '316 SS', 'Alloy 20', 'Inconel', 'Hastelloy C', 'Monel'],
        description: 'Spring-loaded pressure safety valve per API 526 for gas, vapor, and steam service. Pop action with blowdown ring adjustment. Full nozzle design provides maximum flow capacity. ASME Section VIII certified with UV/NB stamps.',
        features: ['API 526 design', 'ASME VIII certified', 'Full nozzle design', 'Blowdown adjustment', 'O-ring soft seat option', 'Lifting lever included'],
      },
      {
        name: 'Pilot Operated Relief Valve',
        prefixes: ['PO', 'JPI', 'PV', 'PM', 'POV'],
        sizes: ['1"x2"', '2"x3"', '3"x4"', '4"x6"', '6"x8"', '8"x10"', '10"x12"'],
        setPressures: ['15 PSIG', '50 PSIG', '100 PSIG', '150 PSIG', '300 PSIG', '600 PSIG'],
        materials: ['Carbon Steel', '316 SS', 'Alloy 20', 'Duplex SS'],
        description: 'Pilot-operated pressure relief valve for high capacity applications. Superior seat tightness up to 98% of set pressure. Snap or modulating action configurations. Field-testable without removal from service.',
        features: ['High seat tightness', 'Field testable', 'Snap or modulating', 'Remote sense option', 'Backflow preventer', 'Low pressure drop'],
      },
      {
        name: 'Balanced Bellows Safety Valve',
        prefixes: ['BB', 'BBS', 'JBS', 'SB'],
        sizes: ['1"x2"', '1.5"x3"', '2"x3"', '3"x4"', '4"x6"'],
        setPressures: ['50 PSIG', '100 PSIG', '150 PSIG', '300 PSIG', '600 PSIG'],
        materials: ['316 SS', 'Alloy 20', 'Hastelloy C', 'Monel', 'Inconel'],
        description: 'Balanced bellows design eliminates superimposed backpressure effects. Ideal for variable backpressure systems and corrosive service. Stainless steel bellows with protective bonnet. Maintains consistent set pressure regardless of outlet conditions.',
        features: ['Backpressure immune', 'Stainless bellows', 'Corrosive service', 'Protected bonnet', 'Consistent set point', 'API 526 compliant'],
      },
      {
        name: 'Thermal Relief Valve',
        prefixes: ['TR', 'TV', 'TS', 'TRV'],
        sizes: ['1/2"', '3/4"', '1"', '1-1/2"', '2"'],
        setPressures: ['25 PSIG', '50 PSIG', '75 PSIG', '100 PSIG', '150 PSIG'],
        materials: ['Bronze', 'Carbon Steel', '316 SS'],
        description: 'Thermal relief valve for blocked liquid expansion protection. Low lift design for small capacity requirements in heat exchangers and pipelines. Bronze body standard for cooling water systems.',
        features: ['Thermal expansion relief', 'Low lift design', 'Compact size', 'Threaded connection', 'Bronze construction', 'Field adjustable'],
      },
      {
        name: 'Vacuum Relief Valve',
        prefixes: ['VR', 'VV', 'PVR', 'VC'],
        sizes: ['2"', '3"', '4"', '6"', '8"', '10"', '12"'],
        setPressures: ['0.5 oz/in²', '1 oz/in²', '2 oz/in²', '4 oz/in²', '8 oz/in²'],
        materials: ['Aluminum', 'Carbon Steel', '316 SS', 'Ductile Iron'],
        description: 'Vacuum relief valve protects atmospheric storage tanks from collapse during product withdrawal. Weight-loaded or spring-loaded pallet designs. Flame arrester integration available for flammable service.',
        features: ['Tank protection', 'Weight or spring loaded', 'Flame arrester option', 'Low pressure setting', 'ASME/API compliant', 'Emergency vent sizing'],
      },
      {
        name: 'Rupture Disc',
        prefixes: ['RD', 'SRD', 'GRD', 'FRD'],
        sizes: ['1/2"', '1"', '2"', '3"', '4"', '6"', '8"', '10"', '12"'],
        setPressures: ['15 PSIG', '50 PSIG', '100 PSIG', '300 PSIG', '600 PSIG', '1500 PSIG'],
        materials: ['316 SS', 'Inconel', 'Hastelloy', 'Tantalum', 'PTFE Lined'],
        description: 'Rupture disc provides fast-acting pressure relief for runaway reactions and explosions. Pre-scored, forward-acting, or reverse-buckling designs. Burst tolerance of ±2% at rated temperature. Non-fragmenting designs available.',
        features: ['Instantaneous relief', '±2% burst tolerance', 'Non-fragmenting option', 'Vacuum support', 'Temperature compensated', 'ASME certified'],
      },
      {
        name: 'Pressure/Vacuum Vent',
        prefixes: ['PV', 'PVRV', 'CV', 'TV'],
        sizes: ['2"', '3"', '4"', '6"', '8"', '10"', '12"', '16"', '20"'],
        setPressures: ['0.5 oz/in²', '1 oz/in²', '2 oz/in²', '4 oz/in²', '8 oz/in²', '16 oz/in²'],
        materials: ['Aluminum', 'Carbon Steel', '316 SS'],
        description: 'Pressure/vacuum relief valve for atmospheric storage tank protection. Combination design handles both overpressure and vacuum conditions. Weight or spring-loaded pallet with Viton, Buna-N, or PTFE seats.',
        features: ['Dual protection', 'API 2000 compliant', 'Low emissions', 'Weatherhood included', 'Seat materials options', 'Emergency vent sizing'],
      },
      {
        name: 'Low Pressure Relief Valve',
        prefixes: ['LP', 'LPR', 'BR', 'BPR'],
        sizes: ['1"', '2"', '3"', '4"', '6"'],
        setPressures: ['1 PSIG', '2 PSIG', '5 PSIG', '10 PSIG', '15 PSIG', '25 PSIG'],
        materials: ['Cast Iron', 'Ductile Iron', 'Aluminum', 'Bronze'],
        description: 'Low pressure relief valve for steam, air, and gas systems. Back pressure regulator or relief service configurations. Large diaphragm provides sensitive response to small pressure changes.',
        features: ['Low pressure rated', 'High sensitivity', 'Large diaphragm', 'Back pressure service', 'Internal relief', 'Adjustable range'],
      },
    ],
  },
  Tank: {
    manufacturers: [
      'CST Industries', 'Highland Tank', 'TF Warren', 'Pfaudler', 'De Dietrich', 'Paul Mueller', 'GEA',
      'Alfa Laval', 'Walker Stainless', 'Apache Stainless', 'Lee Industries', 'Matrix Service',
      'Tank Connection', 'Chicago Bridge & Iron', 'McDermott', 'Caldwell Tanks', 'Snyder Industries',
      'Enduramaxx', 'Roth', 'ZCL Composites', 'Containment Solutions', 'Superior Tank',
      'Poly Processing', 'Chem-Tainer', 'Ace Roto-Mold', 'Norwesco', 'Kennedy Tank',
      'Steel Tank Institute', 'Modern Welding', 'General Industries', 'Hamilton Tank'
    ],
    types: [
      {
        name: 'Atmospheric Storage Tank',
        prefixes: ['AST', 'VST', 'FST', 'CST'],
        capacities: ['1000 GAL', '5000 GAL', '10000 GAL', '25000 GAL', '50000 GAL', '100000 GAL', '500000 GAL'],
        materials: ['Carbon Steel', '304 SS', '316 SS', 'Fiberglass', 'Polyethylene'],
        description: 'API 650 atmospheric storage tank for petroleum, water, and chemical storage. Cone, dome, or floating roof options available. Internal floating roof for emission control and product quality. Designed for ambient temperature and minimal internal pressure.',
        features: ['API 650 design', 'Cone or dome roof', 'Internal floating roof', 'Emission control', 'Corrosion allowance', 'Seismic design option'],
      },
      {
        name: 'Pressure Vessel',
        prefixes: ['PV', 'HV', 'VV', 'RV'],
        capacities: ['100 GAL', '500 GAL', '1000 GAL', '2500 GAL', '5000 GAL', '10000 GAL'],
        pressures: ['15 PSIG', '50 PSIG', '150 PSIG', '300 PSIG', '600 PSIG', '1500 PSIG'],
        materials: ['Carbon Steel', '304 SS', '316 SS', 'Hastelloy', 'Monel', 'Titanium'],
        description: 'ASME Section VIII Division 1 pressure vessel for process applications. Horizontal or vertical orientation with saddle, leg, or lug supports. U-stamp certified with MDR documentation. Designed for elevated pressure and temperature service.',
        features: ['ASME VIII certified', 'U-stamp included', 'PWHT available', 'Radiography tested', 'CRN certified', 'Custom nozzle layout'],
      },
      {
        name: 'Process Mixing Tank',
        prefixes: ['PT', 'MT', 'BT', 'RT'],
        capacities: ['100 GAL', '500 GAL', '1000 GAL', '2500 GAL', '5000 GAL', '10000 GAL'],
        materials: ['304 SS', '316 SS', '316L SS', 'Hastelloy'],
        description: 'Process mixing tank with agitator nozzle provisions. Jacketed construction for heating/cooling with dimple jacket or half-pipe coil. CIP spray ball connections included. Electropolished interior finish available.',
        features: ['Jacketed design', 'Agitator ready', 'CIP cleanable', 'Electropolished option', 'Sanitary connections', 'Insulated jacket'],
      },
      {
        name: 'Double Wall Tank',
        prefixes: ['DW', 'FDW', 'CDW', 'SDW'],
        capacities: ['550 GAL', '1000 GAL', '2500 GAL', '5000 GAL', '10000 GAL', '20000 GAL'],
        materials: ['Carbon Steel', 'Fiberglass', 'Polyethylene'],
        description: 'Double wall tank with 110% secondary containment for hazardous material storage. Interstitial space monitoring for leak detection. UL 142 or STI-P3 certified for aboveground storage. Meets EPA SPCC requirements.',
        features: ['110% containment', 'Leak detection', 'UL 142 listed', 'Interstitial monitor', 'Spill containment', 'EPA compliant'],
      },
      {
        name: 'Heat Exchanger',
        prefixes: ['HX', 'SH', 'TH', 'PH'],
        capacities: ['100 ft²', '250 ft²', '500 ft²', '1000 ft²', '2500 ft²', '5000 ft²'],
        pressures: ['150 PSIG', '300 PSIG', '600 PSIG'],
        materials: ['Carbon Steel', '304 SS', '316 SS', 'Titanium', 'Hastelloy'],
        description: 'Shell and tube heat exchanger per TEMA Class B, C, or R standards. Fixed tubesheet, U-tube, or floating head bundle designs. Multiple shell passes and tube passes for optimal heat transfer. ASME code stamped construction.',
        features: ['TEMA certified', 'ASME code stamped', 'Removable bundle', 'Expansion joint option', 'Tube count options', 'Baffled shell'],
      },
      {
        name: 'Reactor Vessel',
        prefixes: ['RV', 'CR', 'BR', 'PR'],
        capacities: ['50 GAL', '100 GAL', '500 GAL', '1000 GAL', '2500 GAL'],
        pressures: ['50 PSIG', '150 PSIG', '300 PSIG', 'Full Vacuum'],
        materials: ['316L SS', 'Hastelloy', 'Glass Lined', 'Titanium'],
        description: 'Jacketed reactor vessel for chemical batch processing. Glass-lined or stainless steel construction with anchor or pitched blade agitator. Designed for full vacuum to elevated pressure service. Temperature rating to 500°F.',
        features: ['Jacketed design', 'Vacuum rated', 'Glass lined option', 'Agitator included', 'Bottom outlet', 'Sight glass ports'],
      },
      {
        name: 'Separator',
        prefixes: ['SP', 'VS', 'HS', 'TS'],
        capacities: ['100 GAL', '500 GAL', '1000 GAL', '2500 GAL', '5000 GAL', '10000 GAL'],
        pressures: ['150 PSIG', '300 PSIG', '600 PSIG', '1440 PSIG'],
        materials: ['Carbon Steel', '316 SS', 'Clad Steel'],
        description: 'Two-phase or three-phase separator for oil/water/gas separation. Horizontal or vertical orientation with inlet device for gas distribution. Weir plates and coalescing media for enhanced separation. Level instruments and pressure safety included.',
        features: ['Multi-phase separation', 'Inlet device', 'Coalescer media', 'Level instruments', 'Mist eliminator', 'Sand jet/drain'],
      },
      {
        name: 'Accumulator',
        prefixes: ['AC', 'HA', 'BA', 'PA'],
        capacities: ['1 GAL', '5 GAL', '15 GAL', '50 GAL', '100 GAL', '250 GAL'],
        pressures: ['3000 PSI', '5000 PSI', '6000 PSI', '10000 PSI'],
        materials: ['Carbon Steel', 'Alloy Steel', '316 SS'],
        description: 'Bladder or piston accumulator for hydraulic energy storage and pulsation dampening. Pre-charge pressure certified with nitrogen charge port. Anti-extrusion design extends bladder life. ASME certified construction.',
        features: ['Energy storage', 'Pulsation dampening', 'Pre-charged', 'ASME certified', 'Anti-extrusion', 'High pressure rated'],
      },
      {
        name: 'IBC Tank',
        prefixes: ['IBC', 'CB', 'TB', 'PB'],
        capacities: ['275 GAL', '330 GAL', '350 GAL', '550 GAL'],
        materials: ['HDPE', 'Carbon Steel', '316 SS'],
        description: 'Intermediate bulk container for material handling and storage. Composite (caged poly) or stainless steel construction. UN/DOT rated for hazardous materials transport. Forklift pockets for easy handling.',
        features: ['UN/DOT rated', 'Forklift pockets', 'Stackable design', '2" bottom outlet', 'Vented cap', 'Reusable container'],
      },
      {
        name: 'Surge Tank',
        prefixes: ['ST', 'ET', 'BT', 'UT'],
        capacities: ['50 GAL', '100 GAL', '250 GAL', '500 GAL', '1000 GAL'],
        pressures: ['15 PSIG', '50 PSIG', '150 PSIG'],
        materials: ['Carbon Steel', '304 SS', '316 SS'],
        description: 'Surge tank for pressure dampening and system protection. Bladder or diaphragm type separates gas and liquid. Minimizes water hammer effects in pipeline systems. Pre-charge pressure matched to system requirements.',
        features: ['Pressure dampening', 'Water hammer protection', 'Bladder type', 'Pre-charged', 'ASME optional', 'Mounting brackets'],
      },
    ],
  },
  Transmitter: {
    manufacturers: [
      'Emerson', 'Rosemount', 'Yokogawa', 'Endress+Hauser', 'ABB', 'Siemens', 'Honeywell',
      'WIKA', 'VEGA', 'KROHNE', 'Foxboro', 'Badger Meter', 'Fuji Electric', 'ifm',
      'Pepperl+Fuchs', 'OMEGA', 'Ashcroft', 'Setra', 'Keller', 'Magnetrol', 'SICK',
      'Micro Motion', 'Dwyer', 'Anderson', 'Ametek', 'Gems Sensors', 'SOR', 'United Electric',
      'Barksdale', 'Danfoss', 'Brooks Instrument', 'FCI', 'Kurz', 'Sierra', 'GF Signet'
    ],
    types: [
      {
        name: 'Pressure Transmitter',
        prefixes: ['PT', 'PX', '3051', '266'],
        ranges: ['0-15 PSI', '0-100 PSI', '0-300 PSI', '0-1000 PSI', '0-3000 PSI', '0-6000 PSI', '0-10000 PSI'],
        outputs: ['4-20mA', '4-20mA HART', 'Foundation Fieldbus', 'PROFIBUS PA', 'WirelessHART'],
        materials: ['316L SS', 'Hastelloy C', 'Tantalum', 'Monel', 'Titanium'],
        description: 'Smart pressure transmitter with HART, Foundation Fieldbus, or Profibus PA communication. 4-20mA output with digital overlay for configuration and diagnostics. ±0.04% reference accuracy with 10-year stability. Explosion-proof and intrinsically safe approvals.',
        features: ['±0.04% accuracy', 'HART communication', '10-year stability', 'SIL 2/3 certified', 'Remote configuration', 'Explosion-proof'],
      },
      {
        name: 'Temperature Transmitter',
        prefixes: ['TT', 'TX', '3144', '644'],
        ranges: ['-40 to 400°F', '-40 to 600°F', '0 to 1200°F', '0 to 1800°F', '0 to 2500°F'],
        outputs: ['4-20mA', '4-20mA HART', 'Foundation Fieldbus'],
        materials: ['316 SS', 'Alloy 600', 'Hastelloy'],
        description: 'RTD or thermocouple temperature transmitter with dual sensor input and sensor backup capability. HART or Foundation Fieldbus communication with advanced diagnostics. Thermowell assembly available. Explosion-proof housing for hazardous areas.',
        features: ['Dual sensor input', 'Sensor backup', 'Drift alert', 'Hot backup', 'Thermowell assembly', 'Head or rail mount'],
      },
      {
        name: 'Level Transmitter',
        prefixes: ['LT', 'LX', '3301', '5400'],
        ranges: ['0-3 ft', '0-10 ft', '0-30 ft', '0-50 ft', '0-100 ft'],
        outputs: ['4-20mA', '4-20mA HART', 'Foundation Fieldbus', 'WirelessHART'],
        materials: ['316L SS', 'Hastelloy C', 'PTFE Coated', 'PFA Lined'],
        description: 'Guided wave radar or non-contact radar level transmitter. Top-down installation without process interruption. High accuracy for interface measurement in separator vessels. Unaffected by density, viscosity, or dielectric changes.',
        features: ['Radar technology', 'No calibration needed', 'Interface measurement', 'High accuracy', 'Top-down install', 'Empty tank detection'],
      },
      {
        name: 'Flow Transmitter',
        prefixes: ['FT', 'FX', '8700', 'CMF'],
        ranges: ['0-50 GPM', '0-100 GPM', '0-500 GPM', '0-1000 GPM', '0-5000 GPM'],
        outputs: ['4-20mA', '4-20mA HART', 'Foundation Fieldbus', 'Pulse Output'],
        materials: ['316L SS', 'Hastelloy C', 'Titanium', 'Tantalum'],
        description: 'Magnetic flow transmitter for conductive liquids. Liner options include PTFE, PFA, rubber, and ceramic for various services. ±0.15% flow accuracy with bi-directional measurement. Empty pipe detection and electrode cleaning features.',
        features: ['±0.15% accuracy', 'Bi-directional', 'No moving parts', 'Empty pipe detect', 'Electrode cleaning', 'Liner options'],
      },
      {
        name: 'Differential Pressure Transmitter',
        prefixes: ['DP', 'DX', '3051S', '266D'],
        ranges: ['0-25 inH2O', '0-100 inH2O', '0-400 inH2O', '0-1000 inH2O'],
        outputs: ['4-20mA', '4-20mA HART', 'Foundation Fieldbus'],
        materials: ['316L SS', 'Hastelloy C', 'Monel', 'Tantalum'],
        description: 'DP transmitter for flow measurement with orifice, venturi, or wedge primary elements. Also used for level measurement in pressurized vessels. Remote seal systems extend process isolation capability. Coplanar or traditional flange mounting.',
        features: ['Flow or level', 'Remote seal systems', 'Coplanar design', 'High static pressure', 'Low process drift', 'Square root output'],
      },
      {
        name: 'Multivariable Transmitter',
        prefixes: ['MV', 'MVX', '3051SMV', '266M'],
        ranges: ['0-25 inH2O', '0-100 inH2O', '0-400 inH2O'],
        outputs: ['4-20mA HART', 'Foundation Fieldbus'],
        materials: ['316L SS', 'Hastelloy C'],
        description: 'Multivariable transmitter measures differential pressure, static pressure, and process temperature. Integral mass flow calculation using AGA, ISO, or ASME standards. Reduces installation points and improves measurement accuracy.',
        features: ['Three-in-one', 'Mass flow output', 'AGA/ISO calculation', 'Reduced install cost', 'Integral RTD', 'Compensated output'],
      },
      {
        name: 'Coriolis Mass Flowmeter',
        prefixes: ['CMF', 'MFT', 'RHM', 'TCM'],
        ranges: ['0-50 lb/min', '0-200 lb/min', '0-1000 lb/min', '0-5000 lb/min'],
        outputs: ['4-20mA', '4-20mA HART', 'Foundation Fieldbus', 'Modbus'],
        materials: ['316L SS', 'Hastelloy C', 'Titanium'],
        description: 'Coriolis mass flowmeter for direct mass flow and density measurement. No upstream/downstream straight pipe requirements. High accuracy ±0.05% for custody transfer applications. Self-draining tube designs available for sanitary applications.',
        features: ['±0.05% accuracy', 'Mass and density', 'No straight pipe', 'Custody transfer', 'Self-draining option', 'Gas/liquid service'],
      },
      {
        name: 'pH/ORP Transmitter',
        prefixes: ['AX', 'PHT', '56', '1056'],
        ranges: ['0-14 pH', '-2000 to +2000 mV'],
        outputs: ['4-20mA', '4-20mA HART', 'Foundation Fieldbus', 'Modbus'],
        materials: ['316 SS', 'CPVC', 'PVDF', 'Titanium'],
        description: 'Intelligent pH/ORP analyzer with predictive sensor diagnostics. Two-wire loop powered or four-wire installation. Automatic temperature compensation and electrode health monitoring. Multiple sensor inputs with failover capability.',
        features: ['Predictive diagnostics', 'Temp compensation', 'Electrode health', 'Dual input', 'Self-cleaning option', 'Wet/dry installation'],
      },
      {
        name: 'Gas Detector',
        prefixes: ['GD', 'GX', 'DG', 'SGD'],
        ranges: ['0-100% LEL', '0-100 ppm', '0-1000 ppm', '0-25% O2'],
        outputs: ['4-20mA', '4-20mA HART', 'Modbus', 'Relay Outputs'],
        materials: ['316 SS', 'Aluminum', 'Engineered Plastic'],
        description: 'Fixed gas detector for toxic and combustible gas monitoring. Catalytic bead, infrared, or electrochemical sensing technologies. SIL 2 rated for safety instrumented systems. Local display with alarm relays.',
        features: ['SIL 2 rated', 'Local display', 'Alarm relays', 'Sensor types', 'Self-test function', 'Remote calibration'],
      },
      {
        name: 'Vibration Transmitter',
        prefixes: ['VT', 'VX', '2120', 'VIB'],
        ranges: ['0-1 in/s', '0-2 in/s', '0-5 in/s', '0-25 g'],
        outputs: ['4-20mA', '4-20mA HART', 'Modbus', 'Relay Outputs'],
        materials: ['316 SS', 'Aluminum'],
        description: 'Machinery vibration transmitter for rotating equipment condition monitoring. Measures velocity, acceleration, and displacement. 4-20mA proportional output or switch contacts for alarm annunciation. Integral temperature measurement available.',
        features: ['Velocity and acceleration', 'Integral temperature', '4-20mA output', 'Switch contacts', 'Compact design', 'Easy installation'],
      },
    ],
  },
  Electric: {
    manufacturers: [
      'Siemens', 'ABB', 'Schneider Electric', 'GE', 'Mitsubishi Electric', 'Rockwell Automation',
      'Eaton', 'WEG', 'Danfoss', 'Yaskawa', 'Omron', 'Toshiba', 'Baldor', 'TECO-Westinghouse',
      'Nidec', 'SEW-Eurodrive', 'Lenze', 'Bonfiglioli', 'Nord Drivesystems', 'Kollmorgen',
      'Allen-Bradley', 'Marathon', 'Leeson', 'Brook Crompton', 'Regal Rexnord', 'Vacon',
      'Delta Electronics', 'Hitachi', 'Fuji Electric', 'LS Electric', 'Hyundai Electric'
    ],
    types: [
      {
        name: 'Electric Motor',
        prefixes: ['EM', 'AC', 'XP', 'HD'],
        powers: ['0.5 HP', '1 HP', '3 HP', '5 HP', '10 HP', '25 HP', '50 HP', '100 HP', '200 HP', '500 HP'],
        voltages: ['208V', '230V', '460V', '575V', '2300V', '4160V'],
        enclosures: ['ODP', 'TEFC', 'TEBC', 'TENV', 'TEAO', 'XP'],
        description: 'TEFC induction motor for industrial pump, fan, and compressor applications. Premium efficiency IE3/IE4 rated per NEMA and IEC standards. Inverter duty capable with reinforced insulation system. Class F insulation with Class B temperature rise.',
        features: ['Premium efficiency', 'Inverter duty', 'Class F insulation', 'Heavy-duty bearings', 'Cast iron frame', 'NEMA Premium'],
      },
      {
        name: 'Variable Frequency Drive',
        prefixes: ['VFD', 'ACS', 'PF', 'MX'],
        powers: ['0.5 HP', '1 HP', '5 HP', '10 HP', '25 HP', '50 HP', '100 HP', '250 HP', '500 HP'],
        voltages: ['208V', '230V', '480V', '600V'],
        enclosures: ['IP20', 'IP54', 'IP55', 'NEMA 1', 'NEMA 4X', 'NEMA 12'],
        description: 'Variable frequency drive for motor speed control and energy savings. Built-in EMC filter and DC choke for power quality. Safe Torque Off (STO) function for safety applications. Multiple communication protocols including Modbus, Profibus, and Ethernet/IP.',
        features: ['Energy savings', 'STO function', 'Built-in EMC filter', 'PID control', 'Multi-protocol', 'Bypass option'],
      },
      {
        name: 'Motor Control Center',
        prefixes: ['MCC', 'MC', 'LV', 'CC'],
        powers: ['400A', '800A', '1200A', '2000A', '3000A', '4000A'],
        voltages: ['480V', '600V'],
        enclosures: ['NEMA 1', 'NEMA 3R', 'NEMA 4', 'NEMA 12'],
        description: 'Low voltage motor control center for centralized motor control and protection. Arc-resistant design available per IEEE C37.20.7. Intelligent motor controllers with communication and diagnostics. Coordination study and arc flash analysis included.',
        features: ['Arc-resistant', 'Intelligent MCCs', 'Communication', 'Coordination study', 'Arc flash analysis', 'Type-tested'],
      },
      {
        name: 'Soft Starter',
        prefixes: ['SS', 'PSR', 'SMC', 'DS'],
        powers: ['5 HP', '10 HP', '25 HP', '50 HP', '100 HP', '250 HP', '500 HP'],
        voltages: ['208V', '230V', '480V', '600V'],
        enclosures: ['IP20', 'NEMA 1', 'NEMA 4', 'NEMA 12'],
        description: 'Solid-state soft starter reduces starting current and mechanical stress. Adjustable starting torque and acceleration time. Built-in motor protection including thermal overload, phase loss, and ground fault. Bypass contactor for full efficiency in run mode.',
        features: ['Reduced starting current', 'Motor protection', 'Bypass contactor', 'Soft stop', 'Pump control', 'Communication option'],
      },
      {
        name: 'Transformer',
        prefixes: ['TR', 'DT', 'PT', 'IT'],
        powers: ['15 kVA', '45 kVA', '75 kVA', '150 kVA', '300 kVA', '500 kVA', '1000 kVA', '2500 kVA'],
        voltages: ['480V', '600V', '4160V', '13.8kV', '34.5kV'],
        enclosures: ['Indoor', 'Outdoor', 'Pad-mounted', 'Substation'],
        description: 'Dry-type or liquid-filled transformer for power distribution. Class F or Class H insulation with temperature monitoring. Copper or aluminum windings with electrostatic shield. K-rated designs for non-linear loads.',
        features: ['Temperature monitoring', 'Electrostatic shield', 'K-rated option', 'Fan cooling', 'Tap changer', 'DOE efficient'],
      },
      {
        name: 'UPS System',
        prefixes: ['UPS', 'PW', 'SY', 'MG'],
        powers: ['1 kVA', '3 kVA', '10 kVA', '30 kVA', '100 kVA', '300 kVA', '750 kVA'],
        voltages: ['120V', '208V', '480V'],
        enclosures: ['Rack-mount', 'Tower', 'Cabinet'],
        description: 'Online double-conversion UPS system for critical power applications. True sine wave output with zero transfer time. Modular design for N+1 redundancy and hot-swappable batteries. Remote monitoring via SNMP/Modbus.',
        features: ['Double-conversion', 'Zero transfer', 'Modular design', 'Hot-swap batteries', 'Remote monitoring', 'Bypass switch'],
      },
      {
        name: 'Generator',
        prefixes: ['GEN', 'DG', 'PG', 'EG'],
        powers: ['30 kW', '60 kW', '100 kW', '250 kW', '500 kW', '1000 kW', '2000 kW'],
        voltages: ['208V', '480V', '600V', '4160V'],
        enclosures: ['Open', 'Weather-protected', 'Sound-attenuated'],
        description: 'Diesel or natural gas generator set for standby or prime power. Automatic transfer switch for seamless utility/generator transition. EPA Tier 4 emissions compliant. Remote monitoring and load management features.',
        features: ['Automatic start', 'Transfer switch', 'EPA Tier 4', 'Remote monitoring', 'Load management', 'Paralleling capable'],
      },
      {
        name: 'Circuit Breaker',
        prefixes: ['CB', 'NX', 'TM', 'HG'],
        ratings: ['15A', '30A', '60A', '100A', '225A', '400A', '800A', '1600A', '3000A', '4000A'],
        voltages: ['120V', '240V', '480V', '600V'],
        enclosures: ['Molded Case', 'Insulated Case', 'Low Voltage Power'],
        description: 'Molded case or low voltage power circuit breaker. Thermal-magnetic or electronic trip units with adjustable settings. Current limiting for enhanced protection. Arc flash reduction maintenance switch available.',
        features: ['Adjustable trip', 'Current limiting', 'Arc flash reduction', 'Ground fault', 'Zone selective', 'Communication option'],
      },
      {
        name: 'PLC Controller',
        prefixes: ['PLC', 'S7', 'CP', 'RX'],
        types: ['Compact', 'Modular', 'Distributed I/O', 'Safety'],
        voltages: ['24VDC', '120VAC'],
        enclosures: ['Panel Mount', 'DIN Rail', 'Rack Mount'],
        description: 'Programmable logic controller for process automation. Modular I/O with hot-swappable capability. Ethernet/IP, Modbus TCP, and Profinet protocols. Safety PLC options for SIL 3 applications.',
        features: ['Modular I/O', 'Hot-swappable', 'Multi-protocol', 'Safety rated', 'Web server', 'Data logging'],
      },
      {
        name: 'Contactor',
        prefixes: ['MC', 'LC', 'AF', 'CL'],
        ratings: ['9A', '18A', '32A', '65A', '100A', '185A', '300A', '500A'],
        voltages: ['24VDC', '120VAC', '240VAC', '480VAC'],
        enclosures: ['Open', 'Enclosed', 'Reversing'],
        description: 'IEC or NEMA magnetic contactor for motor and resistive load switching. Electronic coil for wide voltage tolerance and low power consumption. AC-3 duty rated with long mechanical life. Auxiliary contact blocks available.',
        features: ['Electronic coil', 'AC-3 rated', 'Aux contacts', 'Reversing option', 'Long life', 'DIN rail mount'],
      },
    ],
  },
};

function generateModelNumber(prefix: string, index: number): string {
  const series = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X'];
  const numPart = String(1000 + (index % 9000)).padStart(4, '0');
  const seriesLetter = series[index % series.length];
  const suffix = ['', '-A', '-B', '-C', '-D', '-X', '-S', '-H', '-L', '-P'][index % 10];
  return `${prefix}${seriesLetter}-${numPart}${suffix}`;
}

function generateSerialNumber(index: number): string {
  const year = 2024 + (index % 2);
  const month = String(1 + (index % 12)).padStart(2, '0');
  const seq = String(10000 + (index % 90000)).padStart(5, '0');
  return `SN${year}${month}-${seq}`;
}

function getRandomItem<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function generateProducts(category: string, count: number = 1000): any[] {
  const catalog = productCatalog[category as keyof typeof productCatalog];
  if (!catalog) return [];

  const products: any[] = [];
  const { manufacturers, types } = catalog;
  
  let productIndex = 0;
  
  while (products.length < count) {
    for (const type of types) {
      for (const manufacturer of manufacturers) {
        if (products.length >= count) break;
        
        const prefix = getRandomItem(type.prefixes, productIndex);
        const modelNumber = generateModelNumber(prefix, productIndex);
        const serialNumber = generateSerialNumber(productIndex);
        
        // Get specifications based on product type
        let specString = '';
        if ('sizes' in type && type.sizes) {
          specString = getRandomItem(type.sizes as string[], productIndex);
        } else if ('flows' in type && type.flows) {
          specString = getRandomItem(type.flows as string[], productIndex);
        } else if ('capacities' in type && type.capacities) {
          specString = getRandomItem(type.capacities as string[], productIndex);
        } else if ('ranges' in type && type.ranges) {
          specString = getRandomItem(type.ranges as string[], productIndex);
        } else if ('powers' in type && type.powers) {
          specString = getRandomItem(type.powers as string[], productIndex);
        }
        
        // Get material/pressure/voltage
        let secondSpec = '';
        if ('pressures' in type && type.pressures) {
          secondSpec = getRandomItem(type.pressures as string[], productIndex + 7);
        } else if ('outputs' in type && type.outputs) {
          secondSpec = getRandomItem(type.outputs as string[], productIndex + 7);
        } else if ('voltages' in type && type.voltages) {
          secondSpec = getRandomItem(type.voltages as string[], productIndex + 7);
        }
        
        // Get material
        let material = '';
        if ('materials' in type && type.materials) {
          material = getRandomItem(type.materials as string[], productIndex + 13);
        } else if ('enclosures' in type && type.enclosures) {
          material = getRandomItem(type.enclosures as string[], productIndex + 13);
        }
        
        const productName = `${type.name} ${specString}`.trim();
        const title = `${manufacturer} ${productName}`;
        
        // Build enhanced description with features
        const features = 'features' in type && type.features 
          ? type.features.slice(0, 3).join('. ') + '.' 
          : '';
        const fullDescription = `${type.description} ${features}`;
        
        products.push({
          manufacturer_name: manufacturer,
          category,
          title,
          product_name: productName,
          model_number: modelNumber,
          serial_number: serialNumber,
          description: fullDescription,
          specs: {
            size: specString,
            pressure_or_output: secondSpec,
            material_or_enclosure: material,
          },
        });
        
        productIndex++;
      }
    }
  }
  
  return products.slice(0, count);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      category, 
      productsPerCategory = 1000, 
      clearExisting = false,
      batchSize = 200
    } = await req.json().catch(() => ({}));
    
    const categories = category 
      ? [category] 
      : ['Valve', 'Pump', 'PSV', 'Tank', 'Transmitter', 'Electric'];
    
    const results: any = {
      processed: 0,
      inserted: 0,
      errors: [],
      categories: {},
    };
    
    // Optionally clear existing data
    if (clearExisting) {
      console.log('Clearing existing materials...');
      const { error: deleteError } = await supabase
        .from('materials')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.error('Error clearing materials:', deleteError);
        results.errors.push(`Delete error: ${deleteError.message}`);
      } else {
        console.log('Existing materials cleared');
      }
    }
    
    // Get or create manufacturers
    const { data: existingManufacturers } = await supabase
      .from('manufacturers')
      .select('id, name');
    
    const manufacturerMap = new Map<string, string>(
      existingManufacturers?.map(m => [m.name.toLowerCase(), m.id]) || []
    );
    
    console.log(`Found ${manufacturerMap.size} existing manufacturers`);
    
    // Collect all unique manufacturers
    const allManufacturers = new Set<string>();
    for (const cat of categories) {
      const catalog = productCatalog[cat as keyof typeof productCatalog];
      if (catalog) {
        catalog.manufacturers.forEach(m => allManufacturers.add(m));
      }
    }
    
    // Create missing manufacturers
    const newManufacturers = [...allManufacturers]
      .filter(name => !manufacturerMap.has(name.toLowerCase()))
      .map(name => ({ name }));
    
    if (newManufacturers.length > 0) {
      console.log(`Creating ${newManufacturers.length} new manufacturers...`);
      
      // Insert in batches of 50
      for (let i = 0; i < newManufacturers.length; i += 50) {
        const batch = newManufacturers.slice(i, i + 50);
        const { data: created, error } = await supabase
          .from('manufacturers')
          .insert(batch)
          .select('id, name');
        
        if (error) {
          console.error('Error creating manufacturers:', error);
          results.errors.push(`Manufacturer error: ${error.message}`);
        } else if (created) {
          created.forEach(m => manufacturerMap.set(m.name.toLowerCase(), m.id));
        }
      }
      
      console.log(`Manufacturers now: ${manufacturerMap.size}`);
    }
    
    // Process each category
    for (const cat of categories) {
      console.log(`\n=== Generating ${productsPerCategory} products for ${cat} ===`);
      
      const products = generateProducts(cat, productsPerCategory);
      results.processed += products.length;
      results.categories[cat] = { generated: products.length, inserted: 0 };
      
      // Insert in batches
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        
        const materialsToInsert = batch
          .map(p => {
            const manufacturerId = manufacturerMap.get(p.manufacturer_name.toLowerCase());
            if (!manufacturerId) {
              console.warn(`No manufacturer ID for: ${p.manufacturer_name}`);
              return null;
            }
            
            return {
              manufacturer_id: manufacturerId,
              category: p.category,
              title: p.title,
              product_name: p.product_name,
              model_number: p.model_number,
              serial_number: p.serial_number,
              rating: 0,
              purchase_count: 0,
            };
          })
          .filter(Boolean);
        
        if (materialsToInsert.length > 0) {
          const { data, error } = await supabase
            .from('materials')
            .insert(materialsToInsert)
            .select('id');
          
          if (error) {
            console.error(`Error inserting batch ${i}-${i + batchSize} for ${cat}:`, error);
            results.errors.push(`Insert error (${cat}): ${error.message}`);
          } else {
            const count = data?.length || 0;
            results.inserted += count;
            results.categories[cat].inserted += count;
            console.log(`Inserted batch ${i}-${i + batchSize}: ${count} products`);
          }
        }
      }
      
      console.log(`Completed ${cat}: ${results.categories[cat].inserted} products`);
    }
    
    // Get final counts
    const { count: totalMaterials } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });
    
    return new Response(JSON.stringify({
      success: true,
      message: `Imported ${results.inserted} products across ${categories.length} categories`,
      totalProductsInDatabase: totalMaterials,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});