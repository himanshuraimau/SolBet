import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { BetCategory, BetStatus } from "@/types/bet"

// Updated API functions
const fetchBetsFromApi = async (category?: BetCategory, status?: BetStatus, page = 1, limit = 10) => {
  const params = new URLSearchParams()
  if (category) params.append("category", category)
  if (status) params.append("status", status)
  params.append("page", page.toString())
  params.append("limit", limit.toString())

  const response = await fetch(`/api/bets?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch bets")
  }
  return response.json()
}

const fetchBetByIdFromApi = async (id: string) => {
  const response = await fetch(`/api/bets/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch bet")
  }
  return response.json()
}

// Hook to fetch a list of bets with optional filtering
export function useBets(category?: BetCategory, status?: BetStatus) {
  return useQuery({
    queryKey: queryKeys.bets.list(JSON.stringify({ category, status })),
    queryFn: () => fetchBetsFromApi(category, status),
  })
}

// Hook to fetch a single bet by ID
export function useBet(id: string) {
  return useQuery({
    queryKey: queryKeys.bets.detail(id),
    queryFn: () => fetchBetByIdFromApi(id),
    enabled: !!id,
  })
}

// Hook for infinite scrolling of bets
export function useInfiniteBets(category?: BetCategory, status?: BetStatus) {
  return useInfiniteQuery({
    queryKey: queryKeys.bets.list(JSON.stringify({ category, status, infinite: true })),
    queryFn: ({ pageParam = 1 }) => fetchBetsFromApi(category, status, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.bets.length === 0) return undefined
      if (lastPageParam >= lastPage.totalPages) return undefined
      return (lastPageParam as number) + 1
    },
  })
}
