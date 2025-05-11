import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";
import { useWalletData } from "@/store/wallet-store";

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "bet" | "payout" | "transfer";
  amount: number;
  timestamp: string;
  address?: string;
  betId?: string;
  betTitle?: string;
  status: "success" | "pending" | "failed";
}

export interface TransactionsResponse {
  transactions: Transaction[];
}

/**
 * Hook to fetch user's transaction history
 */
export function useUserTransactions() {
  const { publicKey } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery<TransactionsResponse>({
    queryKey: queryKeys.user.transactions(),
    queryFn: async () => {
      if (!walletAddress) {
        return { transactions: [] };
      }
      
      const response = await fetch(`/api/users/transactions?address=${walletAddress}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user transactions");
      }
      return response.json();
    },
    enabled: !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
  });
}
