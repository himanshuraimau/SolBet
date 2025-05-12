import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { WalletTransaction, UserProfile } from '@/types/wallet';
import { fetchUserProfile, updateProfile, fetchWalletActivity } from '@/lib/api/user';
import { useWallet } from '@solana/wallet-adapter-react';

interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
  isLoading: boolean;
}

interface WalletActions {
  setBalance: (balance: number) => void;
  addTransaction: (transaction: WalletTransaction) => void;
  setTransactions: (transactions: WalletTransaction[]) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setIsProfileLoading: (isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  resetState: () => void;
}

// Initial state
const initialState: WalletState = {
  balance: 0,
  transactions: [],
  userProfile: null,
  isProfileLoading: false,
  isLoading: false,
};

// Create the store
export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set) => ({
      ...initialState,
      
      setBalance: (balance) => set(() => ({ balance })),
      
      addTransaction: (transaction) => 
        set((state) => ({ 
          transactions: [transaction, ...state.transactions] 
        })),
      
      setTransactions: (transactions) => set(() => ({ transactions })),
      
      setUserProfile: (profile) => set(() => ({ userProfile: profile })),
      
      setIsProfileLoading: (isLoading) => set(() => ({ isProfileLoading: isLoading })),
      
      setIsLoading: (isLoading) => set(() => ({ isLoading })),
      
      resetState: () => set(initialState),
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ 
        userProfile: state.userProfile,
        transactions: state.transactions,
      }),
    }
  )
);

// Standalone function to get wallet data - no hooks inside
const getWalletBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    // Get connection to Solana network
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    
    // Fetch SOL balance
    const lamports = await connection.getBalance(publicKey);
    return lamports / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return 0;
  }
};

// Custom hook to use wallet data with Solana wallet connection
export function useWalletData() {
  // Use the Solana wallet adapter hook instead of window.solana
  const { publicKey, connected } = useWallet();
  const [mounted, setMounted] = useState(false);
  
  // Get store state and actions
  const { 
    balance, 
    transactions, 
    userProfile,
    isProfileLoading,
    isLoading,
    setBalance, 
    addTransaction, 
    setTransactions,
    setUserProfile,
    setIsProfileLoading,
    setIsLoading,
    resetState
  } = useWalletStore();

  // Set mounted to true when component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset wallet data when wallet disconnects
  useEffect(() => {
    if (!connected) {
      resetState();
    }
  }, [connected, resetState]);

  // Create a stable refreshBalance function with useCallback
  const refreshBalance = useCallback(async () => {
    if (!publicKey || !connected) return;
    
    try {
      setIsLoading(true);
      
      // Get balance
      const newBalance = await getWalletBalance(publicKey);
      setBalance(newBalance);
      
      // Get transaction history 
      const txHistory = await fetchWalletActivity(publicKey.toString());
      const typedTransactions = txHistory.map(tx => ({
        ...tx,
        type: tx.type as unknown as WalletTransaction['type']
      }));
      setTransactions(typedTransactions);
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, setBalance, setTransactions, setIsLoading]);

  // Function to update user profile
  const updateUserProfile = useCallback(async () => {
    if (!publicKey || !connected) return;
    
    try {
      setIsProfileLoading(true);
      const profile = await fetchUserProfile(publicKey.toString());
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsProfileLoading(false);
    }
  }, [publicKey, connected, setUserProfile, setIsProfileLoading]);

  // Update profile with new data
  const updateProfileData = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!publicKey || !connected) return false;
    
    try {
      setIsProfileLoading(true);
      const updatedProfile = await updateProfile(publicKey.toString(), profileData);
      setUserProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    } finally {
      setIsProfileLoading(false);
    }
  }, [publicKey, connected, setUserProfile, setIsProfileLoading]);

  return {
    publicKey,
    connected,
    balance,
    transactions,
    userProfile,
    isProfileLoading,
    isLoading,
    refreshBalance,
    updateUserProfile,
    updateProfileData,
  };
}
