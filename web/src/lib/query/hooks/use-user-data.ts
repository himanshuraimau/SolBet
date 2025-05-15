import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchBetStatistics, fetchUserProfile, fetchUserStats } from "@/lib/api";
import { TimeFrame } from "@/types/common";

// Types for the data returned by the hooks
export interface BetStatistics {
  totalBets: number;
  yesBets: number;
  noBets: number;
  winRate: number;
}

export interface BettingHistoryItem {
  timestamp: string;
  type: "WIN" | "LOSS";
  amount: number;
  title?: string;
}

export interface PortfolioDataPoint {
  name: string;
  wins: number;
  losses: number;
  net: number;
}

export interface UserStats {
  winnings: number;
  losses: number;
  netProfit: number;
  winRate: number;
  betsPlaced: number;
  avgBetSize: number;
  betsWon: number;
  betsLost: number;
  activeBets: number;
}

export interface UserProfile {
  walletAddress: string;
  displayName?: string;
  avatar?: string;
  stats: {
    betsCreated: number;
    betsJoined: number;
    winRate: number;
    totalWinnings: number;
  };
  preferences?: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
  };
}

export interface BetHistory {
  timestamp: string;
  type: "bet" | "withdrawal" | "winnings";
  amount: number;
  status: "success" | "pending" | "failed";
  title?: string;
}

/**
 * Hook to fetch bet statistics (yes/no distribution)
 */
export function useBetStatistics() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString();

  return useQuery<BetStatistics>({
    queryKey: queryKeys.user.betStats(),
    queryFn: () => walletAddress 
      ? fetchBetStatistics(walletAddress) 
      : Promise.resolve({ totalBets: 0, yesBets: 0, noBets: 0, winRate: 0 }),
    enabled: !!walletAddress,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch user's betting history
 */
export function useBettingHistory(timeFrame: TimeFrame = "7d") {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString();
  const { data } = useUserStats(timeFrame);

  // Extract betting history from user stats
  return {
    data: data?.betHistory || [],
    isLoading: !data && !!walletAddress,
  };
}

/**
 * Hook to get portfolio performance data
 */
export function usePortfolioPerformance(timeFrame: TimeFrame = "7d") {
  const { data: statsData, isLoading } = useUserStats(timeFrame);
  
  return {
    data: {
      netProfit: statsData?.stats.netProfit || 0,
      winRate: statsData?.stats.winRate || 0,
      betsPlaced: statsData?.stats.betsPlaced || 0,
    },
    isLoading,
  };
}

/**
 * Hook to fetch user statistics
 */
export function useUserStats(timeFrame: TimeFrame = "7d") {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString();

  return useQuery({
    queryKey: [...queryKeys.user.stats(), timeFrame],
    queryFn: () => walletAddress 
      ? fetchUserStats(walletAddress, timeFrame) 
      : Promise.resolve(null),
    enabled: !!walletAddress,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch user profile
 */
export function useUserProfile() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString();

  return useQuery<UserProfile>({
    queryKey: queryKeys.user.profile(),
    queryFn: () => walletAddress 
      ? fetchUserProfile(walletAddress) 
      : Promise.resolve(null),
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
