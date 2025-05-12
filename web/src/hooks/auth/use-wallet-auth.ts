"use client";

import { useWalletData } from "@/store/wallet-store";
import { UserProfile } from "@/types/user";

/**
 * Hook to manage wallet authentication and user registration
 * This is now a simple wrapper around useWalletData for backward compatibility
 */
export function useWalletAuth() {
  const { 
    userProfile, 
    isProfileLoading
  } = useWalletData();

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

  return {
    user: adaptedProfile,
    isLoading: isProfileLoading,
    error: null,
  };
}