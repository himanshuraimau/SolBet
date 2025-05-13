import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaBet } from './use-solana-bet';
import { toast } from '../use-toast';

// -------------------------------------------------------
// Types
// -------------------------------------------------------

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

// -------------------------------------------------------
// Main Hook
// -------------------------------------------------------

/**
 * Hook for bet-related actions with UI interactions
 * Wraps the lower-level Solana bet hook with additional UI feedback
 */
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

  // -------------------------------------------------------
  // Bet Actions
  // -------------------------------------------------------

  /**
   * Create a new bet with UI feedback
   */
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
      
      return result;
    } catch (error) {
      console.error('Error creating bet:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Place a bet with UI feedback
   */
  const placeBet = async (params: PlaceBetParams) => {
    if (!connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to place a bet',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Fetch the Solana addresses for this bet from our API
      const accountsResponse = await fetch(`/api/bets/${params.betId}/solana-address`);
      
      if (!accountsResponse.ok) {
        const errorData = await accountsResponse.json();
        throw new Error(errorData.error || "Failed to fetch Solana addresses");
      }
      
      const { betAccount, escrowAccount } = await accountsResponse.json();

      // Using Solana smart contract for placing a bet
      const result = await makeSolanaBet.mutateAsync({
        betAccount: betAccount,
        escrowAccount: escrowAccount,
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

  /**
   * Resolve a bet (creator only) with UI feedback
   */
  const resolveBet = async (betId: string, outcome: BetPosition) => {
    if (!connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to resolve a bet',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Fetch the Solana addresses for this bet from our API
      const accountsResponse = await fetch(`/api/bets/${betId}/solana-address`);
      
      if (!accountsResponse.ok) {
        const errorData = await accountsResponse.json();
        throw new Error(errorData.error || "Failed to fetch Solana addresses");
      }
      
      const { betAccount, escrowAccount } = await accountsResponse.json();

      // Using Solana smart contract for resolving a bet
      const result = await settleSolanaBet.mutateAsync({
        betAccount: betAccount,
        escrowAccount: escrowAccount,
        outcome: outcome,
      });
      
      return result;
    } catch (error) {
      console.error('Error resolving bet:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Withdraw funds from a bet with UI feedback
   */
  const withdrawFunds = async (betId: string, userBetAccount: string) => {
    if (!connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to withdraw funds',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Fetch the Solana addresses for this bet from our API
      const accountsResponse = await fetch(`/api/bets/${betId}/solana-address`);
      
      if (!accountsResponse.ok) {
        const errorData = await accountsResponse.json();
        throw new Error(errorData.error || "Failed to fetch Solana addresses");
      }
      
      const { betAccount, escrowAccount } = await accountsResponse.json();

      // Using Solana smart contract for withdrawing funds
      const result = await withdrawSolana.mutateAsync({
        betAccount: betAccount,
        escrowAccount: escrowAccount,
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

  // -------------------------------------------------------
  // Bet Data
  // -------------------------------------------------------

  /**
   * Fetch a single bet - delegating to useSolanaBetData
   */
  const useBetData = (betId?: string) => {
    return useSolanaBetData(betId);
  };

  // -------------------------------------------------------
  // Return hook interface
  // -------------------------------------------------------

  return {
    createBet,
    placeBet,
    resolveBet,
    withdrawFunds,
    useBetData,
    isLoading: isLoading || isSolanaLoading,
  };
};