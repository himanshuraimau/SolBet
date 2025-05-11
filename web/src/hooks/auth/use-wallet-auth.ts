"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { UserProfile } from "@/types/user";

/**
 * Hook to manage wallet authentication and user registration
 * This automatically registers new users when they connect their wallet
 */
export function useWalletAuth() {
  const { publicKey, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function registerUser(walletAddress: string) {
      setIsLoading(true);
      setError(null);
      
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
        setUser(data.user);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
        setError(errorMessage);
        console.error("Error registering wallet:", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    // When wallet connects, register the user
    if (connected && publicKey) {
      const walletAddress = publicKey.toString();
      registerUser(walletAddress);
    } else {
      // Clear user data when wallet is disconnected
      setUser(null);
    }
  }, [connected, publicKey]);

  return {
    user,
    isLoading,
    error,
  };
}