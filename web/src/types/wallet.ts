/**
 * Transaction types supported by the wallet
 */
export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'winnings';

/**
 * Structure for wallet transactions
 */
export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'failed';
  description?: string;
}

/**
 * User profile data structure
 */
export interface UserProfile {
  displayName?: string;
  avatar?: string;
  email?: string;
  bio?: string;
  walletAddress?: string;
  joinedDate?: Date;
}

/**
 * Wallet authentication payload structure
 */
export interface WalletSignaturePayload {
  walletAddress: string;
  signature: string;
  message: string;
  timestamp?: number;
}
