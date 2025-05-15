import { PublicKey } from '@solana/web3.js';
import { BetOutcome } from './bets';

/**
 * User account structure (matches the Rust contract struct)
 */
export interface User {
  walletAddress: PublicKey;
  activeBets: PublicKey[];
}

/**
 * UserBet structure (matches the Rust contract struct)
 */
export interface UserBet {
  user: PublicKey;
  betAccount: PublicKey;
  amount: bigint;
  position: BetOutcome;
  isClaimed: boolean;
}

/**
 * Database User model (matches the Prisma schema)
 */
export interface DBUser {
  id: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}
