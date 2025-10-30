import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";

interface Suggestion {
  name: string;
  operator?: string;
  field?: string;
  type?: "tank" | "fed" | "other";
}

interface SearchBarProps {
  placeholder?: string;
  onFilterClick?: () => void;
  onChange?: (value: string) => void;
  suggestions?: Suggestion[];
  onSuggestionSelect?: (suggestion: Suggestion) => void;
  value?: string;
}

const SearchBar = ({ 
  placeholder = "What are you craving?", 
  onFilterClick, 
  onChange, 
  suggestions = [],
  onSuggestionSelect,
  value = ""
}: SearchBarProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
    setShowSuggestions(e.target.value.trim().length > 0);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3" ref={wrapperRef}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
        <Input
          placeholder={placeholder}
          className="pl-10 rounded-full bg-input border-0 h-11"
          onChange={handleInputChange}
          value={value}
          onFocus={() => value.trim().length > 0 && setShowSuggestions(true)}
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg shadow-lg border border-border max-h-72 overflow-y-auto z-50">
            {suggestions.slice(0, 10).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
              >
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{suggestion.name}</p>
                  {(suggestion.operator || suggestion.field) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {suggestion.operator && `${suggestion.operator}`}
                      {suggestion.operator && suggestion.field && ' • '}
                      {suggestion.field}
                    </p>
                  )}
                </div>
                {suggestion.type && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex-shrink-0">
                    {suggestion.type}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
