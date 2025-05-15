"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// Define user type based on the Prisma schema
interface User {
  id: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define auth context values
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserProfile: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  logout: () => {},
  refreshUser: async () => {},
  updateUserProfile: async () => {},
});

// Debounce function to limit API calls
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add these to prevent excessive API calls
  const isAuthenticating = useRef(false);
  const lastWalletAddress = useRef<string | null>(null);
  const lastAuthTime = useRef<number>(0);
  
  // Minimum time between auth refresh calls (5 seconds)
  const AUTH_REFRESH_THROTTLE = 5000;

  const authenticateUser = useCallback(async (walletAddress: string) => {
    // Skip if we're already authenticating or if it's the same wallet and not enough time has passed
    if (isAuthenticating.current) return;
    
    const now = Date.now();
    if (
      lastWalletAddress.current === walletAddress && 
      now - lastAuthTime.current < AUTH_REFRESH_THROTTLE
    ) {
      return;
    }

    try {
      isAuthenticating.current = true;
      setIsLoading(true);
      setError(null);
      
      // Update tracking variables
      lastWalletAddress.current = walletAddress;
      lastAuthTime.current = now;
      
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to authenticate');
      }
      
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
      isAuthenticating.current = false;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!publicKey || isAuthenticating.current) return;
    
    const walletAddress = publicKey.toString();
    const now = Date.now();
    
    // Skip if we've recently refreshed and it's the same wallet
    if (
      lastWalletAddress.current === walletAddress && 
      now - lastAuthTime.current < AUTH_REFRESH_THROTTLE
    ) {
      return;
    }
    
    try {
      isAuthenticating.current = true;
      setIsLoading(true);
      
      // Update tracking variables
      lastWalletAddress.current = walletAddress;
      lastAuthTime.current = now;
      
      const response = await fetch(`/api/auth?walletAddress=${walletAddress}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data');
      }
      
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh user data');
    } finally {
      setIsLoading(false);
      isAuthenticating.current = false;
    }
  }, [publicKey]);

  // Debounced version of refresh function to avoid multiple rapid calls
  const debouncedRefreshUser = useCallback(
    () => new Promise<void>((resolve) => {
      debounce(() => {
        if (connected && publicKey) {
          refreshUser().then(resolve);
        } else {
          resolve();
        }
      }, 300)();
    }),
    [connected, publicKey, refreshUser]
  );

  useEffect(() => {
    // Only try to authenticate when wallet is connected
    if (connected && publicKey) {
      const walletAddress = publicKey.toString();
      if (lastWalletAddress.current !== walletAddress) {
        // Only authenticate if wallet address has changed
        authenticateUser(walletAddress);
      }
    } else {
      setUser(null);
    }
  }, [connected, publicKey, authenticateUser]);

  const logout = useCallback(() => {
    // Just clear the user state
    setUser(null);
    lastWalletAddress.current = null;
  }, []);

  // Add the updateUserProfile function (alias for refreshUser for now)
  const updateUserProfile = useCallback(async () => {
    if (!publicKey) return;
    debouncedRefreshUser();
  }, [publicKey, debouncedRefreshUser]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = {
    user,
    isLoading,
    error,
    logout,
    refreshUser: debouncedRefreshUser,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}
