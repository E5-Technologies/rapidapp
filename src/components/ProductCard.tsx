import { ChevronRight, Phone, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
const logoMap: Record<string, string> = {
  "asco": ascoLogo,
  "baker-hughes": bakerHughesLogo,
  "cameron": cameronLogo,
  "circor": circorLogo,
  "crane": craneLogo,
  "ebara": ebaraLogo,
  "emerson": emersonLogo,
  "flowserve": flowserveLogo,
  "grundfos": grundfosLogo,
  "imi": imiLogo,
  "itt-goulds": ittGouldsLogo,
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
  "wilo": wiloLogo,
  "xylem": xylemLogo,
};

// Function to resolve logo path
const resolveLogo = (logoPath: string | null | undefined, companyName: string): string | null => {
  if (!logoPath) return null;
  
  // Extract the logo name from the path (e.g., "/src/assets/logos/swagelok.png" -> "swagelok")
  const match = logoPath.match(/logos\/([^.]+)\./);
  if (match && match[1]) {
    const logoKey = match[1].toLowerCase();
    if (logoMap[logoKey]) {
      return logoMap[logoKey];
    }
  }
  
  // Try matching by company name
  const companyKey = companyName.toLowerCase().replace(/\s+/g, '-');
  if (logoMap[companyKey]) {
    return logoMap[companyKey];
  }
  
  // If it's already a valid URL, return it
  if (logoPath.startsWith('http')) {
    return logoPath;
  }
  
  return null;
};

// Category-specific product images from real industrial sources
const categoryImages: Record<string, string> = {
  "Valves": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop",
  "Pumps": "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400&h=300&fit=crop",
  "Instrumentation": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  "Electrical": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "Piping": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  "Vessels": "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop",
  "Safety": "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&h=300&fit=crop",
  "Tanks": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop",
  "Automation": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
};

// Get appropriate image for a product
const getProductImage = (image: string | null, category: string, title: string): string | null => {
  // If valid custom image URL exists (not the placeholder), use it
  if (image && !image.includes('unsplash.com/photo-1581092918056') && image.startsWith('http')) {
    return image;
  }
  
  // Use category-specific image
  if (category && categoryImages[category]) {
    return categoryImages[category];
  }
  
  // Try to match category from title
  for (const [cat, url] of Object.entries(categoryImages)) {
    if (title.toLowerCase().includes(cat.toLowerCase().slice(0, -1))) {
      return url;
    }
  }
  
  return null;
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
  onContactClick?: () => void;
}

const ProductCard = ({ company, logo, title, product, rating, image, dataSheet, manufacturerId, category, onContactClick }: ProductCardProps) => {
  const resolvedLogo = resolveLogo(logo, company);
  const productImage = getProductImage(image, category || '', title);
  
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
        <h4 className="font-medium text-xs text-muted-foreground mb-2">{title}</h4>
        <div className="relative mb-3">
          {productImage ? (
            <img 
              src={productImage} 
              alt={product} 
              className="w-full h-40 object-cover rounded-lg"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-40 bg-muted rounded-lg flex flex-col items-center justify-center gap-2';
                  fallback.innerHTML = '<span class="text-xs text-muted-foreground">Product Image</span>';
                  parent.insertBefore(fallback, target);
                }
              }}
            />
          ) : (
            <div className="w-full h-40 bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
              <Package className="w-12 h-12 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Product Image</span>
            </div>
          )}
          <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground">
            Order
          </Badge>
        </div>
        <p className="text-sm font-medium">{product}</p>
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < rating ? "text-yellow-500" : "text-muted"}>
              ★
            </span>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
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
