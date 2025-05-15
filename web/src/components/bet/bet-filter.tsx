import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BetFilterProps {
  searchValue: string;
  category: string;
  onSearch: (search: string) => void;
  onCategoryChange: (category: string) => void;
}

export function BetFilter({
  searchValue = "",
  category = "",
  onSearch,
  onCategoryChange,
}: BetFilterProps) {
  const [searchInput, setSearchInput] = useState(searchValue);
  
  // Sync the input with the searchValue prop
  useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };
  
  // Handle clearing the search
  const handleClearSearch = () => {
    setSearchInput("");
    onSearch("");
  };
  
  // Categories for the filter
  const categories = [
    { value: "all", label: "All Categories" }, // Changed from empty string to "all"
    { value: "crypto", label: "Cryptocurrency" },
    { value: "sports", label: "Sports" },
    { value: "politics", label: "Politics" },
    { value: "entertainment", label: "Entertainment" },
    { value: "tech", label: "Technology" },
    { value: "other", label: "Other" },
  ];
  
  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search bets..."
            className="pl-9 pr-8 w-full md:w-[200px] xl:w-[280px]"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="default" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>
      
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
