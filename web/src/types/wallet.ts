export interface WalletInfo {
  address: string
  publicKey: string
  balance: number
  provider: "Phantom" | "Solflare" | "Backpack" | "Other"
  connected: boolean
}

export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'winnings';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: Date;
}

export interface UserStats {
  betsCreated: number;
  betsJoined: number;
  winRate: number;
  totalWinnings: number;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
  stats?: UserStats;
}
