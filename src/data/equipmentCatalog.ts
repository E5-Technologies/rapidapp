// Equipment catalog data with manufacturer names and catalog URLs
// This data is used to find product images for materials

export interface ManufacturerCatalog {
  name: string;
  catalogUrls: string[];
  logoUrl?: string;
  category: string;
}

export const equipmentCatalog: ManufacturerCatalog[] = [
  // Valves
  { name: "Balon Corporation", category: "Valves", catalogUrls: ["https://www.balon.com/downloads/CompleteCatalog.pdf"] },
  { name: "Bray International", category: "Valves", catalogUrls: ["https://www.bray.com/docs/default-source/brochures/product-brochures/en_bpac_1003_maxicheck.pdf"] },
  { name: "Kimray", category: "Valves", catalogUrls: ["https://kimray.com/sites/default/files/import/documents/catalog/01_.pdf"] },
  { name: "Franklin Valve", category: "Valves", catalogUrls: ["https://www.franklinvalve.com/Assets/franklin-valve-dbb-brochure-november-2025.pdf"] },
  { name: "Flowserve", category: "Valves", catalogUrls: ["https://www.flowserve.com/products/products-catalog/valves"], logoUrl: "flowserve" },
  { name: "Fisher", category: "Valves", catalogUrls: ["https://www.emerson.com/documents/automation/brochure-catalog-of-fisher-control-valves-instruments-en-11736646.pdf"] },
  { name: "Cameron", category: "Valves", catalogUrls: ["https://www.slb.com/valves"], logoUrl: "cameron" },
  { name: "Velan", category: "Valves", catalogUrls: ["https://www.scribd.com/document/170944278/Velan-Valves-catalog-pdf"], logoUrl: "velan" },
  { name: "Bonney Forge", category: "Valves", catalogUrls: ["https://bonneyforge.com/products/valves.php"] },
  { name: "Victaulic", category: "Valves", catalogUrls: ["https://www.victaulic.com/vtc_product_categories/ball/"] },
  { name: "Warren Valve", category: "Valves", catalogUrls: ["https://www.warrenvalve.com/Warren_Valve_Condensed_Valve_Guide_Linecard.pdf"] },
  { name: "Mercer", category: "Valves", catalogUrls: ["https://www.mercervalve.net/products/"] },
  { name: "Taylor", category: "Valves", catalogUrls: ["https://taylorvalve.com/product/taylor-valve-products/safety-relief-valves/"] },
  { name: "SCV", category: "Valves", catalogUrls: ["https://www.scvvalve.com/products"] },
  { name: "WKM", category: "Valves", catalogUrls: ["https://www.valvesalesinc.com/brands/wkm"] },
  { name: "PBV", category: "Valves", catalogUrls: ["https://f-e-t.com/wp-content/uploads/2025/05/PBV-Oil-and-Gas-Industrial-Valves.pdf"] },
  { name: "KF Industries", category: "Valves", catalogUrls: ["https://www.kfvalves.com/files/downloads/new-brochure/kfv-product-summary-v2.pdf"] },
  { name: "Wheatley", category: "Valves", catalogUrls: ["https://media.americanwheatley.com/wp-content/uploads/2023/04/American-Wheatley-HVAC-Website-Catalogue.pdf"] },
  { name: "Crosby", category: "Valves", catalogUrls: ["https://www.cornerstonecontrols.com/products/pressure-management/pressure-relief-safety-valves/"] },
  { name: "Eanardo", category: "Valves", catalogUrls: ["https://www.emerson.com/documents/automation/product-brochure-tank-management-catalog-fisher-en-en-5985992.pdf"] },
  { name: "Crane", category: "Valves", catalogUrls: ["https://www.craneco.com/industrial-valves"], logoUrl: "crane" },
  { name: "Baker Hughes", category: "Valves", catalogUrls: ["https://www.bakerhughes.com/products/valves"], logoUrl: "baker-hughes" },
  { name: "Kitz", category: "Valves", catalogUrls: ["https://www.kitzus.com/products/valves"] },
  { name: "Danfoss", category: "Valves", catalogUrls: ["https://www.danfoss.com/en/products/dcv/valves-accessories/"] },
  { name: "AVK", category: "Valves", catalogUrls: ["https://www.avkvalves.com/products"] },
  { name: "Swagelok", category: "Valves", catalogUrls: ["https://www.swagelok.com/en/catalog/Products/Valve"], logoUrl: "swagelok" },
  { name: "SPX Flow", category: "Valves", catalogUrls: ["https://www.spxflow.com/en/Products/Valves"] },
  { name: "Neway", category: "Valves", catalogUrls: ["https://www.newayvalve.com/English/"] },
  { name: "GVC", category: "Valves", catalogUrls: ["https://globalvalveandcontrols.com/wp-content/uploads/2020/02/GVC_Product_Guide_Rev_7-22-15-03_Secure_WEB-Global-Valve-and-Controls-GVC-Catalog-01.pdf"] },
  
  // Automation
  { name: "Emerson", category: "Automation", catalogUrls: ["https://www.emerson.com/en-us/automation/rosemount"], logoUrl: "emerson" },
  { name: "Endress+Hauser", category: "Automation", catalogUrls: ["https://portal.endress.com/dla/5000611/3480/000/15/EHUS-ProductOverview-EC00009Z24EN232500.pdf"] },
  { name: "Siemens", category: "Automation", catalogUrls: ["https://www.siemens.com/us/en/products/automation/process-instrumentation/pi-service/catalogs.html"] },
  { name: "Honeywell", category: "Automation", catalogUrls: ["https://process.honeywell.com/us/en"] },
  { name: "Rockwell Automation", category: "Automation", catalogUrls: ["https://www.rockwellautomation.com/en-us/tools/product-catalog.html"] },
  { name: "Allen-Bradley", category: "Automation", catalogUrls: ["https://www.rockwellautomation.com/en-us/tools/product-catalog.html"] },
  { name: "Schneider Electric", category: "Automation", catalogUrls: ["https://www.se.com/us/en/work/products/industrial-automation/"] },
  { name: "ABB", category: "Automation", catalogUrls: ["https://new.abb.com/process-automation/measurements"] },
  { name: "Yokogawa", category: "Automation", catalogUrls: ["https://www.yokogawa.com/solutions/products-systems/"] },
  { name: "KROHNE", category: "Automation", catalogUrls: ["https://www.krohne.com/en/products-solutions/"] },
  { name: "WIKA", category: "Automation", catalogUrls: ["https://www.wika.com/en-us/Home.jsp"] },
  { name: "Pepperl+Fuchs", category: "Automation", catalogUrls: ["https://www.pepperl-fuchs.com/global/en/"] },
  { name: "IFM", category: "Automation", catalogUrls: ["https://www.ifm.com/us/en/product/"] },
  { name: "Phoenix Contact", category: "Automation", catalogUrls: ["https://www.phoenixcontact.com/online/portal/us"] },
  { name: "Mitsubishi Electric", category: "Automation", catalogUrls: ["https://us.mitsubishielectric.com/fa/en/"] },
  { name: "Omron", category: "Automation", catalogUrls: ["https://automation.omron.com/en/us/"] },
  { name: "Brooks Instrument", category: "Automation", catalogUrls: ["https://www.brooksinstrument.com/en/us/home/"] },
  { name: "FCI", category: "Automation", catalogUrls: ["https://www.fluidcomponents.com/products"] },
  { name: "GE Panametrics", category: "Automation", catalogUrls: ["https://www.gemeasurement.com/"] },
  { name: "MSA", category: "Automation", catalogUrls: ["https://www.msanet.com/en/us"] },
  { name: "Danfoss Measurement", category: "Automation", catalogUrls: ["https://www.danfoss.com/en/products/dcv/"] },
  
  // Tanks
  { name: "Petrosmith", category: "Tanks", catalogUrls: ["https://petrosmith.com/tanks/"] },
  { name: "PermianLide", category: "Tanks", catalogUrls: ["https://www.permianlide.com/"] },
  { name: "Fox Tank", category: "Tanks", catalogUrls: ["https://foxtankcompany.com/"] },
  { name: "Warrior Tank", category: "Tanks", catalogUrls: ["https://www.warriortank.com/"] },
  { name: "Global Vessel & Tank", category: "Tanks", catalogUrls: ["https://www.globalvesselandtank.com/storage-tanks"] },
  { name: "LONG Industries", category: "Tanks", catalogUrls: ["https://longindustries.us/tanks/"] },
  { name: "CST Industries", category: "Tanks", catalogUrls: ["https://www.cstindustries.com/oil-gas/"] },
  { name: "Newberry Tanks", category: "Tanks", catalogUrls: ["https://newberrytanks.com/products/vertical-api-tanks/"] },
  { name: "Advance Tank", category: "Tanks", catalogUrls: ["https://advancetank.com/api_12f_shop_built_tanks/"] },
  { name: "B&L Pipeco", category: "Tanks", catalogUrls: ["https://www.blpipeco.com/"] },
  { name: "Highland Tank", category: "Tanks", catalogUrls: ["https://www.highlandtank.com/api-650-storage-tanks-for-the-oil-natural-gas-industry/"] },
  { name: "Tank Connection", category: "Tanks", catalogUrls: ["https://tankconnection.com/"] },
  { name: "Manchester Tank", category: "Tanks", catalogUrls: ["https://www.manchestertank.com/"] },
  
  // Vessels
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
  { name: "APEX Engineered", category: "Vessels", catalogUrls: ["https://www.apexep.com/products/pressure-vessels"] },
  { name: "Modern Welding", category: "Vessels", catalogUrls: ["https://www.modweldco.com/pressure-vessels"] },
  { name: "Ascension Industries", category: "Vessels", catalogUrls: ["https://www.ascensionindustries.com/pressure-vessels"] },
  { name: "Steel Structures", category: "Vessels", catalogUrls: ["https://www.steelstructuresinc.com/capabilities"] },
  { name: "Steel-Pro", category: "Vessels", catalogUrls: ["https://www.steelpro-inc.com/pressure-vessels"] },
  
  // Pumps
  { name: "Goulds Pumps", category: "Pumps", catalogUrls: ["https://pdf.directindustry.com/viewerCatalog/goulds-pumps/pump-selection-guide/20610-15402.html"], logoUrl: "itt-goulds" },
  { name: "Xylem", category: "Pumps", catalogUrls: ["https://pdf.directindustry.com/viewerCatalog/goulds-pumps/pump-selection-guide/20610-15402.html"], logoUrl: "xylem" },
  { name: "Flowserve Pumps", category: "Pumps", catalogUrls: ["https://www.directindustry.com/prod/flowserve-6194.html"], logoUrl: "flowserve" },
  { name: "Sulzer", category: "Pumps", catalogUrls: ["https://www.sulzer.com/en/-/media/files/products/common/salesprogram_e00543.pdf"], logoUrl: "sulzer" },
  { name: "KSB", category: "Pumps", catalogUrls: ["https://www.directindustry.com/prod/ksb-7053.html"], logoUrl: "ksb" },
  { name: "Nikkiso", category: "Pumps", catalogUrls: ["https://www.nikkiso.com/products/pump/"] },
  { name: "Grundfos", category: "Pumps", catalogUrls: ["https://product-selection.grundfos.com/us/products"], logoUrl: "grundfos" },
  { name: "Weir", category: "Pumps", catalogUrls: ["https://www.global.weir/products/warman-pumps/"], logoUrl: "weir" },
  { name: "Warman", category: "Pumps", catalogUrls: ["https://www.global.weir/products/warman-pumps/"] },
  { name: "SPX Flow Pumps", category: "Pumps", catalogUrls: ["https://www.spxflow.com/en/Products/Pumps"] },
  { name: "Gorman-Rupp", category: "Pumps", catalogUrls: ["https://www.gormanrupp.com/products"] },
  { name: "Ebara", category: "Pumps", catalogUrls: ["https://www.ebara.com/en/products/pump"], logoUrl: "ebara" },
  { name: "Pentair", category: "Pumps", catalogUrls: ["https://www.pentair.com/en/products/pumps.html"], logoUrl: "pentair" },
  { name: "ITT Pumps", category: "Pumps", catalogUrls: ["https://www.flowserve.com/products/products-catalog/pumps/"] },
  { name: "Peerless Pumps", category: "Pumps", catalogUrls: ["https://product-selection.grundfos.com/us/products"] },
  { name: "Allweiler Pumps", category: "Pumps", catalogUrls: ["https://www.ksb.com/en-us/products/pumps"] },
  { name: "Cornell Pump", category: "Pumps", catalogUrls: ["https://www.cornellpump.com/products"] },
  { name: "Blackmer", category: "Pumps", catalogUrls: ["https://www.psgdover.com/brands/blackmer"] },
  { name: "Pulsafeeder", category: "Pumps", catalogUrls: ["https://www.pulsafeeder.com/products"] },
  { name: "Seepex", category: "Pumps", catalogUrls: ["https://www.seepex.com/products"] },
  { name: "Wilden", category: "Pumps", catalogUrls: ["https://www.psgdover.com/brands/wilden"] },
  { name: "Hydra-Cell", category: "Pumps", catalogUrls: ["https://www.hydra-cell.com/products"] },
  { name: "Netzsch", category: "Pumps", catalogUrls: ["https://pumps.netzsch.com/products"] },
  { name: "Ruhrpumpen", category: "Pumps", catalogUrls: ["https://www.ruhrpumpen.com/en/products"], logoUrl: "ruhrpumpen" },
  { name: "Tsurumi", category: "Pumps", catalogUrls: ["https://www.tsurumipump.com/products/"], logoUrl: "tsurumi" },
  { name: "Wilo", category: "Pumps", catalogUrls: ["https://wilo.com/us/en/Products-and-expertise/Products/"], logoUrl: "wilo" },
];

