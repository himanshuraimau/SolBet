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
  const { userProfile, isProfileLoading } = useWalletData();
  
  // Convert wallet profile format to user profile format if needed
  const adaptedProfile = userProfile ? {
    walletAddress: userProfile.walletAddress,
    displayName: userProfile.displayName,
    avatar: userProfile.avatarUrl,
    createdAt: userProfile.createdAt,
    stats: userProfile.stats || {
      betsCreated: 0,
      betsJoined: 0,
      winRate: 0,
      totalWinnings: 0
    },
    preferences: {
      theme: "dark" as const,
      notifications: true
    }
  } : null;

  return (
    <AuthContext.Provider 
      value={{ 
        user: adaptedProfile, 
        isLoading: isProfileLoading, 
        error: null 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}