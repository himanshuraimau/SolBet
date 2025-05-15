import { create } from 'zustand';
import { WalletTransaction, UserProfile } from '@/types/wallet';
import { createAuthMessage, verifyWalletSignature } from '@/lib/wallet';
import { fetchUserTransactions } from '@/lib/api';
import { transformTransactionsForWallet } from '@/lib/query/hooks/use-user-transactions';

interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  authMessage: string | null;
  authSignature: string | null;
  refreshBalance: (walletAddress?: string) => Promise<void>;
  updateUserProfile: (walletAddress?: string) => Promise<void>;
  authenticate: (walletAddress: string, signature: string, message: string) => Promise<boolean>;
  clearAuth: () => void;
  createAuthenticationMessage: (action: string, data?: Record<string, any>) => string;
}

export const useWalletData = create<WalletState>((set, get) => ({
  balance: 0,
  transactions: [],
  userProfile: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  authMessage: null,
  authSignature: null,
  
  refreshBalance: async (walletAddress?: string) => {
    if (!walletAddress) return;
    
    try {
      set({ isLoading: true, error: null });
      
      // Fetch balance from API
      const response = await fetch(`/api/wallet/balance?address=${walletAddress}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch balance');
      }
      
      const data = await response.json();
      
      // Fetch recent transactions from API
      const txResponse = await fetchUserTransactions(walletAddress);
      
      // Transform API transactions to wallet store format
      const transactions = transformTransactionsForWallet(txResponse.transactions);
      
      set({ 
        balance: data.balance,
        transactions,
        isLoading: false
      });
    } catch (err) {
      console.error('Error refreshing wallet data:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to refresh wallet data',
        isLoading: false
      });
    }
  },
  
  updateUserProfile: async (walletAddress?: string) => {
    if (!walletAddress) return;
    
    try {
      set({ isLoading: true, error: null });
      
      // Fetch user profile from API
      const response = await fetch(`/api/users/profile?address=${walletAddress}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user profile');
      }
      
      const profile = await response.json();
      
      set({ 
        userProfile: profile,
        isLoading: false
      });
    } catch (err) {
      console.error('Error updating user profile:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update user profile',
        isLoading: false
      });
    }
  },
  
  authenticate: async (walletAddress: string, signature: string, message: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Verify the wallet signature
      const isValid = await verifyWalletSignature(walletAddress, signature, message);
      
      if (isValid) {
        set({ 
          isAuthenticated: true, 
          authMessage: message,
          authSignature: signature,
          isLoading: false 
        });
        return true;
      } else {
        set({ 
          error: 'Invalid wallet signature', 
          isAuthenticated: false,
          isLoading: false 
        });
        return false;
      }
    } catch (err) {
      console.error('Authentication error:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Authentication failed',
        isAuthenticated: false,
        isLoading: false 
      });
      return false;
    }
  },
  
  clearAuth: () => {
    set({
      isAuthenticated: false,
      authMessage: null,
      authSignature: null
    });
  },
  
  createAuthenticationMessage: (action: string, data?: Record<string, any>) => {
    const message = createAuthMessage(action, data);
    set({ authMessage: message });
    return message;
  }
}));
