import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";
import { useWalletData } from "@/store/wallet-store";

export type BetStatus = "ACTIVE" | "CREATED" | "PARTICIPATED" | "RESOLVED";

export interface UserBet {
  id: string;
  title: string;
  description: string;
  amount: number;
  payout?: number;
  status: string;
  createdAt: string;
  expiresAt: string;
  position?: string;
  outcome?: string;
}

export interface UserBetsResponse {
  active: UserBet[];
  created: UserBet[];
  participated: UserBet[];
  resolved: UserBet[];
}

/**
 * Hook to fetch user's bets grouped by status
 */
export function useUserBets() {
  const { publicKey } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery<UserBetsResponse>({
    queryKey: queryKeys.user.bets(),
    queryFn: async () => {
      if (!walletAddress) {
        return { active: [], created: [], participated: [], resolved: [] };
      }
      
      const response = await fetch(`/api/users/bets?address=${walletAddress}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user bets");
      }
      return response.json();
    },
    enabled: !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
  });
}
