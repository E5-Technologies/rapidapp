import { useState, useEffect } from "react";
import { ChevronRight, Phone, Package, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findCatalogUrl, findManufacturerLogoKey, manufacturerLogoUrls } from "@/data/equipmentCatalog";
import { supabase } from "@/integrations/supabase/client";
// Import all logo images
import ascoLogo from "@/assets/logos/asco.png";
import bakerHughesLogo from "@/assets/logos/baker-hughes.png";
import cameronLogo from "@/assets/logos/cameron.png";
import circorLogo from "@/assets/logos/circor.png";
import craneLogo from "@/assets/logos/crane.png";
import ebaraLogo from "@/assets/logos/ebara.png";
import emersonLogo from "@/assets/logos/emerson.png";
import flowserveLogo from "@/assets/logos/flowserve.png";
import grundfosLogo from "@/assets/logos/grundfos.png";
import imiLogo from "@/assets/logos/imi.png";
import ittGouldsLogo from "@/assets/logos/itt-goulds.png";
import ksbLogo from "@/assets/logos/ksb.png";
import metsoLogo from "@/assets/logos/metso.png";
import nelesLogo from "@/assets/logos/neles.png";
import parkerLogo from "@/assets/logos/parker.png";
import pentairLogo from "@/assets/logos/pentair.png";
import ruhrpumpenLogo from "@/assets/logos/ruhrpumpen.png";
import sulzerLogo from "@/assets/logos/sulzer.png";
import swagelokLogo from "@/assets/logos/swagelok.png";
import tsurumiLogo from "@/assets/logos/tsurumi.png";
import tycoLogo from "@/assets/logos/tyco.png";
import velanLogo from "@/assets/logos/velan.png";
import weirLogo from "@/assets/logos/weir.png";
import wiloLogo from "@/assets/logos/wilo.png";
import xylemLogo from "@/assets/logos/xylem.png";

// Logo mapping for resolving paths
const logoMap: Record<string, string | null> = {
  "asco": ascoLogo,
  "baker-hughes": bakerHughesLogo,
  "bakerhughes": bakerHughesLogo,
  "cameron": cameronLogo,
  "circor": circorLogo,
  "crane": craneLogo,
  "ebara": ebaraLogo,
  "emerson": emersonLogo,
  "fisher": emersonLogo,
  "rosemount": emersonLogo,
  "flowserve": flowserveLogo,
  "grundfos": grundfosLogo,
  "imi": imiLogo,
  "itt-goulds": ittGouldsLogo,
  "goulds": ittGouldsLogo,
  "ksb": ksbLogo,
  "metso": metsoLogo,
  "neles": nelesLogo,
  "parker": parkerLogo,
  "pentair": pentairLogo,
  "ruhrpumpen": ruhrpumpenLogo,
  "sulzer": sulzerLogo,
  "swagelok": swagelokLogo,
  "tsurumi": tsurumiLogo,
  "tyco": tycoLogo,
  "velan": velanLogo,
  "weir": weirLogo,
  "warman": weirLogo,
  "wilo": wiloLogo,
  "xylem": xylemLogo,
  // Additional valve manufacturers
  "balon": null,
  "bray": null,
  "kimray": null,
  "franklin": null,
  "bonney": null,
  "victaulic": null,
  "warren": null,
  "mercer": null,
  "taylor": null,
  "scv": null,
  "wkm": null,
  "pbv": null,
  "kf": null,
  "wheatley": null,
  "crosby": null,
  "eanardo": null,
  "kitz": null,
  "danfoss": null,
  "avk": null,
  "spx": null,
  "neway": null,
  "gvc": null,
};

