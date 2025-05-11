import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";

// Types
type LeaderboardPeriod = "weekly" | "monthly" | "allTime";

interface LeaderboardUser {
  rank: number;
  address: string;
  displayName: string | null;
  avatar: string | null;
  winRate: number;
  winnings: number;
}

interface ActivityItem {
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

// Fetch community activity feed
export function useCommunityActivity() {
  return useQuery<ActivityItem[]>({
    queryKey: ["communityActivity"],
    queryFn: async () => {
      const response = await fetch("/api/community/activity");
      if (!response.ok) {
        throw new Error("Failed to fetch community activity");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch leaderboard data
export function useLeaderboard(period: LeaderboardPeriod = "weekly") {
  return useQuery<LeaderboardUser[]>({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      const response = await fetch(`/api/community/leaderboard?period=${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}