import { useMutation } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  sendAndConfirmTransaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { createAuthMessage } from '../../lib/wallet';
import { useWalletData } from '../../store/wallet-store';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
// Import existing types
import { BetPosition, BetParams, SettleBetParams, WithdrawParams } from '../../types/bet';

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '6snPVDtvkAhKNvvZgYatps49shedjmTSVvcvaGBoBf5w');

// Use existing types or extend them as needed
interface MakeBetParams extends BetParams {
  betAccount: string;
  escrowAccount: string;
  amount: number;
  position: BetPosition; // Use enum type from types folder
}

// Convert position to the on-chain representation (0 for yes, 1 for no)
const positionToChain = (position: BetPosition) => position === 'yes' ? 0 : 1;

export function useSolanaBet() {
  const { publicKey, signTransaction, sendTransaction, signMessage } = useWallet();
  const { authenticate, isAuthenticated, authMessage, authSignature } = useWalletData();
  
  // Helper function to ensure authentication
  const ensureAuthenticated = async (action: string, data?: Record<string, any>) => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected or does not support signing');
    }
    
    // If we already have valid auth, return it
    if (isAuthenticated && authSignature && authMessage) {
      return { signature: authSignature, message: authMessage };
    }
    
    // Create a new authentication
    const message = createAuthMessage(action, data);
    const signatureBytes = await signMessage(new TextEncoder().encode(message));
    const signature = bs58.encode(signatureBytes);
    
    // Verify and store authentication
    await authenticate(publicKey.toString(), signature, message);
    
    return { signature, message };
  };
  
  // Initialize bet on-chain (similar to createPlaceholderTransaction in create-bet page)
  const initializeBet = useMutation({
    mutationFn: async (params: { minBet: number; maxBet: number; expiresAt: Date }) => {
      if (!publicKey || !sendTransaction) throw new Error('Wallet not connected');
      
      // Authenticate the user before proceeding
      await ensureAuthenticated('initialize-bet', params);
      
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
      );
      
      // For a real implementation, we would create program-specific instructions
      // For now we're simulating with a placeholder transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 1000, // Minimal amount for simulation
        })
      );
      
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: transaction.recentBlockhash!,
        lastValidBlockHeight: await connection.getBlockHeight(),
      });
      
      return { signature, betAccount: new PublicKey(publicKey).toString() };
    },
    onError: (error) => {
      toast.error('Failed to initialize bet: ' + error.message);
    },
  });
  
  // Make a bet on an existing bet account
  const makeBet = useMutation({
    mutationFn: async (params: MakeBetParams) => {
      if (!publicKey || !sendTransaction) throw new Error('Wallet not connected');
      
      // Authenticate the user before proceeding
      await ensureAuthenticated('make-bet', {
        betAccount: params.betAccount,
        amount: params.amount,
        position: params.position
      });
      
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
      );
      
      // Convert amount to lamports
      const lamports = Math.floor(params.amount * LAMPORTS_PER_SOL);
      
      // For simulation, we'll transfer SOL to the escrow account
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(params.escrowAccount),
          lamports,
        })
      );
      
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      return { signature };
    },
    onError: (error) => {
      toast.error('Failed to place bet: ' + error.message);
    },
  });

  // Settle/resolve a bet (only bet creator)
  const settleBet = useMutation({
    mutationFn: async (params: SettleBetParams) => {
      if (!publicKey || !sendTransaction) throw new Error('Wallet not connected');
      
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
      );
      
      // For simulation, we'll just send a minimal transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 1000, // Minimal amount for simulation
        })
      );
      
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      return { signature };
    },
    onError: (error) => {
      toast('Failed to settle bet');
    },
  });

  // Withdraw funds from a bet
  const withdraw = useMutation({
    mutationFn: async (params: WithdrawParams) => {
      if (!publicKey || !sendTransaction) throw new Error('Wallet not connected');
      
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
      );
      
      // For simulation, we'll transfer SOL from the escrow back to the user
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey, // In real implementation, this would be the escrow
          toPubkey: publicKey,
          lamports: 10000, // Simulated winnings
        })
      );
      
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      return { signature };
    },
    onError: (error) => {
      toast("Failed to withdraw funds");
    },
  });

  return {
    initializeBet,
    makeBet,
    settleBet,
    withdraw,
    isLoading: initializeBet.isPending || makeBet.isPending || settleBet.isPending || withdraw.isPending,
  };
}
