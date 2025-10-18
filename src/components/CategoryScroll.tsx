import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Settings, Gauge, GitBranch, Activity, Zap, Container } from "lucide-react";

const categories = [
  { name: "Valves", icon: Settings },
  { name: "Pumps", icon: Gauge },
  { name: "Piping", icon: GitBranch },
  { name: "Instrumentation", icon: Activity },
  { name: "Electrical", icon: Zap },
  { name: "Vessels", icon: Container },
];

interface CategoryScrollProps {
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
}

const CategoryScroll = ({ selectedCategory = "Valves", onCategorySelect }: CategoryScrollProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap px-4">
      <div className="flex gap-6 py-2">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => onCategorySelect?.(category.name)}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              selectedCategory === category.name ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              <category.icon className="w-6 h-6" />
            </div>
            <span className={`text-xs font-medium ${selectedCategory === category.name ? "text-primary" : ""}`}>
              {category.name}
            </span>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
};

export default CategoryScroll;
