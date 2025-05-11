"use client";

import { createContext, useContext, ReactNode } from "react";
import { useWalletData } from "@/store/wallet-store";
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
  // Use our centralized wallet store instead of separate hook
  const { userProfile, isProfileLoading, profileError } = useWalletData();

  return (
    <AuthContext.Provider 
      value={{ 
        user: userProfile, 
        isLoading: isProfileLoading, 
        error: profileError 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}