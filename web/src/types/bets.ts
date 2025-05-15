import { PublicKey } from '@solana/web3.js';

/**
 * Bet outcome enum (matches the Rust contract enum)
 */
export enum BetOutcome {
  Yes = 0,
  No = 1
}

/**
 * Bet status enum (matches the Rust contract enum)
 */
export enum BetStatus {
  Active = 0,
  Closed = 1,
  Resolved = 2,
  Disputed = 3
}

/**
 * Bet state interface (matches the Rust contract struct)
 */
export interface BetState {
  creator: PublicKey;
  escrowAccount: PublicKey;
  totalPool: bigint;
  yesPool: bigint;
  noPool: bigint;
  expiresAt: bigint;
  status: BetStatus;
  outcome: BetOutcome | null;
  minBetAmount: bigint;
  maxBetAmount: bigint;
  isInitialized: boolean;
}
