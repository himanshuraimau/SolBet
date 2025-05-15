import { useQuery } from "@tanstack/react-query";
import { Bet } from "@/types/bet";

interface BetResponse {
  success: boolean;
  bet: Bet;
  error?: string;
}

/**
 * Hook to fetch a specific bet by ID
 */
export function useBet(betId: string | null) {
  return useQuery<Bet | null>({
    queryKey: ["bet", betId],
    queryFn: async (): Promise<Bet | null> => {
      if (!betId) return null;
      
      try {
        const response = await fetch(`/api/bets/${betId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch bet");
        }
        
        const data: BetResponse = await response.json();
        
        if (!data.success || !data.bet) {
          throw new Error(data.error || "Failed to fetch bet");
        }
        
        return data.bet;
      } catch (error) {
        console.error("Error fetching bet:", error);
        throw error;
      }
    },
    enabled: !!betId,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}
