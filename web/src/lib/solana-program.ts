/**
 * Constants and utilities for interacting with the SolBet Solana program
 */
import { PublicKey } from '@solana/web3.js';

// Default program ID used as fallback
const DEFAULT_PROGRAM_ID = '11111111111111111111111111111111';

// Get program ID from environment or use fallback
export const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || DEFAULT_PROGRAM_ID;

// Safely create PublicKey instance from string
export function getProgramId(): PublicKey {
  try {
    return new PublicKey(PROGRAM_ID);
  } catch (error) {
    console.warn(`Invalid program ID: ${PROGRAM_ID}. Using system program as fallback.`);
    return new PublicKey(DEFAULT_PROGRAM_ID);
  }
}

// The instruction indices for different program operations
export const INSTRUCTION_INDICES = {
  INITIALIZE_BET: 0,
  PLACE_BET: 1,
  RESOLVE_BET: 2,
  WITHDRAW_FUNDS: 3,
  CANCEL_BET: 4,
};

// Bet status enum values as they appear in the program
export const BET_STATUS = {
  ACTIVE: 0,
  CLOSED: 1,
  RESOLVED: 2,
  DISPUTED: 3,
};

// Bet outcome enum values as they appear in the program
export const BET_OUTCOME = {
  YES: 0,
  NO: 1,
};

// Helper function to decode bet status from program representation
export function decodeBetStatus(statusCode: number): string {
  const statusMap = ["active", "closed", "resolved", "disputed"];
  return statusMap[statusCode] || "unknown";
}
