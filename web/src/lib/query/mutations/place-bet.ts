import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../config';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { createAuthMessage } from '@/lib/wallet';
import { useWalletData } from '@/store/wallet-store';
import { toast } from 'sonner';
import { useSolanaBet } from '@/hooks/bet/use-solana-bet';

// Define the parameters needed for placing a bet
interface PlaceBetParams {
  betId: string;
  betPublicKey: string;
  escrowAccount: string;
  position: 'yes' | 'no';
  amount: number;
}

// Client-side validation before sending to API
const validateBetParams = (params: PlaceBetParams): string | null => {
  if (!params.betId) {
    return 'Bet ID is required';
  }
  
  if (!params.position) {
    return 'Position (yes/no) is required';
  }
  
  if (params.amount <= 0) {
    return 'Bet amount must be positive';
  }
  
  return null;
}

async function placeBet(params: PlaceBetParams & { 
  walletAddress: string;
  signature: string;
  message: string;
  onChainTxId?: string;
}) {
  const response = await fetch('/api/bets/place', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to place bet');
  }

  return response.json();
}

export function usePlaceBet() {
  const queryClient = useQueryClient();
  const { publicKey, signMessage } = useWallet();
  const { authenticate, isAuthenticated, authMessage, authSignature } = useWalletData();
  const { makeBet } = useSolanaBet();

  return useMutation({
    mutationFn: async (params: PlaceBetParams) => {
      if (!publicKey) throw new Error('Wallet not connected');
      if (!signMessage) throw new Error('Wallet does not support message signing');
      
      // Validate params before proceeding
      const validationError = validateBetParams(params);
      if (validationError) {
        toast.error(validationError);
        throw new Error(validationError);
      }
      
      let signature = authSignature;
      let message = authMessage;
      
      // If we don't have a valid auth, create a new one
      if (!isAuthenticated || !signature || !message) {
        // Create authentication message with bet details
        message = createAuthMessage('place-bet', {
          betId: params.betId,
          position: params.position,
          amount: params.amount
        });
        
        // Sign the message with the wallet
        const signatureBytes = await signMessage(new TextEncoder().encode(message));
        signature = bs58.encode(signatureBytes);
        
        // Verify and store authentication
        await authenticate(publicKey.toString(), signature, message);
      }
      
      // Step 1: Process the bet on Solana blockchain
      let onChainTxId;
      try {
        // Place bet on Solana blockchain using the provided Solana addresses
        const onChainResult = await makeBet.mutateAsync({
          betAccount: params.betPublicKey,
          escrowAccount: params.escrowAccount,
          amount: params.amount,
          position: params.position
        });
        
        onChainTxId = onChainResult.signature;
      } catch (err) {
        console.error("Error processing on-chain transaction:", err);
        
        // Get a more helpful error message
        let errorMessage = err instanceof Error ? err.message : "Unknown error";
        throw new Error(`Blockchain transaction failed: ${errorMessage}`);
      }
      
      // Step 2: Record the bet in our database with the transaction signature
      return placeBet({
        ...params,
        walletAddress: publicKey.toString(),
        signature,
        message,
        onChainTxId
      });
    },
    onSuccess: (data, variables) => {
      // Show success message
      toast.success(`Bet placed successfully on ${variables.position.toUpperCase()}`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(variables.betId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() });
    },
    onError: (error) => {
      // Show error message
      toast.error(`Failed to place bet: ${error.message}`);
    }
  });
}
