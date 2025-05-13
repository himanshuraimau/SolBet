import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/config";
import { useWalletData } from "@/store/wallet-store";
import { fetchUserTransactions } from "@/lib/api";

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "bet" | "winnings" | "payout" | "lostBet";
  amount: number;
  timestamp: string;
  txHash?: string;
  betId?: string;
  betTitle?: string;
  status: "pending" | "confirmed" | "failed";
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
    queryFn: () => walletAddress ? fetchUserTransactions(walletAddress) : Promise.resolve({ transactions: [] }),
    enabled: !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
  });
}
