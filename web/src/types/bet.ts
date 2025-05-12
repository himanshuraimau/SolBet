export interface Bet {
  id: string
  title: string
  description: string
  creator: string
  creatorName?: string
  category: BetCategory
  yesPool: number
  noPool: number
  totalPool?: number
  minimumBet: number
  maximumBet: number
  startTime: Date | string
  endTime: Date | string
  status: BetStatus
  participants?: Participant[]
  participantCount: number
  daysLeft: number
}

export type BetCategory = "sports" | "politics" | "entertainment" | "crypto" | "weather" | "other"
export type BetStatus = "active" | "closed" | "resolved_yes" | "resolved_no" | "disputed"

export interface Participant {
  walletAddress: string
  position: "yes" | "no"
  amount: number
  timestamp: Date
  onChainUserBetAccount?: string // Solana address for the user's bet account
  claimed?: boolean // Whether the user has claimed their winnings/funds
}

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BetsResponse {
  bets: Bet[]
  pagination: PaginationInfo
}

export type BetTab = 'all' | 'trending' | 'ending-soon' | 'my-bets'
