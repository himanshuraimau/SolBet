import { PublicKey } from '@solana/web3.js';
import { BetOutcome, BetStatus } from '../types';

/**
 * Generates a random PublicKey for mock data
 */
export function generateMockPublicKey(): PublicKey {
  // Generate a random 32-byte array
  const bytes = Array(32).fill(0).map(() => Math.floor(Math.random() * 256));
  return new PublicKey(bytes);
}

/**
 * Simulates a network delay
 * @param ms Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random bigint within a range
 * @param min Minimum value
 * @param max Maximum value
 */
export function randomBigInt(min: bigint, max: bigint): bigint {
  const range = max - min;
  const bits = range.toString(2).length;
  let result: bigint;
  
  do {
    // Generate random BigInt with the required number of bits
    result = BigInt(Math.floor(Math.random() * Number(range)));
  } while (result > range);
  
  return min + result;
}

/**
 * Generates a future timestamp (in seconds)
 * @param daysFromNow Number of days from now
 */
export function futureTimestamp(daysFromNow: number): bigint {
  const now = new Date();
  const future = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  return BigInt(Math.floor(future.getTime() / 1000));
}

/**
 * Generates a past timestamp (in seconds)
 * @param daysAgo Number of days ago
 */
export function pastTimestamp(daysAgo: number): bigint {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return BigInt(Math.floor(past.getTime() / 1000));
}

/**
 * Returns a random bet outcome
 */
export function randomBetOutcome(): BetOutcome {
  return Math.random() > 0.5 ? BetOutcome.Yes : BetOutcome.No;
}

/**
 * Returns a random bet status
 */
export function randomBetStatus(): BetStatus {
  const statuses = [
    BetStatus.Active,
    BetStatus.Closed,
    BetStatus.Resolved,
    BetStatus.Disputed
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
}
