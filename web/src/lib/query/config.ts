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
    all: () => ["bets"],
    lists: () => [...queryKeys.bets.all(), "list"],
    list: (filters: string) => [...queryKeys.bets.lists(), filters],
    details: () => [...queryKeys.bets.all(), "detail"],
    detail: (id: string) => [...queryKeys.bets.details(), id],
  },
  user: {
    all: () => ["user"],
    profile: () => [...queryKeys.user.all(), "profile"],
    stats: () => [...queryKeys.user.all(), "stats"],
    betStats: () => [...queryKeys.user.all(), "betStats"],
    bets: () => [...queryKeys.user.all(), "bets"],
    activity: () => [...queryKeys.user.all(), "activity"],
    transactions: () => [...queryKeys.user.all(), "transactions"],
  },
  wallet: {
    all: () => ["wallet"],
    balance: () => [...queryKeys.wallet.all(), "balance"],
    transactions: () => [...queryKeys.wallet.all(), "transactions"],
  },
  solana: {
    all: () => ["solana"],
    betData: (id: string) => [...queryKeys.solana.all(), "betData", id],
  },
  community: {
    all: () => ["community"],
    trending: () => [...queryKeys.community.all(), "trending"],
    newest: () => [...queryKeys.community.all(), "newest"],
    popular: () => [...queryKeys.community.all(), "popular"],
    activity: () => [...queryKeys.community.all(), "activity"],
    leaderboard: (period: string) => [...queryKeys.community.all(), "leaderboard", period],
  }
}
