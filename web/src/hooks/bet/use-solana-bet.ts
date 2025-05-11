import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from '../../hooks/use-toast';
import { 
  initializeBet, 
  placeBet, 
  resolveBet, 
  withdrawFromBet,
  fetchBetData
} from '../../lib/solana';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BetData {
  betAccount: string;
  escrowAccount: string;
  creator: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  expiresAt: number;
  status: 'active' | 'resolved' | 'expired';
  outcome?: 'yes' | 'no';
  minBetAmount: number;
  maxBetAmount: number;
}

export const useSolanaBet = () => {
  const wallet = useWallet();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Create a new bet
  const createBet = useMutation({
    mutationFn: async ({ 
      expiresAt, 
      minBet, 
      maxBet 
    }: { 
      expiresAt: number;
      minBet: number;
      maxBet: number;
    }) => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
      
      setIsLoading(true);
      try {
        const result = await initializeBet(wallet, expiresAt, minBet, maxBet);
        toast({
          title: "Bet created successfully",
          description: `Transaction signature: ${result.signature.slice(0, 8)}...`,
        });
        return result;
      } catch (error) {
        console.error("Error creating bet:", error);
        toast({
          title: "Failed to create bet",
          description: (error as Error).message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['bets'] });
    }
  });

  // Place a bet
  const makeBet = useMutation({
    mutationFn: async ({ 
      betAccount, 
      escrowAccount, 
      amount, 
      position 
    }: { 
      betAccount: string;
      escrowAccount: string;
      amount: number;
      position: "yes" | "no";
    }) => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
      
      setIsLoading(true);
      try {
        const result = await placeBet(wallet, betAccount, escrowAccount, amount, position);
        toast({
          title: "Bet placed successfully",
          description: `Transaction signature: ${result.signature.slice(0, 8)}...`,
        });
        return result;
      } catch (error) {
        console.error("Error placing bet:", error);
        toast({
          title: "Failed to place bet",
          description: (error as Error).message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['bet', variables.betAccount] });
    }
  });

  // Resolve a bet (creator only)
  const settleBet = useMutation({
    mutationFn: async ({ 
      betAccount, 
      escrowAccount, 
      outcome 
    }: { 
      betAccount: string;
      escrowAccount: string;
      outcome: "yes" | "no";
    }) => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
      
      setIsLoading(true);
      try {
        const result = await resolveBet(wallet, betAccount, escrowAccount, outcome);
        toast({
          title: "Bet resolved successfully",
          description: `Transaction signature: ${result.signature.slice(0, 8)}...`,
        });
        return result;
      } catch (error) {
        console.error("Error resolving bet:", error);
        toast({
          title: "Failed to resolve bet",
          description: (error as Error).message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['bet', variables.betAccount] });
    }
  });

  // Withdraw funds from a bet
  const withdraw = useMutation({
    mutationFn: async ({ 
      betAccount, 
      escrowAccount, 
      userBetAccount 
    }: { 
      betAccount: string;
      escrowAccount: string;
      userBetAccount: string;
    }) => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
      
      setIsLoading(true);
      try {
        const result = await withdrawFromBet(wallet, betAccount, escrowAccount, userBetAccount);
        toast({
          title: "Funds withdrawn successfully",
          description: `Transaction signature: ${result.signature.slice(0, 8)}...`,
        });
        return result;
      } catch (error) {
        console.error("Error withdrawing funds:", error);
        toast({
          title: "Failed to withdraw funds",
          description: (error as Error).message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['bet', variables.betAccount] });
      queryClient.invalidateQueries({ queryKey: ['userBets'] });
    }
  });

  // Fetch a single bet
  const useBetData = (betAccount?: string) => {
    return useQuery({
      queryKey: ['bet', betAccount],
      queryFn: async () => {
        if (!betAccount) return null;
        return await fetchBetData(betAccount);
      },
      enabled: !!betAccount,
    });
  };

  return {
    createBet,
    makeBet,
    settleBet,
    withdraw,
    useBetData,
    isLoading,
  };
};