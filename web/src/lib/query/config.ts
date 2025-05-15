// Query key configuration for TanStack Query

export const queryKeys = {
  bets: {
    all: ['bets'] as const,
    lists: () => [...queryKeys.bets.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.bets.lists(), filters] as const,
    details: () => [...queryKeys.bets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bets.details(), id] as const,
  },
  user: {
    all: ['user'] as const,
    bets: () => [...queryKeys.user.all, 'bets'] as const,
    portfolio: () => [...queryKeys.user.all, 'portfolio'] as const,
    activity: () => [...queryKeys.user.all, 'activity'] as const,
    transactions: () => [...queryKeys.user.all, 'transactions'] as const,
    stats: () => [...queryKeys.user.all, 'stats'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    betStats: () => [...queryKeys.user.all, 'betStats'] as const,
  },
  wallet: {
    all: ['wallet'] as const,
    balance: () => [...queryKeys.wallet.all, 'balance'] as const,
    transactions: () => [...queryKeys.wallet.all, 'transactions'] as const,
  },
  community: {
    all: ['community'] as const,
    activity: () => [...queryKeys.community.all, 'activity'] as const,
    leaderboard: () => [...queryKeys.community.all, 'leaderboard'] as const,
  },
};
