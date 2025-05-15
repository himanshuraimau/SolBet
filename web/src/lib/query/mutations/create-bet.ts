import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../config';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { createAuthMessage } from '@/lib/wallet';
import { useWalletData } from '@/store/wallet-store';
import { toast } from 'sonner';
// Import existing types
import { CreateBetRequest } from '@/types/bet';

// If we need additional properties, extend the existing type
interface CreateBetParams extends CreateBetRequest {
  // Add any additional fields needed
}

// Client-side validation before sending to API
const validateBetParams = (params: CreateBetParams): string | null => {
  if (!params.title || params.title.length < 3) {
    return 'Title must be at least 3 characters';
  }
  
  if (!params.description || params.description.length < 10) {
    return 'Description must be at least 10 characters';
  }
  
  if (!params.category) {
    return 'Category is required';
  }
  
  if (params.minimumBet < 0.01) {
    return 'Minimum bet must be at least 0.01 SOL';
  }
  
  if (params.maximumBet < params.minimumBet) {
    return 'Maximum bet must be greater than minimum bet';
  }
  
  if (!params.endTime || params.endTime <= new Date()) {
    return 'End time must be in the future';
  }
  
  return null;
}

async function createBet(params: CreateBetParams & { 
  walletAddress: string;
  signature: string;
  message: string;
}) {
  const response = await fetch('/api/bets/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create bet');
  }

  return response.json();
}

export function useCreateBet() {
  const queryClient = useQueryClient();
  const { publicKey, signMessage } = useWallet();
  const { authenticate, isAuthenticated, authMessage, authSignature } = useWalletData();

  return useMutation({
    mutationFn: async (params: CreateBetParams) => {
      if (!publicKey) throw new Error('Wallet not connected');
      if (!signMessage) throw new Error('Wallet does not support message signing');
      
      // Validate params before proceeding
      const validationError = validateBetParams(params);
      if (validationError) {
        toast.error(validationError);
        throw new Error(validationError);
      }
      
      // Ensure description meets minimum length
      const description = params.description.trim();
      if (description.length < 10) {
        const error = 'Description must be at least 10 characters';
        toast.error(error);
        throw new Error(error);
      }
      
      let signature = authSignature;
      let message = authMessage;
      
      // If we don't have a valid auth, create a new one
      if (!isAuthenticated || !signature || !message) {
        // Create authentication message with bet details
        message = createAuthMessage('create-bet', {
          title: params.title,
          endTime: params.endTime.toISOString()
        });
        
        // Sign the message with the wallet
        const signatureBytes = await signMessage(new TextEncoder().encode(message));
        signature = bs58.encode(signatureBytes);
        
        // Verify and store authentication
        await authenticate(publicKey.toString(), signature, message);
      }
      
      // Include wallet address, signature and original message in the request
      return createBet({
        ...params,
        description: description, // Ensure trimmed description
        walletAddress: publicKey.toString(),
        signature,
        message,
      });
    },
    onSuccess: () => {
      // Show success message
      toast.success('Bet created successfully');
      
      // Invalidate bets queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() });
    },
    onError: (error) => {
      // Show error message
      toast.error(`Failed to create bet: ${error.message}`);
    }
  });
}
