/**
 * SolBet program ID on Solana
 */
export const SOLBET_PROGRAM_ID = '6snPVDtvkAhKNvvZgYatps49shedjmTSVvcvaGBoBf5w';

/**
 * Seeds for PDAs (Program Derived Addresses)
 * These match the seeds used in the smart contract
 */
export const ESCROW_SEED = 'escrow';
export const USER_BET_SEED = 'user-bet';

/**
 * Space calculation for account creation
 * Using the exact values from the Rust calculate_space functions
 */
export const BET_STATE_SPACE = 140; // Based on the Rust BetState.calculate_space function
export const USER_BET_SPACE = 90;   // Based on the Rust UserBet.calculate_space function
