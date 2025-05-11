"use client";

import { FC, ReactNode, useMemo } from "react";
import { 
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, Cluster } from "@solana/web3.js";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import AuthStateProvider from "./auth-provider";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Create a React Query client
const queryClient = new QueryClient();

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // You can customize the RPC endpoint based on your environment
  const endpoint = useMemo(() => 
    clusterApiUrl((process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") as Cluster), 
  []);
  
  // Empty wallets array will use all available adapters
  // For production, import specific wallets from @solana/wallet-adapter-wallets
  const wallets = useMemo(() => [], []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <AuthStateProvider>
              {children}
            </AuthStateProvider>
          </WalletModalProvider>
        </SolanaWalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
};

export { useWallet } from "@solana/wallet-adapter-react";
