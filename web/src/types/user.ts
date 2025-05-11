export interface UserProfile {
  walletAddress: string
  displayName?: string
  avatar?: string
  createdAt?: string | Date  // Add createdAt field
  stats: {
    betsCreated: number
    betsJoined: number
    winRate: number
    totalWinnings: number
  }
  preferences: {
    theme: "light" | "dark" | "system"
    notifications: boolean
  }
}
