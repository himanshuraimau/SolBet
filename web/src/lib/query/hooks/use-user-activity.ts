import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";
import { useWalletData } from "@/store/wallet-store";

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
 */
export function useUserActivity(limit: number = 5) {
  const { publicKey } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery<UserActivity[]>({
    queryKey: [...queryKeys.user.activity(), limit],
    queryFn: async () => {
      if (!walletAddress) {
        return [];
      }
      
      const response = await fetch(`/api/users/activity?address=${walletAddress}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user activity");
      }
      return response.json();
    },
    enabled: !!walletAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
