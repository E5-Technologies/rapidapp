import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  company: string;
  logo: string;
  title: string;
  product: string;
  rating: number;
  image: string;
}

const ProductCard = ({ company, logo, title, product, rating, image }: ProductCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt={company} className="w-5 h-5 object-contain" />
            <h3 className="font-bold text-sm">{company}</h3>
          </div>
        </div>
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      <div className="relative">
        <img src={image} alt={product} className="w-full h-32 object-contain" />
        <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground">
          Order
        </Badge>
      </div>
      
      <div>
        <h4 className="font-medium text-xs text-muted-foreground">{title}</h4>
        <p className="text-sm font-medium">{product}</p>
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < rating ? "text-yellow-500" : "text-muted"}>
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
