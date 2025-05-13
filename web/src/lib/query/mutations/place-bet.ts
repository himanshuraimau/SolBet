import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { Bet } from "@/types/bet"
import { placeBet } from "@/lib/api/index"

interface PlaceBetParams {
  betId: string
  position: "yes" | "no"
  amount: number
  walletAddress: string
}

/**
 * Hook to place a bet with optimistic updates
 * Updates local cache immediately, then reverts if API call fails
 */
export function usePlaceBet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ betId, position, amount, walletAddress }: PlaceBetParams) =>
      placeBet(betId, position, amount, walletAddress),
    // When mutate is called:
    onMutate: async (newBet) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bets.detail(newBet.betId) })

      // Snapshot the previous value
      const previousBet = queryClient.getQueryData<Bet>(queryKeys.bets.detail(newBet.betId))

      // Optimistically update to the new value
      if (previousBet) {
        queryClient.setQueryData<Bet>(queryKeys.bets.detail(newBet.betId), {
          ...previousBet,
          yesPool: newBet.position === "yes" ? previousBet.yesPool + newBet.amount : previousBet.yesPool,
          noPool: newBet.position === "no" ? previousBet.noPool + newBet.amount : previousBet.noPool,
          participants: [
            {
              walletAddress: newBet.walletAddress,
              position: newBet.position,
              amount: newBet.amount,
              timestamp: new Date(),
            },
            ...(previousBet.participants || []),
          ],
        })
      }

      // Return a context object with the snapshotted value
      return { previousBet }
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newBet, context) => {
      if (context?.previousBet) {
        queryClient.setQueryData(queryKeys.bets.detail(newBet.betId), context.previousBet)
      }
    },
    // Always refetch after error or success:
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.bets() })
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.transactions() })
    },
  })
}
