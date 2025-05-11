import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { queryKeys } from "../config"
import type { TimeFrame } from "@/types/common"
import { useWalletData } from "@/store/wallet-store"
import { useWallet } from "@solana/wallet-adapter-react"

interface UserStats {
  winnings: number
  losses: number
  netProfit: number
  winRate: number
  betsPlaced: number
  avgBetSize: number
  betsWon: number
  betsLost: number
  activeBets: number
}

interface BetHistory {
  timestamp: string
  type: string
  amount: number
  title: string
}

interface UserStatisticsResponse {
  stats: UserStats
  betHistory: BetHistory[]
  timeFrame: TimeFrame
}

interface BetStatistics {
  yesBets: number
  noBets: number
  totalBets: number
}

interface PerformanceDataPoint {
  name: string
  wins: number
  losses: number
  net: number
}

// API functions
const fetchUserProfileFromApi = async (walletAddress: string) => {
  const response = await fetch(`/api/users/profile?address=${walletAddress}`)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to fetch user profile")
  }
  return response.json()
}

const fetchUserStatsFromApi = async (walletAddress: string, timeFrame: TimeFrame) => {
  const response = await fetch(`/api/users/stats?address=${walletAddress}&timeFrame=${timeFrame}`)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to fetch user stats")
  }
  return response.json()
}

// Hook to fetch user profile - uses the userProfile from our wallet store if available
export function useUserProfile() {
  const { publicKey, userProfile } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery({
    queryKey: queryKeys.user.profile(),
    // If we already have the userProfile in the store, return it immediately
    // Otherwise fetch it from the API
    queryFn: () => {
      if (userProfile) return Promise.resolve(userProfile);
      return fetchUserProfileFromApi(walletAddress || "");
    },
    enabled: !!walletAddress,
  })
}

// Hook to fetch user stats for a specific time frame
export function useUserStats(timeFrame: TimeFrame) {
  const { publicKey } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery({
    queryKey: [...queryKeys.user.stats(), timeFrame],
    queryFn: () => fetchUserStatsFromApi(walletAddress || "", timeFrame),
    enabled: !!walletAddress,
  })
}

// Hook to get betting history data
export function useBettingHistory(timeFrame: TimeFrame) {
  const { data, isLoading, error, refetch } = useUserStats(timeFrame);
  
  return {
    data: data?.betHistory || [],
    isLoading,
    error,
    refetch
  };
}

// Hook for bet history chart
export function useBetHistory(timeFrame: TimeFrame) {
  const { data, isLoading, error } = useUserStats(timeFrame);
  
  // Format data for the bet history chart
  const chartData = useMemo(() => {
    if (!data?.betHistory) return { history: [] };
    
    // Group transactions by appropriate time unit (hour, day, week, month)
    const grouped = new Map();
    
    data.betHistory.forEach((tx: any) => {
      const date = new Date(tx.timestamp);
      // Create a key based on the timeframe
      let key;
      
      if (timeFrame === '1d') {
        // Group by hour for 1d
        key = date.getHours().toString();
      } else if (timeFrame === '7d') {
        // Group by day for 7d
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeFrame === '30d') {
        // Group by week for 30d
        const weekNumber = Math.floor((date.getDate() - 1) / 7);
        key = `Week ${weekNumber + 1}`;
      } else {
        // Group by month for all time
        key = date.toLocaleDateString('en-US', { month: 'short' });
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, { 
          timestamp: date.toISOString(),
          betsCreated: 0,
          betsParticipated: 0,
          amount: 0
        });
      }
      
      const entry = grouped.get(key);
      
      if (tx.type === 'created_bet') {
        entry.betsCreated += 1;
      } else if (tx.type === 'bet') {
        entry.betsParticipated += 1;
        entry.amount += tx.amount;
      }
    });
    
    return {
      history: Array.from(grouped.values())
    };
  }, [data, timeFrame]);
  
  return {
    data: chartData,
    isLoading,
    error
  };
}

