import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import Link from "next/link"
import { useState, ChangeEvent, KeyboardEvent } from "react"

interface BetFilterProps {
  searchValue: string
  category: string
  onSearch: (search: string) => void
  onCategoryChange: (category: string) => void
}

export function BetFilter({ 
  searchValue, 
  category, 
  onSearch, 
  onCategoryChange 
}: BetFilterProps) {
  const [searchInput, setSearchInput] = useState(searchValue)
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }
  
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchInput)
    }
  }
  
  const handleSearchSubmit = () => {
    onSearch(searchInput)
  }
  
  const toggleCategory = () => {
    // Toggle category filter
    // For now just toggle between empty and crypto, but this could be expanded with a dropdown
    onCategoryChange(category ? "" : "crypto")
  }
  
  return (
    <div className="flex gap-2 w-full md:w-auto">
      <div className="relative w-full md:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search bets..." 
          className="w-full md:w-[260px] pl-9" 
          value={searchInput}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
      </div>
      <Button 
        variant="outline" 
        size="icon"
        onClick={toggleCategory}
      >
        <Filter className="h-4 w-4" />
      </Button>
      <Button 
        className="bg-primary-gradient text-text-plum"
        asChild
      >
        <Link href="/create-bet">Create Bet</Link>
      </Button>
    </div>
  )
}
