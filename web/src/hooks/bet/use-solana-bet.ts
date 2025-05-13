import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { toast } from '../../hooks/use-toast';
import { 
  initializeBet, 
  placeBet, 
  resolveBet, 
  withdrawFromBet,
  fetchBetData
} from '../../lib/solana';
import { formatSolanaError, getTransactionDetails, checkSufficientBalance } from '../../lib/solana-debug';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/config';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  TransactionInstruction 
} from "@solana/web3.js";
import * as buffer from "buffer";
import type { BetStatus } from "@/types/bet";

// -------------------------------------------------------
// Types
// -------------------------------------------------------

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

// -------------------------------------------------------
// Utility functions
// -------------------------------------------------------

/**
 * Ensure Buffer is available in browser environment
 */
if (typeof window !== "undefined") {
  window.Buffer = buffer.Buffer;
}

/**
 * Get connection to Solana network
 */
const getConnection = () => {
  return new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com",
    "confirmed"
  );
};

/**
 * Get program ID from environment variables
 */
const getProgramId = () => {
  const programIdStr = process.env.NEXT_PUBLIC_PROGRAM_ID || process.env.NEXT_PUBLIC_SOLBET_PROGRAM_ID;
  if (!programIdStr) {
    console.warn("PROGRAM_ID not found in environment variables, using default system program ID");
    return new PublicKey("11111111111111111111111111111111"); // Default to system program as fallback
  }
  
  try {
    return new PublicKey(programIdStr);
  } catch (error) {
    console.error("Invalid program ID format:", error);
    throw new Error(`Invalid program ID format in environment variables: ${programIdStr}`);
  }
}

// -------------------------------------------------------
// Main Hook
// -------------------------------------------------------

/**
 * Hook for interacting with SolBet smart contracts on Solana blockchain
 * Provides functions to create, participate in, and resolve bets
 */