// Function to resolve logo path
const resolveLogo = (logoPath: string | null | undefined, companyName: string): string | null => {
  // First, try to match by company name directly in logoMap
  const normalizedName = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Check for direct matches
  if (logoMap[normalizedName] !== undefined && logoMap[normalizedName] !== null) {
    return logoMap[normalizedName];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(logoMap)) {
    if (value && (normalizedName.includes(key) || key.includes(normalizedName.split('-')[0]))) {
      return value;
    }
  }
  
  // Try using the equipment catalog logo key
  const catalogLogoKey = findManufacturerLogoKey(companyName);
  if (catalogLogoKey && logoMap[catalogLogoKey]) {
    return logoMap[catalogLogoKey];
  }
  
  // Check external logo URLs from catalog
  if (manufacturerLogoUrls[companyName]) {
    return manufacturerLogoUrls[companyName];
  }
  
  if (logoPath) {
    // Extract the logo name from the path (e.g., "/src/assets/logos/swagelok.png" -> "swagelok")
    const match = logoPath.match(/logos\/([^.]+)\./);
    if (match && match[1]) {
      const logoKey = match[1].toLowerCase();
      if (logoMap[logoKey]) {
        return logoMap[logoKey];
      }
    }
    
    // If it's already a valid URL, return it
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
  }
  
  return null;
};

// Category-specific fallback product images - industrial equipment stock photos
const categoryImages: Record<string, string> = {
  // Valve types
  "Valves": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  "Gate Valve": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  "Ball Valve": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  "Check Valve": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  "Globe Valve": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  "Butterfly Valve": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  "Control Valve": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  "Relief Valve": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  "Safety Valve": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  
  // Pump types
  "Pumps": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  "Centrifugal Pump": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  "Submersible Pump": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  "Diaphragm Pump": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  "Gear Pump": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  "Piston Pump": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  "Progressive Cavity Pump": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  
  // Instrumentation
  "Instrumentation": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  "Pressure Gauge": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  "Flow Meter": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  "Level Transmitter": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  "Temperature Sensor": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  
  // Electrical & Automation
  "Electrical": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "Automation": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "Motor": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "VFD": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "PLC": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  
  // Piping & Fittings
  "Piping": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop",
  "Fittings": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop",
  "Flanges": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop",
  "Pipe": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop",
  
  // Vessels & Tanks
  "Vessels": "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop",
  "Tanks": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop",
  "Pressure Vessel": "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop",
  "Heat Exchanger": "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop",
  
  // Safety Equipment
  "Safety": "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&h=300&fit=crop",
  "Safety Equipment": "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&h=300&fit=crop",
  
  // Compressors & Filters
  "Compressor": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  "Filter": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop",
  "Strainer": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop",
  
  // Generic industrial
  "Industrial": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  "Equipment": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
};

// Cache for scraped images
const scrapedImageCache = new Map<string, string | null>();

// Default fallback for unmatched categories
const DEFAULT_EQUIPMENT_IMAGE = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop";

// Junk text patterns to remove from product names and titles
const junkPatterns = [
  /\s*-\s*pdf\s*catalogs?$/i,
  /\s*-\s*directindustry.*$/i,
  /\s*\|\s*directindustry.*$/i,
  /\s*pdf\s*catalogs?$/i,
  /all\s+.*\s+catalogs?\s+and\s+technical\s+brochures?/i,
  /\s*-\s*technical\s+brochures?$/i,
  /catalogs?\s+and\s+technical\s+brochures?/i,
  /\s*:\s*hydraulics$/i,
  /process\s+flow\s+technologies\s+gmbh:\s*/i,
  /automation\s+solutions\s*-?\s*/i,
  /\s+by\s+.*\s*-\s*.*$/i,
  /\s*-\s*[A-Z]+\s*$/,  // Remove trailing brand codes like "- FLOWSERVE"
  /®\s*/g,
  /™\s*/g,
];

