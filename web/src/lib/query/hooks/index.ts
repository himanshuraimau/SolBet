/**
 * Central export file for all React Query hooks.
 * This provides a clean API for importing hooks throughout the application.
 */

// Bet-related hooks
export { useBets, useBet, useInfiniteBets } from './use-bets';

// User-related hooks
export { 
  useUserProfile,
  useUserStats,
  useBettingHistory,
  useBetStatistics,
  usePortfolioPerformance
} from './use-user-data';
export { useUserBets } from './use-user-bets';
export { useUserActivity } from './use-user-activity';
export { useUserTransactions } from './use-user-transactions';

// Wallet-related hooks
export { useWalletTransactions, useRefreshWalletBalance } from './use-wallet';

// Community-related hooks
export { useCommunityActivity, useLeaderboard } from './use-community-data';

// Mutation hooks
export { useCreateBet } from '../mutations/create-bet';
export { usePlaceBet } from '../mutations/place-bet';
