import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";
import { fetchCommunityActivity, fetchLeaderboard } from "@/lib/api/index";

// Types
export type LeaderboardPeriod = "weekly" | "monthly" | "allTime";

export interface LeaderboardUser {
  rank: number;
  address: string;
  displayName: string | null;
  avatar: string | null;
  winRate: number;
  winnings: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  amount: number;
  timestamp: string;
  user: {
    address: string;
    displayName: string | null;
    avatar: string | null;
  };
  betId: string | null;
}

/**
 * Hook to fetch community activity feed
 * Displays recent bets, wins, and other platform activities
 */
export function useCommunityActivity() {
  return useQuery<ActivityItem[]>({
    queryKey: queryKeys.community.activity(),
    queryFn: fetchCommunityActivity,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch leaderboard data
 * @param period Time period for leaderboard (weekly, monthly, allTime)
 */
export function useLeaderboard(period: LeaderboardPeriod = "weekly") {
  return useQuery<LeaderboardUser[]>({
    queryKey: queryKeys.community.leaderboard(period),
    queryFn: () => fetchLeaderboard(period),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}