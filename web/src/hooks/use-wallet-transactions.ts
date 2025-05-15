import { useMemo } from 'react';
import { useUserTransactions, transformTransactionsForWallet } from '@/lib/query/hooks/use-user-transactions';
import type { WalletTransaction } from '@/types/wallet';

/**
 * Hook that combines the API transaction data with transformation logic
 * for direct use in wallet components.
 * 
 * @param limit Optional limit of transactions to return
 * @returns Wallet-ready transactions with proper formatting
 */
export function useWalletTransactions(limit?: number) {
  const { data, isLoading, error } = useUserTransactions();
  
  const transactions = useMemo(() => {
    if (!data?.transactions) {
      return [];
    }
    
    // Transform API transactions to wallet-compatible format
    const transformedTransactions = transformTransactionsForWallet(data.transactions);
    
    // Apply limit if specified
    return limit ? transformedTransactions.slice(0, limit) : transformedTransactions;
  }, [data, limit]);
  
  return {
    transactions,
    isLoading,
    error
  };
}
