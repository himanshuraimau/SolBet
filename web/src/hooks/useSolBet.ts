import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey, Signer } from '@solana/web3.js';
import { SolanaService } from '../services/solanaService';
import { BetService } from '../services/betService';
import { 
  BetOutcome, 
  BetState, 
  InitializeBetParams, 
  PlaceBetParams, 
  ResolveBetParams, 
  UserBet 
} from '../types';

// Initialize services
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const solanaService = new SolanaService(SOLANA_RPC_URL);
const betService = new BetService(solanaService);

/**
 * Hook to query a single bet's data
 * 
 * @param betAccountPubkey - The public key of the bet account as a string, or null
 * @returns Query result containing the bet state data or null if not found/enabled
 */
export function useBet(betAccountPubkey: string | null) {
  return useQuery({
    queryKey: ['bet', betAccountPubkey],
    queryFn: async () => {
      if (!betAccountPubkey) return null;
      return await betService.getBetState(new PublicKey(betAccountPubkey));
    },
    enabled: !!betAccountPubkey,
  });
}

/**
 * Hook to query a user's bet data for a specific bet
 * 
 * @param userBetPubkey - The public key of the user bet account as a string, or null
 * @returns Query result containing the user bet data or null if not found/enabled
 */
export function useUserBet(userBetPubkey: string | null) {
  return useQuery({
    queryKey: ['userBet', userBetPubkey],
    queryFn: async () => {
      if (!userBetPubkey) return null;
      return await betService.getUserBet(new PublicKey(userBetPubkey));
    },
    enabled: !!userBetPubkey,
  });
}

/**
 * Hook to query all bets placed by a specific user
 * 
 * @param userPubkey - The public key of the user as a string, or null
 * @returns Query result containing an array of the user's bets or empty array if not found/enabled
 */
export function useUserBets(userPubkey: string | null) {
  return useQuery({
    queryKey: ['userBets', userPubkey],
    queryFn: async () => {
      if (!userPubkey) return [];
      return await betService.getUserBets(new PublicKey(userPubkey));
    },
    enabled: !!userPubkey,
  });
}

/**
 * Hook to create a new bet
 * 
 * @returns Mutation function that creates a new bet on the Solana blockchain
 * @example
 * ```
 * const { mutate } = useCreateBet();
 * 
 * // Create a new bet
 * mutate({
 *   wallet: solanaWallet,
 *   params: {
 *     expiresAt: Date.now() + 86400000, // 24 hours from now
 *     minBet: 100000000, // 0.1 SOL in lamports
 *     maxBet: 1000000000 // 1 SOL in lamports
 *   }
 * });
 * ```
 */
export function useCreateBet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      wallet, 
      params 
    }: { 
      wallet: Signer; 
      params: InitializeBetParams 
    }) => {
      return await betService.createBet(wallet, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBets'] });
    },
  });
}

/**
 * Hook to place a bet on an existing bet
 * 
 * @returns Mutation function that places a bet on an existing bet account
 * @example
 * ```
 * const { mutate } = usePlaceBet();
 * 
 * // Place a bet
 * mutate({
 *   wallet: solanaWallet,
 *   betAccountPubkey: "betAccountAddress",
 *   params: {
 *     amount: 500000000, // 0.5 SOL in lamports
 *     position: BetOutcome.Yes // Betting on "Yes"
 *   }
 * });
 * ```
 */
export function usePlaceBet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      wallet, 
      betAccountPubkey, 
      params 
    }: { 
      wallet: Signer; 
      betAccountPubkey: string;
      params: PlaceBetParams 
    }) => {
      return await betService.placeBet(
        wallet, 
        new PublicKey(betAccountPubkey), 
        params
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bet', variables.betAccountPubkey] });
      queryClient.invalidateQueries({ queryKey: ['userBets'] });
    },
  });
}

/**
 * Hook to resolve a bet (can only be called by the bet creator)
 * 
 * @returns Mutation function that resolves a bet with the specified outcome
 * @example
 * ```
 * const { mutate } = useResolveBet();
 * 
 * // Resolve a bet
 * mutate({
 *   wallet: solanaWallet,
 *   betAccountPubkey: "betAccountAddress",
 *   params: {
 *     outcome: BetOutcome.Yes // "Yes" outcome wins
 *   }
 * });
 * ```
 */
export function useResolveBet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      wallet, 
      betAccountPubkey, 
      params 
    }: { 
      wallet: Signer; 
      betAccountPubkey: string;
      params: ResolveBetParams 
    }) => {
      return await betService.resolveBet(
        wallet, 
        new PublicKey(betAccountPubkey), 
        params
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bet', variables.betAccountPubkey] });
    },
  });
}

/**
 * Hook to withdraw winnings from a resolved bet or to claim back funds from an expired bet
 * 
 * @returns Mutation function that processes a withdrawal from the specified bet
 * @example
 * ```
 * const { mutate } = useWithdrawFromBet();
 * 
 * // Withdraw from bet
 * mutate({
 *   wallet: solanaWallet,
 *   betAccountPubkey: "betAccountAddress",
 *   userBetPubkey: "userBetAccountAddress"
 * });
 * ```
 */
export function useWithdrawFromBet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      wallet, 
      betAccountPubkey, 
      userBetPubkey 
    }: { 
      wallet: Signer; 
      betAccountPubkey: string;
      userBetPubkey: string;
    }) => {
      return await betService.withdrawFromBet(
        wallet, 
        new PublicKey(betAccountPubkey),
        new PublicKey(userBetPubkey)
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bet', variables.betAccountPubkey] });
      queryClient.invalidateQueries({ queryKey: ['userBet', variables.userBetPubkey] });
      queryClient.invalidateQueries({ queryKey: ['userBets'] });
    },
  });
}
