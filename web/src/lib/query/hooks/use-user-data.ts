import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { TimeFrame } from "@/types/common"
import { useWalletData } from "@/store/wallet-store"

// Updated API functions
const fetchUserProfileFromApi = async (walletAddress: string) => {
  const response = await fetch(`/api/users/profile?address=${walletAddress}`)
  if (!response.ok) {
    throw new Error("Failed to fetch user profile")
  }
  return response.json()
}

const fetchUserStatsFromApi = async (walletAddress: string, timeFrame: TimeFrame) => {
  const response = await fetch(`/api/users/stats?address=${walletAddress}&timeFrame=${timeFrame}`)
  if (!response.ok) {
    throw new Error("Failed to fetch user stats")
  }
  return response.json()
}

// Hook to fetch user profile - now uses the userProfile from our wallet store if available
export function useUserProfile() {
  const { publicKey, userProfile } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery({
    queryKey: queryKeys.user.profile(),
    // If we already have the userProfile in the store, return it immediately
    // Otherwise fetch it from the API
    queryFn: () => {
      if (userProfile) return Promise.resolve(userProfile);
      return fetchUserProfileFromApi(walletAddress || "");
    },
    enabled: !!walletAddress,
  })
}

// Hook to fetch user stats for a specific time frame
export function useUserStats(timeFrame: TimeFrame) {
  const { publicKey } = useWalletData();
  const walletAddress = publicKey?.toString();

  return useQuery({
    queryKey: [...queryKeys.user.stats(), timeFrame],
    queryFn: () => fetchUserStatsFromApi(walletAddress || "", timeFrame),
    enabled: !!walletAddress,
  })
}
