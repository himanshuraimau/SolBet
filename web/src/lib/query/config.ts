import { QueryClient } from "@tanstack/react-query"

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  },
})

/**
 * Query keys for better type safety and organization.
 * Structured hierarchically to allow for easy invalidation of related queries.
 */
export const queryKeys = {
  bets: {
    all: ["bets"] as const,
    lists: () => [...queryKeys.bets.all, "list"] as const,
    list: (filters: string) => [...queryKeys.bets.lists(), { filters }] as const,
    details: () => [...queryKeys.bets.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.bets.details(), id] as const,
    statistics: () => [...queryKeys.bets.all, "statistics"] as const,
  },
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    bets: () => [...queryKeys.user.all, "bets"] as const,
    transactions: () => [...queryKeys.user.all, "transactions"] as const,
    stats: () => [...queryKeys.user.all, "stats"] as const,
    betStats: () => [...queryKeys.user.all, "betStats"] as const,
    activity: () => [...queryKeys.user.all, "activity"] as const,
    performance: (timeFrame: string) => [...queryKeys.user.all, "performance", timeFrame] as const,
  },
  wallet: {
    all: ["wallet"] as const,
    balance: () => [...queryKeys.wallet.all, "balance"] as const,
    transactions: () => [...queryKeys.wallet.all, "transactions"] as const,
  },
  community: {
    all: ["community"] as const,
    activity: () => [...queryKeys.community.all, "activity"] as const,
    leaderboard: (period: string) => [...queryKeys.community.all, "leaderboard", period] as const,
  }
}
