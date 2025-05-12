import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaBet } from './use-solana-bet';
import { useWalletStore } from '../../store/wallet-store';
import { toast } from '../use-toast';
import { useQuery } from '@tanstack/react-query';
import { BetData } from './use-solana-bet';
import { queryKeys } from '@/lib/query/config';

export type BetPosition = 'yes' | 'no';

export interface CreateBetParams {
  title: string;
  description: string;
  category: string;
  expiresAt: number;
  minBet: number;
  maxBet: number;
}

export interface PlaceBetParams {
  betId: string;
  amount: number;
  position: BetPosition;
}

export const useBet = () => {
  const { 
    createBet: createSolanaBet, 
    makeBet: makeSolanaBet,
    settleBet: settleSolanaBet,
    withdraw: withdrawSolana,
    useBetData: useSolanaBetData,
    isLoading: isSolanaLoading
  } = useSolanaBet();
  
  const wallet = useWallet();
  const { connected } = wallet;
  const [isLoading, setIsLoading] = useState(false);

  // Create a new bet
  const createBet = async (params: CreateBetParams) => {
    if (!connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to create a bet',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Using Solana smart contract directly for bet creation
      const result = await createSolanaBet.mutateAsync({
        expiresAt: params.expiresAt,
        minBet: params.minBet,
        maxBet: params.maxBet,
      });

      // Here you would typically store additional metadata about the bet
      // in your database or other storage. For now, we're just returning
      // the Solana transaction result.
      
      return result;
    } catch (error) {
      console.error('Error creating bet:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Place a bet
  const placeBet = async (params: PlaceBetParams) => {
    if (!connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to place a bet',
        variant: 'destructive',
      });
      return null;
    }

    // First, we need to fetch the bet data to get the escrow account
    const betData = await useSolanaBetData(params.betId).refetch();
    
    if (!betData.data) {
      toast({
        title: 'Bet not found',
        description: 'The bet you are trying to place could not be found',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Using Solana smart contract directly for placing a bet
      const result = await makeSolanaBet.mutateAsync({
        betAccount: params.betId,
        escrowAccount: betData.data.escrowAccount,
        amount: params.amount,
        position: params.position,
      });
      
      return result;
    } catch (error) {
      console.error('Error placing bet:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve a bet (creator only)
  const resolveBet = async (betId: string, outcome: BetPosition) => {
    if (!connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to resolve a bet',
        variant: 'destructive',
      });
      return null;
    }

    // First, we need to fetch the bet data to get the escrow account
    const betData = await useSolanaBetData(betId).refetch();
    
    if (!betData.data) {
      toast({
        title: 'Bet not found',
        description: 'The bet you are trying to resolve could not be found',
        variant: 'destructive',
      });
      return null;
    }

    // Verify the user is the creator of the bet
    if (wallet.publicKey?.toBase58() !== betData.data.creator) {
      toast({
        title: 'Not authorized',
        description: 'Only the creator of the bet can resolve it',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Using Solana smart contract directly for resolving a bet
      const result = await settleSolanaBet.mutateAsync({
        betAccount: betId,
        escrowAccount: betData.data.escrowAccount,
        outcome,
      });
      
      return result;
    } catch (error) {
      console.error('Error resolving bet:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw funds from a bet
  const withdrawFunds = async (betId: string, userBetAccount: string) => {
    if (!connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to withdraw funds',
        variant: 'destructive',
      });
      return null;
    }

    // First, we need to fetch the bet data to get the escrow account
    const betData = await useSolanaBetData(betId).refetch();
    
    if (!betData.data) {
      toast({
        title: 'Bet not found',
        description: 'The bet you are trying to withdraw from could not be found',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Using Solana smart contract directly for withdrawing funds
      const result = await withdrawSolana.mutateAsync({
        betAccount: betId,
        escrowAccount: betData.data.escrowAccount,
        userBetAccount,
      });
      
      return result;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all bets (you might want to implement pagination)
  const useAllBets = () => {
    return useQuery({
      queryKey: queryKeys.bets.all,
      queryFn: async () => {
        // This would typically make a call to your backend or a decentralized storage solution
        // to get all available bets. For now, this is a placeholder.
        return [];
      },
    });
  };

  // Fetch a single bet
  const useBetData = (betId?: string) => {
    return useSolanaBetData(betId);
  };

  // Fetch bets created by the current user
  const useUserCreatedBets = () => {
    const { publicKey } = wallet;
    
    return useQuery({
      queryKey: queryKeys.user.bets(),
      queryFn: async () => {
        if (!publicKey) return [];
        // This would typically make a call to your backend or a decentralized storage solution
        // to get bets created by the current user. For now, this is a placeholder.
        return [];
      },
      enabled: !!publicKey,
    });
  };

  // Fetch bets where the current user has participated
  const useUserParticipatedBets = () => {
    const { publicKey } = wallet;
    
    return useQuery({
      queryKey: queryKeys.user.bets(),
      queryFn: async () => {
        if (!publicKey) return [];
        // This would typically make a call to your backend or a decentralized storage solution
        // to get bets where the current user has participated. For now, this is a placeholder.
        return [];
      },
      enabled: !!publicKey,
    });
  };

  return {
    createBet,
    placeBet,
    resolveBet,
    withdrawFunds,
    useAllBets,
    useBetData,
    useUserCreatedBets,
    useUserParticipatedBets,
    isLoading: isLoading || isSolanaLoading,
  };
};