// Clean up product name by removing scraped junk text
const cleanProductName = (name: string, manufacturer?: string): string => {
  let cleaned = name;
  
  // Apply junk patterns
  for (const pattern of junkPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Remove manufacturer name from start if it's redundant
  if (manufacturer) {
    const mfgPattern = new RegExp(`^${manufacturer}\\s*[-|:]?\\s*`, 'i');
    cleaned = cleaned.replace(mfgPattern, '');
  }
  
  // Clean up extra whitespace and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // If nothing meaningful remains, return a simplified version
  if (cleaned.length < 3) {
    return name.split(/[-|]/)[0].trim();
  }
  
  return cleaned;
};

// Extract product type from name (e.g., "Ball valve" from "Ball valve - RSBV - FLOWSERVE")
const extractProductType = (name: string): string | null => {
  const types = [
    'gate valve', 'ball valve', 'check valve', 'globe valve', 'butterfly valve',
    'control valve', 'relief valve', 'safety valve', 'solenoid valve', 
    'instrumentation valve', 'needle valve', 'plug valve', 'diaphragm valve',
    'pinch valve', 'knife gate valve', 'pressure relief valve',
    'centrifugal pump', 'submersible pump', 'diaphragm pump', 'gear pump',
    'piston pump', 'progressive cavity pump', 'magnetic drive pump',
    'pressure gauge', 'flow meter', 'level transmitter', 'temperature sensor',
    'pressure transmitter', 'control system', 'actuator', 'positioner',
    'valve actuator', 'pneumatic actuator', 'electric actuator',
    'heat exchanger', 'pressure vessel', 'storage tank', 'separator',
    'compressor', 'filter', 'strainer', 'regulator',
  ];
  
  const lower = name.toLowerCase();
  for (const type of types) {
    if (lower.includes(type)) {
      return type.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return null;
};

// Technical specifications by category and product type
const technicalSpecs: Record<string, Record<string, string>> = {
  'Valves': {
    'gate valve': 'Rising stem design, API 600/603 compliant, suitable for on/off isolation in high-pressure pipelines',
    'ball valve': 'Full bore floating ball design, fire-safe certified, bi-directional shutoff with low torque operation',
    'check valve': 'Swing or piston type, prevents backflow, ASME B16.34 rated for process applications',
    'globe valve': 'Linear flow control, excellent throttling capability, ANSI Class 150-2500 ratings available',
    'butterfly valve': 'Wafer or lug type mounting, quarter-turn operation, suitable for large diameter applications',
    'control valve': 'Pneumatic/electric actuated, precise flow modulation, Cv sizing for process control loops',
    'relief valve': 'Spring-loaded or pilot-operated, ASME Section VIII certified, protects against overpressure',
    'safety valve': 'API 520/526 compliant, set pressure calibrated, critical for pressure protection systems',
    'solenoid valve': '2-way or 3-way configurations, fast response time, suitable for automation circuits',
    'needle valve': 'Fine flow adjustment, stainless steel construction, ideal for instrumentation applications',
    'plug valve': 'Lubricated or non-lubricated, bubble-tight shutoff, chemical resistance for harsh media',
    'diaphragm valve': 'Weir or straight-through design, zero dead leg, ideal for sanitary and corrosive applications',
    'knife gate valve': 'Unidirectional sealing, handles slurries and viscous media, compact wafer design',
    'pressure relief valve': 'Automatic pressure limiting, ASME/API certified, prevents system overpressure damage',
    'default': 'Industrial process valve, designed for reliable isolation and flow control in demanding applications'
  },
  'Pumps': {
    'centrifugal pump': 'Single or multi-stage impeller design, API 610 compliant, high flow rate capability',
    'submersible pump': 'Fully enclosed motor, designed for underwater operation, corrosion-resistant materials',
    'diaphragm pump': 'Air-operated double diaphragm (AODD), self-priming, handles abrasive and viscous fluids',
    'gear pump': 'Positive displacement, consistent flow rate, ideal for high-viscosity fluid transfer',
    'piston pump': 'High-pressure capability, precision metering, suitable for injection applications',
    'progressive cavity pump': 'Helical rotor design, gentle pumping action, handles shear-sensitive fluids',
    'magnetic drive pump': 'Seal-less design, zero leakage, ideal for hazardous and corrosive media',
    'default': 'Industrial process pump, engineered for reliable fluid transfer and system efficiency'
  },
  'Instrumentation': {
    'pressure gauge': 'Bourdon tube or diaphragm element, accuracy class 0.5-2.5, SS wetted parts available',
    'flow meter': 'Electromagnetic, ultrasonic, or Coriolis principle, high accuracy measurement, 4-20mA output',
    'level transmitter': 'Radar, ultrasonic, or guided wave technology, continuous level measurement, HART protocol',
    'temperature sensor': 'RTD or thermocouple element, wide temperature range, explosion-proof options',
    'pressure transmitter': 'Piezoresistive or capacitive sensing, 0.1% accuracy, smart diagnostics capability',
    'default': 'Process instrumentation device, precision measurement for monitoring and control applications'
  },
  'Automation': {
    'control system': 'PLC/DCS integration ready, redundant architecture, real-time process optimization',
    'actuator': 'Pneumatic, electric, or hydraulic operation, fail-safe positioning, NAMUR compliant',
    'positioner': 'Digital or analog control, auto-calibration, precise valve positioning feedback',
    'valve actuator': 'Quarter-turn or linear motion, torque-rated, explosion-proof enclosure options',
    'pneumatic actuator': 'Double-acting or spring-return, corrosion-resistant body, high cycle life',
    'electric actuator': 'Multi-turn or quarter-turn, intelligent control, local/remote operation modes',
    'default': 'Industrial automation component, designed for precise control and system integration'
  },
  'Electrical': {
    'default': 'Industrial electrical equipment, rated for hazardous area classification, IP65+ protection'
  },
  'Piping': {
    'default': 'Process piping component, ASME B31.3 compliant, suitable for high-pressure service'
  },
  'Vessels': {
    'heat exchanger': 'Shell and tube or plate design, TEMA standards, optimized heat transfer efficiency',
    'pressure vessel': 'ASME Section VIII certified, designed for specified MAWP, corrosion allowance included',
    'separator': 'Two-phase or three-phase separation, internals for enhanced separation efficiency',
    'default': 'Industrial pressure vessel, engineered for safe containment of process fluids'
  },
  'Tanks': {
    'storage tank': 'API 650/620 construction, atmospheric or low-pressure service, corrosion protection',
    'default': 'Industrial storage tank, designed for safe bulk storage of process materials'
  },
  'Safety': {
    'default': 'Industrial safety equipment, certified for personnel and process protection'
  },
  'Compressors': {
    'compressor': 'Reciprocating, screw, or centrifugal type, API 617/618 compliant, high reliability design',
    'default': 'Industrial compressor, engineered for continuous operation and process gas compression'
  }
};

// Generate a proper technical description based on product info
const generateDescription = (productName: string, category: string, manufacturer: string): string => {
  const productType = extractProductType(productName);
  const cleanedName = cleanProductName(productName, manufacturer);
  
  // Extract model number if present
  const modelMatch = cleanedName.match(/\b([A-Z]{2,}[\d]*[A-Z]*\d*|[A-Z]+\s*[A-Z0-9]+)\b/);
  const model = modelMatch ? modelMatch[1] : null;
  
  // Get category specs
  const categorySpecs = technicalSpecs[category] || technicalSpecs['Valves'];
  
  // Find matching technical spec
  let techSpec = categorySpecs['default'] || 'Industrial equipment for process applications';
  
  if (productType) {
    const typeKey = productType.toLowerCase();
    if (categorySpecs[typeKey]) {
      techSpec = categorySpecs[typeKey];
    }
  }
  
  // Build description with model if available
  if (productType && model) {
    return `${productType} (${model}) - ${techSpec}`;
  } else if (productType) {
    return `${productType} - ${techSpec}`;
  } else if (model) {
    return `Model ${model} - ${techSpec}`;
  }
  
  return techSpec;
};

// Get appropriate image for a product (without scraping - synchronous check)
const getProductImageSync = (image: string | null, category: string, title: string): string => {
  // Check if image is a valid product image (not a banner/logo/placeholder)
  const isValidProductImage = (url: string): boolean => {
    if (!url || !url.startsWith('http')) return false;
    const lower = url.toLowerCase();
    // Reject common non-product image patterns
    if (lower.includes('logo') || 
        lower.includes('banner') || 
        lower.includes('header') ||
        lower.includes('icon') ||
        lower.includes('favicon') ||
        lower.includes('placeholder') ||
        lower.includes('sprite') ||
        lower.includes('social') ||
        lower.includes('company-') ||
        lower.includes('/brand/') ||
        lower.includes('/logos/')) {
      return false;
    }
    return true;
  };
  
  // If valid custom image URL exists, use it
  if (image && isValidProductImage(image)) {
    return image;
  }
  
  // Use category-specific fallback image
  if (category && categoryImages[category]) {
    return categoryImages[category];
  }
  
  // Try to match category from title (check full words)
  const titleLower = title.toLowerCase();
  for (const [cat, url] of Object.entries(categoryImages)) {
    const catLower = cat.toLowerCase();
    // Match if title contains the category name
    if (titleLower.includes(catLower) || 
        titleLower.includes(catLower.replace(/s$/, '')) || // singular form
        titleLower.includes(catLower.replace(' ', '-'))) { // hyphenated form
      return url;
    }
  }
  
  // Return default industrial equipment image
  return DEFAULT_EQUIPMENT_IMAGE;
};

interface ProductCardProps {
  company: string;
  logo: string;
  title: string;
  product: string;
  rating: number;
  image: string;
  dataSheet?: string | null;
  manufacturerId?: string;
  category?: string;
  modelNumber?: string | null;
  onContactClick?: () => void;
}

const ProductCard = ({ company, logo, title, product, rating, image, dataSheet, manufacturerId, category = '', modelNumber, onContactClick }: ProductCardProps) => {
  const [scrapedImage, setScrapedImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  
  const resolvedLogo = resolveLogo(logo, company);
  const fallbackImage = getProductImageSync(image, category || '', title);
  const catalogUrl = findCatalogUrl(company);
  
  // Try to fetch real product image from catalog
  useEffect(() => {
    const cacheKey = `${company}-${product}`.toLowerCase();
    
    // Check cache first
    if (scrapedImageCache.has(cacheKey)) {
      const cached = scrapedImageCache.get(cacheKey);
      if (cached) {
        setScrapedImage(cached);
      }
      return;
    }
    
    // If we already have a good image from the database, skip scraping
    if (image && !image.includes('unsplash.com') && !image.includes('example.com') && image.startsWith('http')) {
      setScrapedImage(image);
      return;
    }
    
    // Get catalog URL
    if (!catalogUrl) return;
    
    const fetchImage = async () => {
      setIsLoadingImage(true);
      try {
        const { data, error } = await supabase.functions.invoke('scrape-product-image', {
          body: {
            manufacturerName: company,
            productName: product,
            catalogUrl
          }
        });
        
        if (!error && data?.success) {
          const imageUrl = data.imageUrls?.[0] || data.screenshot || null;
          if (imageUrl) {
            scrapedImageCache.set(cacheKey, imageUrl);
            setScrapedImage(imageUrl);
          } else {
            scrapedImageCache.set(cacheKey, null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product image:', err);
      } finally {
        setIsLoadingImage(false);
      }
    };
    
    // Fetch images for cards (increased limit since we're using search API now)
    if (scrapedImageCache.size < 25) {
      fetchImage();
    }
  }, [company, product, image, catalogUrl]);
  
  const productImage = scrapedImage || fallbackImage;
  return (
    <div className="bg-card rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {resolvedLogo ? (
              <img 
                src={resolvedLogo} 
                alt={company} 
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground text-center px-1">{company}</span>
              </div>
            )}
            <h3 className="font-bold text-sm">{company}</h3>
          </div>
        </div>
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      <div>
        {modelNumber && (
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono font-semibold text-primary">{modelNumber}</span>
          </div>
        )}
        <p className="font-medium text-sm text-foreground mb-2">
          {generateDescription(product, category || '', company)}
        </p>
        <div className="relative mb-3">
          {isLoadingImage && (
            <div className="absolute inset-0 bg-muted/50 rounded-lg flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          <img 
              src={productImage} 
              alt={cleanProductName(product, company)} 
              className="w-full h-40 object-cover rounded-lg"
              onError={(e) => {
                const target = e.currentTarget;
                // Always fall back to category image on error
                if (target.src !== fallbackImage) {
                  target.src = fallbackImage;
                }
              }}
            />
          <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground">
            Order
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{cleanProductName(product, company)}</p>
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < rating ? "text-yellow-500" : "text-muted"}>
              ★
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {catalogUrl && (
            <a 
              href={catalogUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Catalog
            </a>
          )}
          {dataSheet && (
            <a 
              href={dataSheet} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Data Sheet
            </a>
          )}
          {manufacturerId && onContactClick && (
            <Button
              onClick={onContactClick}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Phone className="w-4 h-4" />
              Contact
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
