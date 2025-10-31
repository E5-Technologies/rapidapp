import { ChevronRight, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  company: string;
  logo: string;
  title: string;
  product: string;
  rating: number;
  image: string;
  dataSheet?: string;
  manufacturerId?: string;
  onContactClick?: () => void;
}

const ProductCard = ({ company, logo, title, product, rating, image, dataSheet, manufacturerId, onContactClick }: ProductCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt={company} className="w-20 h-20 object-contain" />
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
          <img src={image} alt={product} className="w-full h-40 object-cover rounded-lg" />
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
