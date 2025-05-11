"use client";

import { useState, useEffect } from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from '@solana/wallet-adapter-react';
import { formatWalletAddress } from "@/lib/wallet";

export default function WalletBadge() {
  // Always call hooks at the top level, before any conditional statements
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true when component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on server-side or during initial client render
  if (!mounted) {
    return <div className="h-10 w-[120px]"></div>; // Placeholder with similar dimensions
  }

  // Only access wallet context after component is mounted
  const { publicKey, connected } = useWallet();
  
  // Format address only if we have a publicKey
  const displayAddress = publicKey ? formatWalletAddress(publicKey) : "";

  return (
    <div className="relative z-10">
      <WalletMultiButton 
        className="wallet-adapter-button-custom" 
      />
      <style jsx global>{`
        .wallet-adapter-button-custom {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: #FFF !important;
          border-radius: 0.5rem !important;
          height: 40px !important;
          padding: 0 1rem !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          transition: all 0.2s !important;
        }
        
        .wallet-adapter-button-custom:hover {
          background-color: rgba(255, 255, 255, 0.15) !important;
          border-color: var(--primary-yellow) !important;
        }
        
        .wallet-adapter-modal-wrapper {
          background-color: #1e1e24 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1rem !important;
        }
        
        .wallet-adapter-modal-title {
          color: #fff !important;
        }
        
        .wallet-adapter-modal-list {
          margin: 1rem 0 !important;
        }
        
        .wallet-adapter-modal-list-more {
          color: var(--primary-yellow) !important;
        }
      `}</style>
    </div>
  );
}
