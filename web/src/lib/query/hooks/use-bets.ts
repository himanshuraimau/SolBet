import { useQuery } from "@tanstack/react-query";
import { delay } from "@/mock/utils";
import { Bet } from "@/mock/adapters";

// Generate a mock bet for the detailed view
const generateMockBet = (id: string): Bet => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // 0-7 days in future
  
  const yesPool = Math.random() * 20 + 5; // 5-25 SOL
  const noPool = Math.random() * 20 + 5; // 5-25 SOL
  const totalPool = yesPool + noPool;
  
  return {
    id,
    title: `Mock Bet #${id.substring(0, 6)}`,
    description: "This is a mock bet generated for development purposes. Will Bitcoin reach $100,000 before the end of the year?",
    creator: "HXtBm8XZbxaTt41uqaKhwUAa6Z1aPyvJdsZVENiWsetg",
    category: ["crypto", "sports", "politics", "entertainment", "science", "tech"][Math.floor(Math.random() * 6)],
    status: "active",
    yesPool,
    noPool,
    totalPool,
    minimumBet: 0.1,
    maximumBet: 10,
    daysLeft: Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    expiresAt,
    endTime: expiresAt,
    startTime: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 0-30 days in past
    participants: Array(Math.floor(Math.random() * 20) + 5).fill(null).map(() => ({
      walletAddress: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 8)}`,
      position: Math.random() > 0.5 ? 'yes' : 'no',
      amount: Math.random() * 5 + 0.1, // 0.1-5.1 SOL
      timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // 0-7 days in past
    }))
  };
};

// Hook to get a specific bet by ID
export function useBet(betId: string | null) {
  return useQuery({
    queryKey: ["bet", betId],
    queryFn: async () => {
      if (!betId) return null;
      await delay(800); // Simulate network delay
      return generateMockBet(betId);
    },
    enabled: !!betId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Hook to get all bets (optionally filtered)
export function useBets(category?: string, status?: string) {
  return useQuery({
    queryKey: ["bets", category, status],
    queryFn: async () => {
      await delay(1200); // Simulate network delay
      
      // Generate 20 random bets
      const bets = Array(20).fill(null).map((_, i) => generateMockBet(`bet-${i}`));
      
      // Apply filters if provided
      let filtered = bets;
      if (category && category !== "all") {
        filtered = filtered.filter(bet => bet.category === category.toLowerCase());
      }
      if (status && status !== "all") {
        filtered = filtered.filter(bet => bet.status === status.toLowerCase());
      }
      
      return {
        bets: filtered,
        pagination: {
          page: 1,
          limit: 20,
          totalItems: filtered.length,
          totalPages: 1
        }
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