// Hook for bet statistics (used by win probability chart)
export function useBetStatistics() {
  const { publicKey } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery({
    queryKey: [...queryKeys.user.betStats()],
    queryFn: async () => {
      const response = await fetch(`/api/bets/statistics?address=${walletAddress}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch bet statistics");
      }
      return response.json();
    },
    enabled: !!walletAddress,
  });
}

// Fetch user statistics based on time frame
export function useUserStatistics(timeFrame: TimeFrame = "7d") {
  const { publicKey } = useWallet()
  const address = publicKey?.toBase58()

  return useQuery<UserStatisticsResponse>({
    queryKey: ["userStats", address, timeFrame],
    queryFn: async () => {
      if (!address) throw new Error("Wallet not connected")
      
      const response = await fetch(`/api/users/stats?address=${address}&timeFrame=${timeFrame}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user statistics")
      }
      return response.json()
    },
    enabled: !!address,
    // Keep data fresh with 5-minute stale time
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch bet history - renamed from useBetHistory to avoid duplicate declaration
export function useBetHistoryData(timeFrame: TimeFrame = "7d") {
  const { data, isLoading, error } = useUserStatistics(timeFrame)
  
  return {
    data: {
      history: data?.betHistory || [],
      timeFrame,
    },
    isLoading,
    error,
  }
}

// Fetch bet statistics - renamed to avoid duplicate declaration
export function useBetStatsData() {
  const { publicKey } = useWallet()
  const address = publicKey?.toBase58()

  return useQuery<BetStatistics>({
    queryKey: ["betStats", address],
    queryFn: async () => {
      if (!address) throw new Error("Wallet not connected")
      
      const response = await fetch(`/api/bets/statistics?address=${address}`)
      if (!response.ok) {
        throw new Error("Failed to fetch bet statistics")
      }
      return response.json()
    },
    enabled: !!address,
    // Keep data fresh with 5-minute stale time
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch portfolio performance data
export function usePortfolioPerformance(timeFrame: TimeFrame = "7d") {
  const { data, isLoading } = useUserStatistics(timeFrame)
  
  // Transform betHistory data into portfolio performance data
  const transformedData: PerformanceDataPoint[] = []
  
  if (data?.betHistory) {
    // Group by date and calculate cumulative values
    const dateMap = new Map<string, { wins: number; losses: number; net: number }>()
    
    data.betHistory.forEach(entry => {
      const date = new Date(entry.timestamp)
      let dateKey: string
      
      if (timeFrame === "1d") {
        // Group by hour for 1d
        dateKey = `${date.getHours()}:00`
      } else if (timeFrame === "7d") {
        // Group by day for 7d
        dateKey = date.toLocaleDateString('en-US', { weekday: 'short' })
      } else if (timeFrame === "30d") {
        // Group by week for 30d
        const day = date.getDate()
        const weekNumber = Math.floor((day - 1) / 7) + 1
        dateKey = `Week ${weekNumber}`
      } else {
        // Group by month for all
        dateKey = date.toLocaleDateString('en-US', { month: 'short' })
      }
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { wins: 0, losses: 0, net: 0 })
      }
      
      const dateData = dateMap.get(dateKey)!
      
      if (entry.type === "WIN") {
        dateData.wins += entry.amount
        dateData.net += entry.amount
      } else if (entry.type === "LOSS") {
        dateData.losses += entry.amount
        dateData.net -= entry.amount
      }
    })
    
    // Convert map to array and sort
    const sortedDates = Array.from(dateMap.entries())
    
    // Sort by date
    if (timeFrame === "1d") {
      sortedDates.sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    }
    
    // Create the performance data points
    sortedDates.forEach(([date, values]) => {
      transformedData.push({
        name: date,
        wins: values.wins,
        losses: values.losses,
        net: values.net,
      })
    })
  }
  
  return {
    data: transformedData,
    isLoading,
  }
}
