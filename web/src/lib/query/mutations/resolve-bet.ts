import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../config';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { createAuthMessage } from '@/lib/wallet';
import { useWalletData } from '@/store/wallet-store';
import { toast } from 'sonner';
import { SolanaService } from '@/services/solanaService';
import { BetService } from '@/services/betService';
import { BetOutcome } from '@/types';

// Define the parameters needed for resolving a bet
interface ResolveBetParams {
  betId: string;
  betPublicKey: string;
  outcome: 'YES' | 'NO';
}

// Client-side validation before sending to API
const validateResolveParams = (params: ResolveBetParams): string | null => {
  if (!params.betId) {
    return 'Bet ID is required';
  }
  
  if (!params.outcome) {
    return 'Outcome (YES/NO) is required';
  }
  
  return null;
}

async function submitResolveBet(params: ResolveBetParams & { 
  walletAddress: string;
  signature: string;
  message: string;
  onChainTxId?: string;
}) {
  const response = await fetch(`/api/bets/${params.betId}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to resolve bet');
  }

  return response.json();
}

export function useResolveBet() {
  const queryClient = useQueryClient();
  const { publicKey, signMessage, signTransaction } = useWallet();
  const { authenticate, isAuthenticated, authMessage, authSignature } = useWalletData();

  return useMutation({
    mutationFn: async (params: ResolveBetParams) => {
      if (!publicKey) throw new Error('Wallet not connected');
      if (!signMessage) throw new Error('Wallet does not support message signing');
      if (!signTransaction) throw new Error('Wallet does not support transaction signing');
      
      // Validate params before proceeding
      const validationError = validateResolveParams(params);
      if (validationError) {
        toast.error(validationError);
        throw new Error(validationError);
      }
      
      let signature = authSignature;
      let message = authMessage;
      
      // If we don't have a valid auth, create a new one
      if (!isAuthenticated || !signature || !message) {
        // Create authentication message with bet details
        message = createAuthMessage('resolve-bet', {
          betId: params.betId,
          outcome: params.outcome
        });
        
        // Sign the message with the wallet
        const signatureBytes = await signMessage(new TextEncoder().encode(message));
        signature = bs58.encode(signatureBytes);
        
        // Verify and store authentication
        await authenticate(publicKey.toString(), signature, message);
      }
      
      // Step 1: Process the bet resolution on Solana blockchain - DIRECT IMPLEMENTATION
      let onChainTxId;
      try {
        // Create services directly rather than using the hook
        const solanaService = new SolanaService(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
        );
        const betService = new BetService(solanaService);
        
        // Convert outcome to BetOutcome enum
        const outcome = params.outcome === "YES" ? BetOutcome.Yes : BetOutcome.No;
        
        // Call the betService to resolve the bet on the blockchain
        onChainTxId = await betService.resolveBet(
          {
            publicKey,
            signTransaction
          },
          new PublicKey(params.betPublicKey),
          { outcome }
        );
        
      } catch (err) {
        console.error("Error processing on-chain resolution:", err);
        
        // Get a more helpful error message
        let errorMessage = err instanceof Error ? err.message : "Unknown error";
        throw new Error(`Blockchain transaction failed: ${errorMessage}`);
      }
      
      // Step 2: Record the bet resolution in our database with the transaction signature
      return submitResolveBet({
        ...params,
        walletAddress: publicKey.toString(),
        signature,
        message,
        onChainTxId
      });
    },
    onSuccess: (data, variables) => {
      // Show success message
      toast.success(`Bet resolved successfully with outcome: ${variables.outcome}`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(variables.betId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() });
    },
    onError: (error) => {
      // Show error message
      toast.error(`Failed to resolve bet: ${error.message}`);
    }
  });
}
