import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { WalletInfo } from "@/types/wallet"
import { useWallet } from "@/providers/wallet-provider"

// Updated API function
const fetchWalletTransactionsFromApi = async (walletAddress: string) => {
  const response = await fetch(`/api/wallet/transactions?address=${walletAddress}`)
  if (!response.ok) {
    throw new Error("Failed to fetch wallet transactions")
  }
  return response.json()
}

// Hook to fetch wallet transactions
export function useWalletTransactions() {
  const { wallet } = useWallet()
  const walletAddress = wallet?.address

  return useQuery({
    queryKey: queryKeys.wallet.transactions(),
    queryFn: () => fetchWalletTransactionsFromApi(walletAddress || ""),
    enabled: !!walletAddress,
  })
}

// Hook to refresh wallet balance
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
