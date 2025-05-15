import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchUserBets } from "@/lib/api";

export interface UserBet {
  id: string;
  title: string;
  description?: string;
  amount: number;
  position?: "YES" | "NO";
  outcome?: "YES" | "NO";
  payout?: number;
  expiresAt: string;
  status: "active" | "resolved" | "cancelled";
  createdAt: string;
}

export interface UserBetsResponse {
  active: UserBet[];
  created: UserBet[];
  participated: UserBet[];
  resolved: UserBet[];
}

/**
 * Hook to fetch user's bets grouped by status
 * @returns Query result containing user's bets categorized by status
 */
export function useUserBets() {
  const { publicKey } = useWallet();
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
