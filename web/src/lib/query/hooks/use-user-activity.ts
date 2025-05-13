import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";
import { useWalletData } from "@/store/wallet-store";
import { fetchUserActivity } from "@/lib/api/index";

export interface UserActivity {
  id: string;
  type: string;
  title: string;
  amount: number;
  timestamp: string;
  betId?: string | null;
}

/**
 * Hook to fetch user activity from the user's transactions
 * @param limit Number of activity items to fetch (default: 5)
 */
export function useUserActivity(limit: number = 5) {
  const { publicKey } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery<UserActivity[]>({
    queryKey: [...queryKeys.user.activity(), limit],
    queryFn: () => walletAddress ? fetchUserActivity(walletAddress, limit) : Promise.resolve([]),
    enabled: !!walletAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
