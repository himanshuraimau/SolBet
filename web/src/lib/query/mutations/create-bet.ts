import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { Bet, BetCategory } from "@/types/bet"
import { createBet } from "@/lib/api/index"

// Updated interface for creating a bet
interface CreateBetParams {
  title: string
  description: string
  category: BetCategory
  minBet: number
  maxBet: number
  expiresAt: Date
  creator: string
}

/**
 * Hook to create a new bet
 * Handles cache updates after successful bet creation
 */
export function useCreateBet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBet,
    onSuccess: (newBet) => {
      // Update the bets list cache
      queryClient.setQueryData<{ bets: Bet[]; totalPages: number } | undefined>(
        queryKeys.bets.list(JSON.stringify({ category: newBet.category })),
        (oldData) => {
          if (!oldData) return undefined
          return {
            ...oldData,
            bets: [newBet, ...oldData.bets],
          }
        },
      )

      // Invalidate relevant queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.bets() })
    },
  })
}
