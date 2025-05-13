import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { WalletInfo } from "@/types/wallet"
import { useWallet } from "@/providers/wallet-provider"
import { fetchWalletTransactions } from "@/lib/api"

// -------------------------------------------------------
// Hooks
// -------------------------------------------------------

/**
 * Hook to fetch wallet transactions
 * @returns Query result containing wallet transactions
 */
export function useWalletTransactions() {
  const { wallet } = useWallet()
  const walletAddress = wallet?.address

  return useQuery({
    queryKey: queryKeys.wallet.transactions(),
    queryFn: () => walletAddress ? fetchWalletTransactions(walletAddress) : Promise.resolve(null),
    enabled: !!walletAddress,
  })
}

/**
 * Hook to refresh wallet balance
 * @returns Mutation function to trigger balance refresh
 */
export function useRefreshWalletBalance() {
  const queryClient = useQueryClient()
  const { wallet, refreshBalance } = useWallet()

  return useMutation({
    mutationFn: refreshBalance,
    onSuccess: (newBalance) => {
      // Update the wallet info if it exists in the cache
      queryClient.setQueryData<WalletInfo | undefined>(queryKeys.wallet.all, (oldData) => {
        if (!oldData) return undefined
        return {
          ...oldData,
          balance: wallet?.balance || 0,
        }
      })
    },
  })
}
