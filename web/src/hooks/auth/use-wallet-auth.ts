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
    isProfileLoading, 
    profileError 
  } = useWalletData();

  return {
    user: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  };
}