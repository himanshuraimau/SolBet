import { PublicKey } from '@solana/web3.js';
import { User } from '../types';
import { generateMockPublicKey } from './utils';

/**
 * Mock user wallets - constant PublicKeys that can be referenced in tests
 */
export const mockWallets = {
  alice: new PublicKey('HXtBm8XZbxaTt41uqaKhwUAa6Z1aPyvJdsZVENiWsetg'),
  bob: new PublicKey('BobXxX4u8UaVALcf1p8R1PmcjiatHWtdYvAGh56HCoP2'),
  charlie: new PublicKey('Char1ieXqZAcURD98MUqmXBxHh1XnBUpEcpP6TK1YDk'),
  dave: new PublicKey('DavEEEscXpMJEmji7v9N6bPBgAWTmNg6UHbrbYYKKF2'),
  eve: new PublicKey('EvEZjsjXtUKW43rKj9vM5UKqNKNL3qZE1VGTmrHTof7A'),
};

/**
 * Generate a list of mock users
 * @param count Number of users to generate
 */
export function generateMockUsers(count: number): User[] {
  const users: User[] = [];
  
  // Add our static users first
  Object.values(mockWallets).slice(0, Math.min(count, 5)).forEach(wallet => {
    users.push({
      walletAddress: wallet,
      activeBets: Array(Math.floor(Math.random() * 5))
        .fill(0)
        .map(() => generateMockPublicKey()),
    });
  });
  
  // Add random users if needed
  for (let i = users.length; i < count; i++) {
    users.push({
      walletAddress: generateMockPublicKey(),
      activeBets: Array(Math.floor(Math.random() * 5))
        .fill(0)
        .map(() => generateMockPublicKey()),
    });
  }
  
  return users;
}

// Generate 10 mock users for immediate use
export const mockUsers = generateMockUsers(10);

/**
 * Get a user by wallet address
 * @param address Wallet address to look up
 */
export function getMockUserByAddress(address: PublicKey): User | undefined {
  return mockUsers.find(
    user => user.walletAddress.toString() === address.toString()
  );
}