// Function to find catalog URL for a manufacturer
export const findCatalogUrl = (manufacturerName: string): string | null => {
  const normalizedName = manufacturerName.toLowerCase().trim();
  
  const manufacturer = equipmentCatalog.find(m => 
    normalizedName.includes(m.name.toLowerCase()) || 
    m.name.toLowerCase().includes(normalizedName)
  );
  
  return manufacturer?.catalogUrls[0] || null;
};

// Function to find manufacturer logo key
export const findManufacturerLogoKey = (manufacturerName: string): string | null => {
  const normalizedName = manufacturerName.toLowerCase().trim();
  
  const manufacturer = equipmentCatalog.find(m => 
    normalizedName.includes(m.name.toLowerCase()) || 
    m.name.toLowerCase().includes(normalizedName)
  );
  
  return manufacturer?.logoUrl || null;
};

// Function to get website base URL from catalog URL (for logo fetching)
export const getWebsiteFromCatalog = (manufacturerName: string): string | null => {
  const catalogUrl = findCatalogUrl(manufacturerName);
  if (!catalogUrl) return null;
  
  try {
    const url = new URL(catalogUrl);
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return null;
  }
};

// Map manufacturer names to their brand logos (fetched from their websites)
export const manufacturerLogoUrls: Record<string, string> = {
  "Balon Corporation": "https://www.balon.com/images/logo.png",
  "Bray International": "https://www.bray.com/images/default-source/default-album/bray-logo.svg",
  "Kimray": "https://kimray.com/themes/custom/kimray/logo.svg",
  "Flowserve": "https://www.flowserve.com/sites/default/files/flowserve-logo.svg",
  "Cameron": "https://www.slb.com/-/media/slb-assets/cameron-logo.svg",
  "Velan": "https://www.velan.com/assets/images/logo.svg",
  "Emerson": "https://www.emerson.com/content/dam/emerson/corporate/global/logos/emerson-logo-green.svg",
  "Siemens": "https://www.siemens.com/img/siemens-logo.svg",
  "ABB": "https://new.abb.com/images/abb-logo-png.png",
  "Sulzer": "https://www.sulzer.com/-/media/files/public/logo/sulzer_logo.svg",
  "Grundfos": "https://www.grundfos.com/content/dam/grundfos/global/logos/grundfos-logo.svg",
  "KSB": "https://www.ksb.com/ksb-en/assets/ksb-logo.svg",
  "Weir": "https://www.global.weir/assets/images/weir-logo.svg",
  "Pentair": "https://www.pentair.com/content/dam/pentair/common/logos/pentair-logo.svg",
  "Ebara": "https://www.ebara.com/assets/images/logo.svg",
};
