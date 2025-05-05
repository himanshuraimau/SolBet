import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { Bet, BetCategory } from "@/types/bet"

// Updated API function
interface CreateBetParams {
  title: string
  description: string
  category: BetCategory
  minimumBet: number
  maximumBet: number
  endTime: Date
  creator: string
}

const createBetApi = async (params: CreateBetParams) => {
  const response = await fetch("/api/bets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error("Failed to create bet")
  }

  return response.json()
}

// Hook to create a new bet
export function useCreateBet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBetApi,
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
