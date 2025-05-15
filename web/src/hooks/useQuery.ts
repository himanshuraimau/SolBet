import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { 
  BetOutcome, 
  BetState, 
  UserBet, 
  InitializeBetParams,
  PlaceBetParams,
  ResolveBetParams 
} from '../types';
import { 
  getMockBet, 
  getMockUserBet, 
  getMockUserBets,
  createMockBet,
  placeMockBet,
  resolveMockBet,
  withdrawFromMockBet
} from '../mock';

/**
 * Hook to query a specific bet's data
 * @param betAccountPubkey Public key of the bet account or null
 */
export function useBet(betAccountPubkey: string | null) {
  return useQuery<BetState | null, Error>({
    queryKey: ['bet', betAccountPubkey],
    queryFn: () => getMockBet(betAccountPubkey!),
    enabled: !!betAccountPubkey,
    refetchInterval: 10000, // Refetch every 10 seconds to simulate blockchain updates
  });
}

/**
 * Hook to query a specific user bet
 * @param userBetPubkey Public key of the user bet account or null
 */
export function useUserBet(userBetPubkey: string | null) {
  return useQuery<UserBet | null, Error>({
    queryKey: ['userBet', userBetPubkey],
    queryFn: () => getMockUserBet(userBetPubkey!),
    enabled: !!userBetPubkey,
    refetchInterval: 10000,
  });
}

/**
 * Hook to query all bets for a specific user
 * @param userPubkey Public key of the user or null
 */
export function useUserBets(userPubkey: string | null) {
  return useQuery<UserBet[], Error>({
    queryKey: ['userBets', userPubkey],
    queryFn: () => getMockUserBets(userPubkey!),
    enabled: !!userPubkey,
    refetchInterval: 15000,
    initialData: [], // Start with empty array
  });
}

/**
 * Type for the wallet parameter used in mutations
 */
interface WalletParam {
  wallet: { publicKey: PublicKey };
}

/**
 * Hook to create a new bet
 */
export function useCreateBet() {
  const queryClient = useQueryClient();
  
  return useMutation<
    string,
    Error,
    {
      wallet: { publicKey: PublicKey };
      params: InitializeBetParams;
    }
  >({
    mutationFn: ({ wallet, params }) => createMockBet(wallet.publicKey, params),
    onSuccess: (_, variables) => {
      // Invalidate user bets query for the creator
      queryClient.invalidateQueries({
        queryKey: ['userBets', variables.wallet.publicKey.toString()]
      });
    },
  });
}

/**
 * Hook to place a bet on an existing bet
 */
export function usePlaceBet() {
  const queryClient = useQueryClient();
  
  return useMutation<
    string,
    Error,
    {
      wallet: { publicKey: PublicKey };
      betAccountPubkey: string;
      params: PlaceBetParams;
    }
  >({
    mutationFn: ({ wallet, betAccountPubkey, params }) => 
      placeMockBet(betAccountPubkey, wallet.publicKey, params),
    onSuccess: (_, variables) => {
      // Invalidate queries that need to be updated
      queryClient.invalidateQueries({
        queryKey: ['bet', variables.betAccountPubkey]
      });
      queryClient.invalidateQueries({
        queryKey: ['userBets', variables.wallet.publicKey.toString()]
      });
    },
  });
}

/**
 * Hook to resolve a bet with an outcome
 */
export function useResolveBet() {
  const queryClient = useQueryClient();
  
  return useMutation<
    boolean,
    Error,
    {
      wallet: { publicKey: PublicKey };
      betAccountPubkey: string;
      params: ResolveBetParams;
    }
  >({
    mutationFn: ({ wallet, betAccountPubkey, params }) => 
      resolveMockBet(betAccountPubkey, wallet.publicKey, params),
    onSuccess: (_, variables) => {
      // Invalidate the bet query to update its status
      queryClient.invalidateQueries({
        queryKey: ['bet', variables.betAccountPubkey]
      });
    },
  });
}

/**
 * Hook to withdraw from a bet
 */
export function useWithdrawFromBet() {
  const queryClient = useQueryClient();
  
  return useMutation<
    boolean,
    Error,
    {
      wallet: { publicKey: PublicKey };
      betAccountPubkey: string;
      userBetPubkey: string;
    }
  >({
    mutationFn: ({ wallet, userBetPubkey }) => 
      withdrawFromMockBet(userBetPubkey, wallet.publicKey),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['bet', variables.betAccountPubkey]
      });
      queryClient.invalidateQueries({
        queryKey: ['userBet', variables.userBetPubkey]
      });
      queryClient.invalidateQueries({
        queryKey: ['userBets', variables.wallet.publicKey.toString()]
      });
    },
  });
}
