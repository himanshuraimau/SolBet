"use client";

import { ReactNode, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { toast } from '@/hooks/use-toast';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Track if we've already shown an error message
  const [errorShown, setErrorShown] = useState(false);

  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  }, []);

  // Add multiple wallet adapters for better compatibility
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network })
    ],
    [network]
  );

  // Handle wallet errors
  const onError = (error: Error) => {
    // Only show the error message once to avoid spam
    if (!errorShown) {
      // For connection errors, provide a more user-friendly message
      if (error.name === 'WalletConnectionError') {
        console.warn('Wallet connection error:', error.message);
        // Only show toast in production, not during development
        if (process.env.NODE_ENV === 'production') {
          toast({
            title: 'Wallet Connection Failed',
            description: 'Please make sure you have a Solana wallet installed and try again.',
            variant: 'destructive'
          });
        }
      } else {
        console.error('Wallet error:', error);
        toast({
          title: 'Wallet Error',
          description: error.message,
          variant: 'destructive'
        });
      }
      setErrorShown(true);
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider 
        wallets={wallets} 
        autoConnect={false} // Disable auto-connect to prevent errors
        onError={onError}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
