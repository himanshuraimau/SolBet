import { create } from 'zustand';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState, useCallback } from 'react';
import { UserProfile } from '@/types/user';

interface WalletState {
  // Wallet data
  balance: number | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
  profileError: string | null;
  
  // Actions
  refreshBalance: (publicKey: PublicKey | null) => Promise<void>;
  clearWalletData: () => void;
  setBalance: (balance: number | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: () => Promise<void>;
  connectWallet: (walletAddress: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: null,
  isLoading: false,
  userProfile: null,
  isProfileLoading: false,
  profileError: null,
  
  refreshBalance: async (publicKey) => {
    if (!publicKey) {
      set({ balance: null, isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      // Use your preferred RPC endpoint
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com');
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      set({ balance: solBalance, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      set({ isLoading: false });
    }
  },
  
  clearWalletData: () => {
    set({ 
      balance: null,
      userProfile: null,
      profileError: null
    });
  },
  
  setBalance: (balance) => {
    set({ balance });
  },

  setUserProfile: (profile) => {
    set({ userProfile: profile });
  },

  updateUserProfile: async () => {
    const { userProfile } = get();
    if (!userProfile) return;

    set({ isProfileLoading: true, profileError: null });
    
    try {
      const response = await fetch(`/api/users/profile?address=${userProfile.walletAddress}`);
      
      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }
      
      const updatedProfile = await response.json();
      set({ userProfile: updatedProfile, isProfileLoading: false });
    } catch (error) {
      console.error('Error updating user profile:', error);
      set({ 
        profileError: error instanceof Error ? error.message : 'Failed to update profile',
        isProfileLoading: false 
      });
    }
  },
  
  connectWallet: async (walletAddress) => {
    if (!walletAddress) return;
    
    set({ isProfileLoading: true, profileError: null });
    
    try {
      const response = await fetch("/api/auth/wallet/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to connect wallet");
      }

      const data = await response.json();
      set({ userProfile: data.user, isProfileLoading: false });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      set({ 
        profileError: error instanceof Error ? error.message : 'Failed to connect wallet',
        isProfileLoading: false 
      });
    }
  }
}));

// Custom hook to combine Solana wallet adapter with our store
export function useWalletData() {
  const { publicKey, connected } = useWallet();
  const { 
    balance, 
    isLoading, 
    userProfile,
    isProfileLoading,
    profileError,
    refreshBalance: storeRefreshBalance,
    setUserProfile,
    updateUserProfile,
    connectWallet,
    clearWalletData
  } = useWalletStore();
  
  // Create a stable refreshBalance function with useCallback
  const refreshBalance = useCallback(() => {
    if (publicKey) {
      storeRefreshBalance(publicKey);
    }
  }, [publicKey, storeRefreshBalance]);
  
  // Handle wallet connection and disconnection
  useEffect(() => {
    if (connected && publicKey) {
      // When wallet connects, refresh balance and connect to backend
      refreshBalance();
      connectWallet(publicKey.toString());
    } else if (!connected) {
      // Clear user data when wallet is disconnected
      clearWalletData();
    }
  }, [connected, publicKey, refreshBalance, connectWallet, clearWalletData]);
  
  return {
    publicKey,
    connected,
    balance,
    isLoading,
    userProfile,
    isProfileLoading,
    profileError,
    refreshBalance,
    updateUserProfile
  };
}
