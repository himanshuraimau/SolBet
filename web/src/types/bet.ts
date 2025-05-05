export interface Bet {
  id: string
  title: string
  description: string
  creator: string
  category: BetCategory
  yesPool: number
  noPool: number
  minimumBet: number
  maximumBet: number
  startTime: Date
  endTime: Date
  status: BetStatus
  participants: Participant[]
}

export type BetCategory = "sports" | "politics" | "entertainment" | "crypto" | "weather" | "other"
export type BetStatus = "active" | "closed" | "resolved_yes" | "resolved_no" | "disputed"

export interface Participant {
  walletAddress: string
  position: "yes" | "no"
  amount: number
  timestamp: Date
}
