import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { WalletTransaction } from "@/types/wallet"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletData } from "@/store/wallet-store"
import { fetchWalletActivity } from "@/lib/api/user"

// -------------------------------------------------------
// Hooks
// -------------------------------------------------------

/**
 * Hook to fetch wallet transactions
 * @returns Query result containing wallet transactions
 */
export function useWalletTransactions() {
  const { publicKey } = useWallet()
  const walletAddress = publicKey?.toString()

  return useQuery({
    queryKey: queryKeys.wallet.transactions(),
    queryFn: () => walletAddress ? fetchWalletActivity(walletAddress) : Promise.resolve([]),
    enabled: !!walletAddress,
  })
}

/**
 * Hook to refresh wallet balance
 * @returns Mutation function to trigger balance refresh
 */
export function useRefreshWalletBalance() {
  const queryClient = useQueryClient()
  const { publicKey } = useWallet()
  const { refreshBalance, balance } = useWalletData()

  return useMutation({
    mutationFn: refreshBalance,
    onSuccess: () => {
      // Update the wallet info if it exists in the cache
      queryClient.setQueryData<{ balance: number } | undefined>(
        queryKeys.wallet.all(), 
        (oldData) => {
          if (!oldData) return undefined
          return {
            ...oldData,
            balance: balance || 0,
          }
        }
      )
    },
  })
}
