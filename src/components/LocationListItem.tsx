import { ChevronRight, Circle, Cylinder } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LocationListItemProps {
  name: string;
  status?: "routing" | "lost" | "active";
  type: "tank" | "fed" | "other";
}

const LocationListItem = ({ name, status, type }: LocationListItemProps) => {
  const getIcon = () => {
    if (type === "tank") return <Cylinder className="w-4 h-4 text-accent" />;
    if (type === "other") return <Circle className="w-4 h-4 text-primary" />;
    return <Circle className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="flex items-center justify-between py-4 px-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3 flex-1">
        {getIcon()}
        <span className="font-medium text-sm">{name}</span>
      </div>
      
      {status === "routing" && (
        <Badge className="bg-accent text-accent-foreground mr-2">
          Routing
        </Badge>
      )}
      
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </div>
  );
};

export default LocationListItem;
