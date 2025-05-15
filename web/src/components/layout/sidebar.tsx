"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { BetCard } from "@/components/bet/bet-card"
import { BetPagination } from "@/components/bet/bet-pagination"
import { BetFilter } from "@/components/bet/bet-filter"
import { useBets } from "@/hooks/bet/use-bets"
import { BetTab } from "@/types/bet"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export default function BrowsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State to handle parameters to prevent hydration issues
  const [params, setParams] = useState({
    tab: "all",
    page: 1,
    search: "",
    category: ""
  });

  // Sync params with URL on client-side only
  useEffect(() => {
    const tab = searchParams.get("tab") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    
    setParams({ tab: tab as BetTab, page, search, category });
  }, [searchParams]);

  // Fetch bets using the custom hook - now using state values
  const { data, isLoading } = useBets({
    tab: params.tab as BetTab,
    page: params.page,
    search: params.search,
    category: params.category
  });
  
  // Extract bets and pagination from data
  const bets = data?.data?.bets || [];
  const pagination = data?.data?.pagination || { page: 1, pageSize: 12, totalItems: 0, totalPages: 1 };

  // Handle tab change
  const handleTabChange = (value: string) => {
    // Reset page when changing tabs
    updateQueryParams(value, 1, params.search, params.category)
  }
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateQueryParams(params.tab, newPage, params.search, params.category)
  }
  
  // Handle search
  const handleSearch = (search: string) => {
    updateQueryParams(params.tab, 1, search, params.category)
  }
  
  // Handle category filter
  const handleCategoryFilter = (category: string) => {
    updateQueryParams(params.tab, 1, params.search, category)
  }
  
  // Update query parameters and trigger fetch
  const updateQueryParams = (tab: string, page: number, search?: string, category?: string) => {
    const params = new URLSearchParams()
    
    if (tab && tab !== "all") {
      params.set("tab", tab)
    }
    
    if (page && page > 1) {
      params.set("page", page.toString())
    }
    
    if (search && search.trim()) {
      params.set("search", search)
    }
    
    if (category && category.trim()) {
      params.set("category", category)
    }
    
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ''}`)
  }
  
  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Bets</h1>
          <p className="text-muted-foreground mt-1">Discover and join bets on any topic</p>
        </div>
        
        <BetFilter 
          searchValue={params.search}
          category={params.category}
          onSearch={handleSearch}
          onCategoryChange={handleCategoryFilter}
        />
      </div>

      <Tabs value={params.tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-muted/50 mb-8">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
          >
            All Bets
          </TabsTrigger>
          <TabsTrigger
            value="trending"
            className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
          >
            Trending
          </TabsTrigger>
          <TabsTrigger
            value="newest"
            className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
          >
            Newest
          </TabsTrigger>
          <TabsTrigger
            value="ending"
            className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
          >
            Ending Soon
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : bets.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium">No bets found</h3>
            <p className="text-muted-foreground mt-1">Try changing your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bets.map((bet) => (
              <BetCard key={bet.id} bet={bet} />
            ))}
          </div>
        )}

        {!isLoading && bets.length > 0 && (
          <BetPagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </Tabs>
    </div>
  )
}