export const useSolanaBet = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { publicKey, sendTransaction } = useWallet();
  
  // Initialize programId safely - try both environment variables
  const programIdStr = process.env.NEXT_PUBLIC_PROGRAM_ID || process.env.NEXT_PUBLIC_SOLBET_PROGRAM_ID || "11111111111111111111111111111111";
  const programId = new PublicKey(programIdStr);

  // -------------------------------------------------------
  // Mutations
  // -------------------------------------------------------

  /**
   * Create a new bet on the Solana blockchain
   */
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

  /**
   * Place a bet on an existing bet account
   */
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

      const programId = getProgramId();
      
      console.log("Making bet with program ID:", programId.toString());
      console.log("Bet account:", betAccount);
      console.log("Escrow account:", escrowAccount);
      console.log("Position:", position);
      console.log("Amount (SOL):", amount);
      console.log("Amount (lamports):", Math.floor(amount * LAMPORTS_PER_SOL));
      
      if (!publicKey) {
        throw new Error("Wallet public key is null");
      }

      try {
        const connection = getConnection();
        
        // Convert string addresses to PublicKey objects
        const betPubkey = new PublicKey(betAccount);
        const escrowPubkey = new PublicKey(escrowAccount);
        
        // Check if user has sufficient balance before attempting transaction
        const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
        const estimatedFee = 5000; // Estimate of transaction fee in lamports
        const totalRequired = lamports + estimatedFee;
        
        const balanceCheck = await checkSufficientBalance(
          connection, 
          publicKey.toString(), 
          totalRequired
        );
        
        if (balanceCheck.isEnough === false) {
          const currentBalance = balanceCheck.balance || 0;
          throw new Error(
            `Insufficient funds: You need at least ${(totalRequired / LAMPORTS_PER_SOL).toFixed(5)} SOL but have ${(currentBalance / LAMPORTS_PER_SOL).toFixed(5)} SOL`
          );
        }
        
        // Create a transaction instruction for placing a bet
        // The instruction data layout should match what your program expects
        const positionValue = position === "yes" ? 1 : 0;
        
        // Create instruction data buffer - format should match your program's expected layout
        // Example: [command_id, position, amount_bytes]
        const data = Buffer.from([
          0, // command id for "place bet"
          positionValue, // 1 for yes, 0 for no
          ...new Uint8Array(new Float64Array([amount]).buffer) // amount as bytes
        ]);
        
        // Create the instruction with the proper accounts and data
        const instruction = new TransactionInstruction({
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true }, // user wallet
            { pubkey: betPubkey, isSigner: false, isWritable: true }, // bet account
            { pubkey: escrowPubkey, isSigner: false, isWritable: true }, // escrow account
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false } // system program
          ],
          programId: programId,
          data: data
        });
        
        // Also add a system transfer instruction to send the bet amount to the escrow
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: escrowPubkey,
          lamports: lamports
        });
        
        // Create and send the transaction
        const transaction = new Transaction().add(transferInstruction, instruction);
        
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;
        
        console.log("Sending transaction...");
        try {
          const signature = await sendTransaction(transaction, connection);
          console.log("Transaction sent with signature:", signature);
          
          // Wait for confirmation with proper error handling and timeout
          const confirmation = await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
          }, 'confirmed');
          
          if (confirmation.value.err) {
            throw new Error(`Transaction confirmed but failed: ${confirmation.value.err.toString()}`);
          }
          
          console.log("Transaction confirmed successfully!");
          return { signature };
        } catch (sendError) {
          console.error("Transaction send error:", sendError);
          // Add more context to the error
          const enhancedError = new Error(`Failed to send transaction: ${sendError instanceof Error ? sendError.message : String(sendError)}`);
          // Only set cause if it's an Error object
          if (sendError instanceof Error) {
            Object.defineProperty(enhancedError, 'cause', { value: sendError });
          }
          throw enhancedError;
        }
      } catch (error) {
        console.error("Error making bet:", error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      
      // Format the error message with our helper
      const detailedError = formatSolanaError(error);
      console.error("Detailed error information:", detailedError);
      
      // Extract specific error types and provide more helpful messages
      let errorMessage = "Unknown error occurred";
      let errorTitle = "Failed to place bet on blockchain";
      
      if (error.name === "WalletSendTransactionError") {
        errorTitle = "Transaction Rejected";
        errorMessage = "The wallet rejected the transaction. Please check your wallet and try again.";
      } else if (error.name === "WalletConnectionError") {
        errorTitle = "Wallet Connection Error";
        errorMessage = "Could not connect to your wallet. Please check your wallet connection and try again.";
      } else if (error.name === "WalletTimeoutError") {
        errorTitle = "Wallet Timeout";
        errorMessage = "Wallet operation timed out. Please try again.";
      } else if (error.message?.includes("insufficient fund")) {
        errorTitle = "Insufficient Funds";
        errorMessage = "You don't have enough SOL to complete this transaction.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Extract logs if available for better debugging
      if (error.logs) {
        console.error("Transaction logs:", error.logs);
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(variables.betAccount) });
    }
  });

  /**
   * Resolve a bet with the final outcome (only callable by creator)
   */
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
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(variables.betAccount) });
    }
  });

  /**
   * Withdraw funds from a resolved bet
   */
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
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(variables.betAccount) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.bets() });
    }
  });

  // -------------------------------------------------------
  // Queries
  // -------------------------------------------------------

  /**
   * Fetch a single bet data by account address
   * @param betAccount - The account address of the bet
   * @returns Query result with bet data
   */

  // Fetch a single bet
  const useBetData = (betAccount?: string) => {
    return useQuery({
      queryKey: queryKeys.bets.detail(betAccount || ''),
      queryFn: async () => {
        if (!betAccount) return null;
        return await fetchBetData(betAccount);
      },
      enabled: !!betAccount,
    });
  };

  // -------------------------------------------------------
  // Return hook interface
  // -------------------------------------------------------

  return {
    createBet,
    makeBet,
    settleBet,
    withdraw,
    useBetData,
    isLoading,
  };
};