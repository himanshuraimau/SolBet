import { useQuery } from "@tanstack/react-query";
import { BetQueryParams, Bet } from "@/types/bet";
import { useWallet } from "@solana/wallet-adapter-react";

interface BetsResponse {
  success: boolean;
  data: {
    bets: Bet[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  error?: string;
}

/**
 * Hook to fetch all bets with filtering and pagination
 */
export function useBets(params: BetQueryParams = {}) {
  const { tab = "all", page = 1, limit = 12, search = "", category = "" } = params;
  const { publicKey } = useWallet();
  
  // Construct the query parameters
  const queryParams = new URLSearchParams();
  queryParams.append("tab", tab);
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  
  if (search) {
    queryParams.append("search", search);
  }
  
  if (category && category !== "all") {
    queryParams.append("category", category);
  }
  
  // For "my-bets" tab, include the wallet address if connected
  if (tab === "my-bets" && publicKey) {
    queryParams.append("wallet", publicKey.toString());
  }
  
  return useQuery<BetsResponse>({
    queryKey: ["bets", tab, page, limit, search, category, publicKey?.toString()],
    queryFn: async () => {
      // Skip API call if user is requesting "my-bets" but not connected
      if (tab === "my-bets" && !publicKey) {
        return {
          success: true,
          data: {
            bets: [],
            pagination: {
              page,
              pageSize: limit,
              totalItems: 0,
              totalPages: 0
            }
          }
        };
      }
      
      const response = await fetch(`/api/bets?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch bets");
      }
      
      return await response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Hook to get a specific bet by ID
export function useBet(betId: string) {
  return useQuery({
    queryKey: ['bet', betId],
    queryFn: async () => {
      const response = await fetch(`/api/bets/${betId}`);
      
      if (!response.ok) {
        throw new Error('Bet not found');
      }
      
      const bet = await response.json();
      
      // Add participants with realistic data
      const solanaBetData = {
        betAccount: betId,
        escrowAccount: `escrow-${betId}`,
        // Additional on-chain data would go here
      };
      
      return { ...bet, solanaBetData };
    }
  });
}

// Re-export for completeness
export default { useBets, useBet };
