import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  onFilterClick?: () => void;
  onChange?: (value: string) => void;
}

const SearchBar = ({ placeholder = "What are you craving?", onFilterClick, onChange }: SearchBarProps) => {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-10 rounded-full bg-input border-0 h-11"
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchBar;
