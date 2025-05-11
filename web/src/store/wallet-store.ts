import { create } from 'zustand';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

interface WalletState {
  // Wallet data
  balance: number | null;
  isLoading: boolean;
  
  // Actions
  refreshBalance: (publicKey: PublicKey | null) => Promise<void>;
  clearWalletData: () => void;
  setBalance: (balance: number | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: null,
  isLoading: false,
  
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
    set({ balance: null });
  },
  
  setBalance: (balance) => {
    set({ balance });
  },
}));

// Create a safe wrapper for useWallet hook with SSR support
const useSafeWallet = () => {
  // Default values for wallet state
  const defaultWallet: { publicKey: PublicKey | null, connected: boolean, disconnect: () => void } = { 
    publicKey: null, 
    connected: false,
    disconnect: () => {},
  };
  
  // Use state to avoid hydration mismatch
  const [wallet, setWallet] = useState(defaultWallet);
  
  // Only run the wallet hook on the client after initial render
  useEffect(() => {
    try {
      const walletContext = useSolanaWallet();
      setWallet({
        publicKey: walletContext.publicKey,
        connected: walletContext.connected,
        disconnect: walletContext.disconnect || (() => {}),
      });
    } catch (error) {
      console.warn('Wallet provider not available:', error);
    }
  }, []);
  
  return wallet;
};

// Custom hook to combine Solana wallet adapter with our store
export function useWalletData() {
  const { publicKey, connected, disconnect } = useSafeWallet();
  const { balance, isLoading, refreshBalance } = useWalletStore();
  
  return {
    publicKey,
    connected,
    balance,
    isLoading,
    refreshBalance: () => refreshBalance(publicKey),
    disconnect,
  };
}
