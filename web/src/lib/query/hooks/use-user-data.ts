import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { TimeFrame } from "@/types/common"
import { useWallet } from "@/providers/wallet-provider"

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

// Hook to fetch user profile
export function useUserProfile() {
  const { wallet } = useWallet()
  const walletAddress = wallet?.address

  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => fetchUserProfileFromApi(walletAddress || ""),
    enabled: !!walletAddress,
  })
}

// Hook to fetch user stats for a specific time frame
export function useUserStats(timeFrame: TimeFrame) {
  const { wallet } = useWallet()
  const walletAddress = wallet?.address

  return useQuery({
    queryKey: [...queryKeys.user.stats(), timeFrame],
    queryFn: () => fetchUserStatsFromApi(walletAddress || "", timeFrame),
    enabled: !!walletAddress,
  })
}
