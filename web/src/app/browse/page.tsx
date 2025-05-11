"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Filter, Search, TrendingUp, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"


// Type definitions based on API response
interface Bet {
  id: string;
  title: string;
  description: string;
  category: string;
  creator: string;
  creatorName?: string;
  yesPool: number;
  noPool: number;
  totalPool: number;
  minimumBet: number;
  maximumBet: number;
  startTime: string;
  endTime: string;
  status: string;
  participantCount: number;
  daysLeft: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BetsResponse {
  bets: Bet[];
  pagination: PaginationInfo;
}

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { publicKey } = useWallet();

  // Get current query parameters
  const currentTab = searchParams.get("tab") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";

  // State for search input to avoid immediate filtering on each keystroke
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [bets, setBets] = useState<Bet[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: currentPage,
    limit: 12,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to fetch bets based on current filters
  const fetchBets = async (tab: string, page: number, search?: string, category?: string) => {
    setIsLoading(true);
    
    try {
      let url = `/api/bets?tab=${tab}&page=${page}&limit=12`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      // Add wallet address for my-bets tab
      if (tab === "my-bets" && publicKey) {
        url += `&wallet=${publicKey.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch bets");
      }
      
      const data: BetsResponse = await response.json();
      setBets(data.bets);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching bets:", error);
      // Show toast error or handle accordingly
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    // Reset page when changing tabs
    updateQueryParams(value, 1, searchInput, currentCategory);
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateQueryParams(currentTab, newPage, searchInput, currentCategory);
  };
  
  // Handle search
  const handleSearch = () => {
    updateQueryParams(currentTab, 1, searchInput, currentCategory);
  };
  
  // Handle category filter
  const handleCategoryFilter = (category: string) => {
    updateQueryParams(currentTab, 1, searchInput, category);
  };
  
  // Update query parameters and trigger fetch
  const updateQueryParams = (tab: string, page: number, search?: string, category?: string) => {
    const params = new URLSearchParams();
    
    if (tab !== "all") {
      params.set("tab", tab);
    }
    
    if (page > 1) {
      params.set("page", page.toString());
    }
    
    if (search) {
      params.set("search", search);
    }
    
    if (category) {
      params.set("category", category);
    }
    
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ''}`);
  };
  
  // Fetch bets when filters change
  useEffect(() => {
    fetchBets(currentTab, currentPage, currentSearch, currentCategory);
  }, [currentTab, currentPage, currentSearch, currentCategory, publicKey]);
  
  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Bets</h1>
          <p className="text-muted-foreground mt-1">Discover and join bets on any topic</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search bets..." 
              className="w-full md:w-[260px] pl-9" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              // Toggle category filter UI here
              // For simplicity, you can add a dropdown for categories
              handleCategoryFilter(currentCategory ? "" : "crypto");
            }}
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
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
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

        {/* We'll use a single tab content and update data based on the selected tab */}
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
                {currentTab === "my-bets" && !publicKey
                  ? "Connect your wallet to view your bets"
                  : "No bets found matching your criteria"}
              </p>
            </div>
          )}
          
          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                // Show up to 5 pages. If we have more, show the first, last, and pages around the current one
                let pageToShow = i + 1;
                
                if (pagination.totalPages > 5) {
                  if (pagination.page <= 3) {
                    // First 5 pages
                    pageToShow = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    // Last 5 pages
                    pageToShow = pagination.totalPages - 4 + i;
                  } else {
                    // Current page with 2 before and 2 after
                    pageToShow = pagination.page - 2 + i;
                  }
                }
                
                return (
                  <Button
                    key={pageToShow}
                    variant={pagination.page === pageToShow ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageToShow)}
                    className={pagination.page === pageToShow ? "bg-primary-gradient text-text-plum" : ""}
                  >
                    {pageToShow}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}

function BetCard({ bet }: { bet: Bet }) {
  const totalPool = bet.yesPool + bet.noPool;
  const yesPercentage = totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50;
  const noPercentage = totalPool > 0 ? (bet.noPool / totalPool) * 100 : 50;

  return (
    <Card className="overflow-hidden hover-scale transition-premium">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="capitalize bg-muted/50">
            {bet.category}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {bet.daysLeft > 0 ? `${bet.daysLeft} days left` : "Ended"}
          </div>
        </div>
        <CardTitle className="line-clamp-2 mt-2 text-lg">{bet.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Yes: {yesPercentage.toFixed(1)}%</span>
              <span>No: {noPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary-gradient h-2.5 rounded-full"
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-accent-green" />
              <span className="font-mono">{totalPool.toFixed(2)} SOL</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4 text-accent-blue" />
              <span>{bet.participantCount} participants</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          asChild 
          className="w-full bg-primary-gradient text-text-plum"
          disabled={bet.status !== "active" || new Date(bet.endTime) < new Date()}
        >
          <Link href={`/bet/${bet.id}`}>
            {bet.status === "active" && new Date(bet.endTime) >= new Date() 
              ? "Place Bet" 
              : "View Bet"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
