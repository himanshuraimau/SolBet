import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchUserActivity } from "@/lib/api";

export interface UserActivity {
  id: string;
  title: string;
  type: "bet_placed" | "bet_won" | "bet_lost" | "withdrawal" | "payout";
  amount: number;
  timestamp: string;
  betId?: string;
}

/**
 * Hook to fetch user's activity feed
 * @param limit Number of activities to fetch
 */
export function useUserActivity(limit: number = 5) {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString();

  return useQuery<UserActivity[]>({
    queryKey: [...queryKeys.user.activity(), limit],
    queryFn: () => walletAddress 
      ? fetchUserActivity(walletAddress, limit) 
      : Promise.resolve([]),
    enabled: !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
  });
}
