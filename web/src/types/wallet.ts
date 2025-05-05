export interface WalletInfo {
  address: string
  publicKey: string
  balance: number
  provider: "Phantom" | "Solflare" | "Backpack" | "Other"
  connected: boolean
}

export interface WalletTransaction {
  id: string
  amount: number
  timestamp: Date
  type: "bet" | "deposit" | "withdrawal" | "winnings"
  status: "pending" | "confirmed" | "failed"
}
