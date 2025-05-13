import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { Bet, BetStatus } from "@/types/bet"
import { cancelBet } from "@/lib/api"

interface CancelBetParams {
  betId: string
  walletAddress: string
}

/**
 * Hook to cancel a bet
 * Only the creator of a bet can cancel it if no bets have been placed yet
 */
export function useCancelBet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ betId, walletAddress }: CancelBetParams) =>
      cancelBet(betId, walletAddress) as Promise<{ id: string }>,
    // When mutate is called:
    onMutate: async (cancelParams) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bets.detail(cancelParams.betId) })

      // Snapshot the previous value
      const previousBet = queryClient.getQueryData<Bet>(queryKeys.bets.detail(cancelParams.betId))

      // Optimistically update to the new value
      if (previousBet) {
        queryClient.setQueryData<Bet>(queryKeys.bets.detail(cancelParams.betId), {
          ...previousBet,
          status: "CANCELLED" as BetStatus,
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
      if (data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() })
        queryClient.invalidateQueries({ queryKey: queryKeys.user.bets() })
      }
    },
  })
}
