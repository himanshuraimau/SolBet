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
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import WalletBadge from "@/components/wallet/wallet-badge"

// Sidebar navigation links
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "HomeIcon" },
  { name: "My Bets", href: "/dashboard/my-bets", icon: "TicketIcon" },
  { name: "Create Bet", href: "/create-bet", icon: "PlusCircleIcon" },
  { name: "Profile", href: "/profile", icon: "UserIcon" },
  { name: "Settings", href: "/settings", icon: "SettingsIcon" }
]

export default function BrowsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

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

  // Only show navbar on dashboard and related pages
  if (
    !pathname?.startsWith("/dashboard") &&
    !pathname?.startsWith("/create-bet") &&
    !pathname?.startsWith("/profile") &&
    !pathname?.startsWith("/bet/") &&
    !pathname?.startsWith("/analytics") &&
    !pathname?.startsWith("/community") &&
    !pathname?.startsWith("/settings") &&
    !pathname?.startsWith("/notifications") &&
    !pathname?.startsWith("/help")
  ) {
    return null
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
        <ThemeToggle />
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
            value="ending-soon"
            className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
          >
            Ending Soon
          </TabsTrigger>
          <TabsTrigger
            value="my-bets"
            className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
          >
            My Bets
          </TabsTrigger>
        </TabsList>

        <div className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bets.map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">
                {params.tab === "my-bets" && !searchParams.has("wallet")
                  ? "Connect your wallet to view your bets"
                  : "No bets found matching your criteria"}
              </p>
            </div>
          )}
          
          <BetPagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      </Tabs>
    </div>
  )
}