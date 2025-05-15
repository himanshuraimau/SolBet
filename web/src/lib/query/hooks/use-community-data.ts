import { useQuery } from "@tanstack/react-query";
import { mockWallets } from "@/mock/users";
import { delay } from "@/mock/utils";

// Types
export interface ActivityItem {
  id: string;
  user: {
    address: string;
    displayName?: string;
  };
  title: string;
  type: "bet_placed" | "bet_won" | "bet_lost" | "withdrawal" | "payout";
  amount: number;
  timestamp: string;
  betId?: string;
}

export interface LeaderboardUser {
  address: string;
  displayName?: string;
  rank: number;
  winRate: number;
  winnings: number;
  betCount: number;
}

type LeaderboardPeriod = "weekly" | "monthly" | "allTime";

// Mock community activity data
const generateMockActivityData = (): ActivityItem[] => {
  const activityTypes: ActivityItem["type"][] = [
    "bet_placed", 
    "bet_won", 
    "bet_lost", 
    "withdrawal", 
    "payout"
  ];
  
  const activityTitles = {
    bet_placed: "placed a bet",
    bet_won: "won a bet",
    bet_lost: "lost a bet",
    withdrawal: "withdrew funds",
    payout: "received payout"
  };
  
  return Array(20).fill(null).map((_, index) => {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const walletKeys = Object.keys(mockWallets) as Array<keyof typeof mockWallets>;
    const randomWallet = mockWallets[walletKeys[Math.floor(Math.random() * walletKeys.length)]];
    
    // Different time ranges for different activities to make it look more realistic
    const hoursAgo = Math.floor(Math.random() * 72); // Up to 3 days ago
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    
    // Amount depends on the type of activity
    let amount = 0;
    if (type === "bet_placed" || type === "withdrawal") {
      amount = Math.random() * 2 + 0.1; // 0.1 to 2.1 SOL
    } else if (type === "bet_won" || type === "payout") {
      amount = Math.random() * 5 + 0.5; // 0.5 to 5.5 SOL
    } else if (type === "bet_lost") {
      amount = Math.random() * 2 + 0.1; // 0.1 to 2.1 SOL
    }
    
    return {
      id: `activity-${index}`,
      user: {
        address: randomWallet.toString(),
        displayName: walletKeys[Math.floor(Math.random() * walletKeys.length)], // Just use the wallet nickname
      },
      title: activityTitles[type],
      type,
      amount,
      timestamp,
      betId: `bet-${Math.floor(Math.random() * 100)}`
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by timestamp desc
};

// Mock leaderboard data
const generateMockLeaderboardData = (period: LeaderboardPeriod): LeaderboardUser[] => {
  // Create a base set of users including our mock wallets
  const baseUsers = Object.entries(mockWallets).map(([name, wallet], index) => {
    // Different ranges based on period to make data look more realistic
    let winningsMultiplier = 1;
    if (period === "monthly") winningsMultiplier = 4;
    if (period === "allTime") winningsMultiplier = 12;
    
    return {
      address: wallet.toString(),
      displayName: name,
      rank: index + 1,
      winRate: Math.round(Math.random() * 40 + 50), // 50% to 90%
      winnings: parseFloat((Math.random() * 10 * winningsMultiplier + 1).toFixed(2)), // 1 to X SOL based on period
      betCount: Math.floor(Math.random() * 20 * winningsMultiplier + 5) // 5 to X bets based on period
    };
  });
  
  // Add some random users to fill out the leaderboard
  const randomUsers = Array(7).fill(null).map((_, index) => {
    // Different ranges based on period to make data look more realistic
    let winningsMultiplier = 1;
    if (period === "monthly") winningsMultiplier = 4;
    if (period === "allTime") winningsMultiplier = 12;
    
    return {
      address: `Random${index}Wallet${Math.floor(Math.random() * 10000)}`,
      rank: baseUsers.length + index + 1,
      winRate: Math.round(Math.random() * 40 + 50), // 50% to 90%
      winnings: parseFloat((Math.random() * 10 * winningsMultiplier + 1).toFixed(2)), // 1 to X SOL based on period
      betCount: Math.floor(Math.random() * 20 * winningsMultiplier + 5) // 5 to X bets based on period
    };
  });
  
  // Combine and sort by winnings to get final rankings
  const allUsers = [...baseUsers, ...randomUsers].sort((a, b) => b.winnings - a.winnings);
  
  // Update ranks based on sort order
  return allUsers.map((user, index) => ({
    ...user,
    rank: index + 1
  }));
};

// Community activity hook
export function useCommunityActivity() {
  return useQuery({
    queryKey: ["communityActivity"],
    queryFn: async () => {
      await delay(800); // Simulate network delay
      return generateMockActivityData();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Leaderboard hook
export function useLeaderboard(period: LeaderboardPeriod) {
  return useQuery({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      await delay(1000); // Simulate network delay
      return generateMockLeaderboardData(period);
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
