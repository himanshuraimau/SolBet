import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { queryKeys } from "@/lib/query/config";
import { fetchUserTransactions } from "@/lib/api";
import type { WalletTransaction, TransactionType } from "@/types/wallet";

export interface UserTransaction {
  id: string;
  type: string;
  amount: number;
  timestamp: string;
  betId?: string;
  betTitle?: string;
  txHash?: string;
  status: string;
}

export interface TransactionsResponse {
  transactions: UserTransaction[];
}

/**
 * Hook to fetch user's transactions
 */
export function useUserTransactions() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString();

  return useQuery<TransactionsResponse>({
    queryKey: queryKeys.user.transactions(),
    queryFn: () => walletAddress 
      ? fetchUserTransactions(walletAddress) 
      : Promise.resolve({ transactions: [] }),
    enabled: !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Helper function to convert API transaction response to wallet transaction format
 */
export function transformTransactionsForWallet(transactions: UserTransaction[]): WalletTransaction[] {
  return transactions.map(tx => ({
    id: tx.id,
    type: mapTransactionType(tx.type),
    amount: tx.amount,
    timestamp: new Date(tx.timestamp),
    status: mapTransactionStatus(tx.status),
    description: tx.betTitle
  }));
}

/**
 * Maps API transaction types to wallet transaction types
 */
function mapTransactionType(type: string): TransactionType {
  switch (type.toLowerCase()) {
    case 'deposit':
    case 'withdrawal':
    case 'bet':
    case 'winnings':
      return type.toLowerCase() as TransactionType;
    case 'win':
    case 'payout':
      return 'winnings';
    default:
      return 'bet';
  }
}

/**
 * Maps API transaction status to wallet transaction status
 */
function mapTransactionStatus(status: string): 'pending' | 'completed' | 'failed' {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'pending';
    case 'failed':
    case 'rejected':
    case 'error':
      return 'failed';
    case 'success':
    case 'completed':
    default:
      return 'completed';
  }
}
