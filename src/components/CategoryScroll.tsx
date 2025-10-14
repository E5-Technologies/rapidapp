import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = [
  { name: "Valves", icon: "🔧" },
  { name: "Pumps", icon: "⚙️" },
  { name: "Piping", icon: "🔩" },
  { name: "Automation", icon: "🏭" },
  { name: "Tanks", icon: "🛢️" },
];

const CategoryScroll = () => {
  return (
    <ScrollArea className="w-full whitespace-nowrap px-4">
      <div className="flex gap-6 py-2">
        {categories.map((category) => (
          <button
            key={category.name}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">
              {category.icon}
            </div>
            <span className="text-xs font-medium">{category.name}</span>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
};

export default CategoryScroll;
