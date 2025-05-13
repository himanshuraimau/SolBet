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
  amount: number;
  timestamp: Date;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'lose' | 'referral';
  status: 'pending' | 'confirmed' | 'completed' | 'failed';
  // Other optional properties
  betId?: string;
  description?: string;
};

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
