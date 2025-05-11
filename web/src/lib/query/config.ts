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

// Query keys for better type safety and organization
export const queryKeys = {
  bets: {
    all: ["bets"] as const,
    lists: () => [...queryKeys.bets.all, "list"] as const,
    list: (filters: string) => [...queryKeys.bets.lists(), { filters }] as const,
    details: () => [...queryKeys.bets.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.bets.details(), id] as const,
  },
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    bets: () => [...queryKeys.user.all, "bets"] as const,
    transactions: () => [...queryKeys.user.all, "transactions"] as const,
    stats: () => [...queryKeys.user.all, "stats"] as const,
    betStats: () => [...queryKeys.user.all, "betStats"] as const,
    activity: () => [...queryKeys.user.all, "activity"] as const,
  },
  wallet: {
    all: ["wallet"] as const,
    balance: () => [...queryKeys.wallet.all, "balance"] as const,
    transactions: () => [...queryKeys.wallet.all, "transactions"] as const,
  },
}
