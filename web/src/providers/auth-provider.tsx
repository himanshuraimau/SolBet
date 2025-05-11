"use client";

import { createContext, useContext, ReactNode } from "react";
import { useWalletAuth } from "@/hooks/auth/use-wallet-auth";
import { UserProfile } from "@/types/user";

// Create an Auth context
type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth available
export default function AuthStateProvider({ children }: { children: ReactNode }) {
  // Use our custom hook to get wallet auth state
  const { user, isLoading, error } = useWalletAuth();

  return (
    <AuthContext.Provider value={{ user, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}