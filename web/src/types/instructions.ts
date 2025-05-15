import { BetOutcome } from './bets';

/**
 * Instructions supported by the SolBet program
 */
export enum BetInstructionType {
  InitializeBet = 0,
  PlaceBet = 1,
  ResolveBet = 2,
  WithdrawExpired = 3
}

/**
 * Parameters for InitializeBet instruction
 */
export interface InitializeBetParams {
  expiresAt: number; // Unix timestamp (i64 in Rust)
  minBet: bigint;    // u64 in Rust
  maxBet: bigint;    // u64 in Rust
}

/**
 * Parameters for PlaceBet instruction
 */
export interface PlaceBetParams {
  amount: bigint;    // u64 in Rust
  position: BetOutcome;
}

/**
 * Parameters for ResolveBet instruction
 */
export interface ResolveBetParams {
  outcome: BetOutcome;
}

// WithdrawExpired has no parameters
