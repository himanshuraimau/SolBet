import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";
import { useWalletData } from "@/store/wallet-store";
import { fetchUserBets } from "@/lib/api";

// -------------------------------------------------------
// Types
// -------------------------------------------------------

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

// -------------------------------------------------------
// Main Hook
// -------------------------------------------------------

/**
 * Hook to fetch user's bets grouped by status
 * @returns Query result containing user's bets categorized by status
 */
export function useUserBets() {
  const { publicKey } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery<UserBetsResponse>({
    queryKey: queryKeys.user.bets(),
    queryFn: () => walletAddress 
      ? fetchUserBets(walletAddress) 
      : Promise.resolve({ active: [], created: [], participated: [], resolved: [] }),
    enabled: !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
  });
}
