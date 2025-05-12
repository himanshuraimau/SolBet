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
import { queryKeys } from '@/lib/query/config';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from "@solana/web3.js";
import * as buffer from "buffer";

// Ensure Buffer is available for encoding
if (typeof window !== "undefined") {
  window.Buffer = buffer.Buffer;
}

// Helper function to get connection
const getConnection = () => {
  return new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com",
    "confirmed"
  );
};

// Get program ID from environment variables
const getProgramId = () => {
  const programIdStr = process.env.NEXT_PUBLIC_PROGRAM_ID;
  if (!programIdStr) {
    throw new Error("NEXT_PUBLIC_PROGRAM_ID is not set in environment variables");
  }
  
  try {
    return new PublicKey(programIdStr);
  } catch (error) {
    console.error("Invalid program ID format:", error);
    throw new Error("Invalid program ID format in environment variables");
  }
};

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
  const { publicKey, sendTransaction } = useWallet();
  const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || "11111111111111111111111111111111");

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

      const programId = getProgramId();
      
      console.log("Making bet with program ID:", programId.toString());
      console.log("Bet account:", betAccount);
      console.log("Escrow account:", escrowAccount);
      console.log("Position:", position);
      console.log("Amount:", amount);
      
      if (!publicKey) {
        throw new Error("Wallet public key is null");
      }

      try {
        const connection = getConnection();
        
        // Convert string addresses to PublicKey objects
        const betPubkey = new PublicKey(betAccount);
        const escrowPubkey = new PublicKey(escrowAccount);
        
        // Create a transaction instruction for placing a bet
        // The instruction data layout should match what your program expects
        const positionValue = position === "yes" ? 1 : 0;
        const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
        
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
        
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;
        
        console.log("Sending transaction...");
        const signature = await sendTransaction(transaction, connection);
        console.log("Transaction sent with signature:", signature);
        
        console.log("Confirming transaction...");
        await connection.confirmTransaction(signature, "confirmed");
        console.log("Transaction confirmed!");
        
        return { signature };
      } catch (error) {
        console.error("Error making bet:", error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      
      // Extract logs if available for better debugging
      if (error.logs) {
        console.error("Transaction logs:", error.logs);
      }
      
      toast({
        title: "Failed to place bet on blockchain",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(variables.betAccount) });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(variables.betAccount) });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(variables.betAccount) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.bets() });
    }
  });

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

  return {
    createBet,
    makeBet,
    settleBet,
    withdraw,
    useBetData,
    isLoading,
  };
};