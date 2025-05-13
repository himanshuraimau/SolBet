// Central export file for all hooks
// This provides a unified entry point for importing hooks

// UI/UX Hooks
export { useIsMobile } from './use-mobile';
export { useToast, toast } from './use-toast';

// Authentication Hooks
export { useWalletAuth } from './auth/use-wallet-auth';

// Bet Interaction Hooks
export { useBet } from './bet/use-bet';
export { useBets } from './bet/use-bets';
export { useSolanaBet } from './bet/use-solana-bet';

// Re-export data fetching hooks for convenience
export { 
  useBets as useQueryBets,
  useBet as useQueryBet,
  useInfiniteBets
} from '@/lib/query/hooks/use-bets';

export {
  useCommunityActivity,
  useLeaderboard
} from '@/lib/query/hooks/use-community-data';

export { useUserActivity } from '@/lib/query/hooks/use-user-activity';
export { useUserBets } from '@/lib/query/hooks/use-user-bets';

export {
  useUserProfile,
  useUserStats,
  useBettingHistory,
  useBetStatistics,
  usePortfolioPerformance
} from '@/lib/query/hooks/use-user-data';

export { useUserTransactions } from '@/lib/query/hooks/use-user-transactions';
export { useWalletTransactions, useRefreshWalletBalance } from '@/lib/query/hooks/use-wallet';
