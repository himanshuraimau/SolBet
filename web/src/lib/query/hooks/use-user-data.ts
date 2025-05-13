import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { queryKeys } from "../config"
import type { TimeFrame } from "@/types/common"
import { useWalletData } from "@/store/wallet-store"
import { useWallet } from "@solana/wallet-adapter-react"

// -------------------------------------------------------
// Types
// -------------------------------------------------------

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

// -------------------------------------------------------
// API Functions
// -------------------------------------------------------

/**
 * Fetch user profile data from the API
 * @param walletAddress The wallet address to fetch profile for
 */
const fetchUserProfileFromApi = async (walletAddress: string) => {
  const response = await fetch(`/api/users/profile?address=${walletAddress}`)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to fetch user profile")
  }
  return response.json()
}

/**
 * Fetch user statistics from the API for a given time frame
 * @param walletAddress The wallet address to fetch stats for
 * @param timeFrame Time period for statistics (e.g., "7d", "30d")
 */
const fetchUserStatsFromApi = async (walletAddress: string, timeFrame: TimeFrame) => {
  const response = await fetch(`/api/users/stats?address=${walletAddress}&timeFrame=${timeFrame}`)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to fetch user stats")
  }
  return response.json()
}

// -------------------------------------------------------
// Hooks
// -------------------------------------------------------

/**
 * Hook to fetch user profile
 * Uses the userProfile from wallet store if available, otherwise fetches from API
 */
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

/**
 * Hook to fetch user statistics for a specific time frame
 * @param timeFrame Time period for statistics (default: "7d")
 */
export function useUserStats(timeFrame: TimeFrame = "7d") {
  const { publicKey } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery<UserStatisticsResponse>({
    queryKey: [...queryKeys.user.stats(), timeFrame],
    queryFn: () => fetchUserStatsFromApi(walletAddress || "", timeFrame),
    enabled: !!walletAddress,
    // Keep statistics data fresh
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
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

// Hook for portfolio performance data
export function usePortfolioPerformance(timeFrame: TimeFrame = "7d") {
  const { data, isLoading } = useUserStats(timeFrame);
  
  // Transform betHistory data into portfolio performance data
  const transformedData: PerformanceDataPoint[] = [];
  
  if (data?.betHistory) {
    // Group by date and calculate cumulative values
    const dateMap = new Map<string, { wins: number; losses: number; net: number }>();
    
    data.betHistory.forEach(entry => {
      const date = new Date(entry.timestamp);
      let dateKey: string;
      
      if (timeFrame === "1d") {
        // Group by hour for 1d
        dateKey = `${date.getHours()}:00`;
      } else if (timeFrame === "7d") {
        // Group by day for 7d
        dateKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeFrame === "30d") {
        // Group by week for 30d
        const day = date.getDate();
        const weekNumber = Math.floor((day - 1) / 7) + 1;
        dateKey = `Week ${weekNumber}`;
      } else {
        // Group by month for all
        dateKey = date.toLocaleDateString('en-US', { month: 'short' });
      }
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { wins: 0, losses: 0, net: 0 });
      }
      
      const dateData = dateMap.get(dateKey)!;
      
      if (entry.type === "WIN") {
        dateData.wins += entry.amount;
        dateData.net += entry.amount;
      } else if (entry.type === "LOSS") {
        dateData.losses += entry.amount;
        dateData.net -= entry.amount;
      }
    });
    
    // Convert map to array and sort
    const sortedDates = Array.from(dateMap.entries());
    
    // Sort by date
    if (timeFrame === "1d") {
      sortedDates.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    }
    
    // Create the performance data points
    sortedDates.forEach(([date, values]) => {
      transformedData.push({
        name: date,
        wins: values.wins,
        losses: values.losses,
        net: values.net,
      });
    });
  }
  
  return {
    data: transformedData,
    isLoading,
  };
}
