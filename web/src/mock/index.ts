/**
 * Mock data exports for SolBet development
 * 
 * These mocks simulate the data and functionality of the Solana blockchain
 * without requiring an actual connection to the blockchain.
 */

// Export all mock data and functions
export * from './utils';
export * from './users';
export * from './bets';

// Example usage:
/*
import { 
  mockWallets,
  getMockBet,
  getMockUserBets,
  createMockBet,
  placeMockBet,
  resolveMockBet,
  withdrawFromMockBet
} from '../mock';

// Get a wallet for testing
const wallet = mockWallets.alice;

// Create a new bet
const betParams = {
  expiresAt: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
  minBet: BigInt(100_000_000), // 0.1 SOL
  maxBet: BigInt(1_000_000_000), // 1 SOL
};

async function example() {
  // Create a bet
  const betPubkey = await createMockBet(wallet, betParams);
  
  // Place a bet
  const userBetPubkey = await placeMockBet(
    betPubkey,
    mockWallets.bob,
    { amount: BigInt(500_000_000), position: BetOutcome.Yes }
  );
  
  // Get bet data
  const betData = await getMockBet(betPubkey);
  
  // Resolve the bet
  await resolveMockBet(
    betPubkey,
    wallet, // must be the creator
    { outcome: BetOutcome.Yes }
  );
  
  // User claims their winnings
  await withdrawFromMockBet(userBetPubkey, mockWallets.bob);
}
*/
