import { PublicKey } from '@solana/web3.js';
import { 
  BetOutcome, 
  BetState, 
  BetStatus, 
  UserBet,
  InitializeBetParams,
  PlaceBetParams,
  ResolveBetParams
} from '../types';
import { 
  generateMockPublicKey, 
  randomBigInt, 
  futureTimestamp, 
  pastTimestamp,
  randomBetOutcome,
  delay
} from './utils';
import { mockWallets } from './users';

// Constants for mock bets
const MIN_BET = BigInt(100_000_000); // 0.1 SOL in lamports
const MAX_BET = BigInt(10_000_000_000); // 10 SOL in lamports
const DEFAULT_ACTIVE_BETS_COUNT = 10;
const DEFAULT_RESOLVED_BETS_COUNT = 5;

/**
 * Generate a mock bet state
 * @param status Desired status for the bet
 */
export function generateMockBetState(status: BetStatus = BetStatus.Active): BetState {
  // Different data based on bet status
  let outcome: BetOutcome | null = null;
  let expiresAt: bigint;
  
  if (status === BetStatus.Active || status === BetStatus.Closed) {
    expiresAt = futureTimestamp(Math.floor(Math.random() * 7) + 1); // 1-7 days in future
  } else {
    expiresAt = pastTimestamp(Math.floor(Math.random() * 7) + 1); // 1-7 days ago
  }
  
  if (status === BetStatus.Resolved) {
    outcome = randomBetOutcome();
  }
  
  // Generate random pools with realistic data
  const yesPool = randomBigInt(MIN_BET, MAX_BET);
  const noPool = randomBigInt(MIN_BET, MAX_BET);
  
  return {
    creator: Object.values(mockWallets)[Math.floor(Math.random() * 5)],
    escrowAccount: generateMockPublicKey(),
    totalPool: yesPool + noPool,
    yesPool,
    noPool,
    expiresAt,
    status,
    outcome,
    minBetAmount: MIN_BET / BigInt(10),
    maxBetAmount: MAX_BET / BigInt(10),
    isInitialized: true
  };
}

/**
 * Generate a mock user bet
 * @param betAccount The bet account public key
 * @param userWallet The user's wallet public key
 */
export function generateMockUserBet(
  betAccount: PublicKey,
  userWallet: PublicKey = generateMockPublicKey()
): UserBet {
  return {
    user: userWallet,
    betAccount,
    amount: randomBigInt(MIN_BET / BigInt(10), MAX_BET / BigInt(10)),
    position: randomBetOutcome(),
    isClaimed: Math.random() > 0.7 // 30% chance of being claimed
  };
}

// Generate initial set of mock bets
function generateInitialMockBets(): {
  activeBets: Map<string, BetState>;
  userBets: Map<string, UserBet>;
} {
  const activeBets = new Map<string, BetState>();
  const userBets = new Map<string, UserBet>();
  
  // Generate active bets
  for (let i = 0; i < DEFAULT_ACTIVE_BETS_COUNT; i++) {
    const betPubkey = generateMockPublicKey();
    const betState = generateMockBetState(BetStatus.Active);
    activeBets.set(betPubkey.toString(), betState);
    
    // Generate 1-5 user bets for each bet
    const userBetCount = Math.floor(Math.random() * 5) + 1;
    for (let j = 0; j < userBetCount; j++) {
      const userWallet = Object.values(mockWallets)[Math.floor(Math.random() * 5)];
      const userBetPubkey = generateMockPublicKey();
      const userBet = generateMockUserBet(betPubkey, userWallet);
      userBets.set(userBetPubkey.toString(), userBet);
    }
  }
  
  // Generate resolved bets
  for (let i = 0; i < DEFAULT_RESOLVED_BETS_COUNT; i++) {
    const betPubkey = generateMockPublicKey();
    const betState = generateMockBetState(BetStatus.Resolved);
    activeBets.set(betPubkey.toString(), betState);
    
    // Generate 1-10 user bets for each resolved bet
    const userBetCount = Math.floor(Math.random() * 10) + 1;
    for (let j = 0; j < userBetCount; j++) {
      const userWallet = Object.values(mockWallets)[Math.floor(Math.random() * 5)];
      const userBetPubkey = generateMockPublicKey();
      const userBet = generateMockUserBet(betPubkey, userWallet);
      // For resolved bets, set isClaimed to a higher probability
      userBet.isClaimed = Math.random() > 0.3; // 70% chance of being claimed
      userBets.set(userBetPubkey.toString(), userBet);
    }
  }
  
  return { activeBets, userBets };
}

// Initialize our mock storage
const mockData = generateInitialMockBets();
export const mockBets = mockData.activeBets;
export const mockUserBets = mockData.userBets;

/**
 * Get mock bet by public key
 * @param pubkey The bet account public key
 */
export async function getMockBet(pubkey: string | PublicKey): Promise<BetState | null> {
  // Simulate network delay
  await delay(300);
  
  const key = pubkey.toString();
  return mockBets.get(key) || null;
}

/**
 * Get mock user bet by public key
 * @param pubkey The user bet account public key
 */
export async function getMockUserBet(pubkey: string | PublicKey): Promise<UserBet | null> {
  // Simulate network delay
  await delay(200);
  
  const key = pubkey.toString();
  return mockUserBets.get(key) || null;
}

/**
 * Get all user bets for a specific wallet
 * @param walletPubkey The user wallet public key
 */
export async function getMockUserBets(walletPubkey: string | PublicKey): Promise<UserBet[]> {
  // Simulate network delay
  await delay(500);
  
  const wallet = walletPubkey.toString();
  
  return Array.from(mockUserBets.values()).filter(
    userBet => userBet.user.toString() === wallet
  );
}

/**
 * Create a new mock bet
 * @param creator Creator's wallet public key
 * @param params Bet parameters
 */
export async function createMockBet(
  creator: PublicKey,
  params: InitializeBetParams
): Promise<string> {
  // Simulate network delay
  await delay(1000);
  
  const betPubkey = generateMockPublicKey();
  const escrowPubkey = generateMockPublicKey();
  
  const newBet: BetState = {
    creator,
    escrowAccount: escrowPubkey,
    totalPool: BigInt(0),
    yesPool: BigInt(0),
    noPool: BigInt(0),
    expiresAt: BigInt(params.expiresAt),
    status: BetStatus.Active,
    outcome: null,
    minBetAmount: params.minBet,
    maxBetAmount: params.maxBet,
    isInitialized: true
  };
  
  mockBets.set(betPubkey.toString(), newBet);
  
  return betPubkey.toString();
}

/**
 * Place a mock bet
 * @param betPubkey Bet account public key
 * @param userWallet User's wallet public key
 * @param params Bet parameters
 */
export async function placeMockBet(
  betPubkey: string | PublicKey,
  userWallet: PublicKey,
  params: PlaceBetParams
): Promise<string> {
  // Simulate network delay
  await delay(800);
  
  const betKey = betPubkey.toString();
  const bet = mockBets.get(betKey);
  
  if (!bet) {
    throw new Error('Bet not found');
  }
  
  if (bet.status !== BetStatus.Active) {
    throw new Error('Bet is not active');
  }
  
  // Check bet limits
  if (params.amount < bet.minBetAmount || params.amount > bet.maxBetAmount) {
    throw new Error('Bet amount outside limits');
  }
  
  // Update pool amounts
  if (params.position === BetOutcome.Yes) {
    bet.yesPool += params.amount;
  } else {
    bet.noPool += params.amount;
  }
  bet.totalPool += params.amount;
  
  // Create user bet
  const userBetPubkey = generateMockPublicKey();
  const userBet: UserBet = {
    user: userWallet,
    betAccount: new PublicKey(betKey),
    amount: params.amount,
    position: params.position,
    isClaimed: false
  };
  
  mockUserBets.set(userBetPubkey.toString(), userBet);
  
  return userBetPubkey.toString();
}

/**
 * Resolve a mock bet
 * @param betPubkey Bet account public key
 * @param creatorWallet Creator's wallet public key
 * @param params Resolution parameters
 */
export async function resolveMockBet(
  betPubkey: string | PublicKey,
  creatorWallet: PublicKey,
  params: ResolveBetParams
): Promise<boolean> {
  // Simulate network delay
  await delay(1200);
  
  const betKey = betPubkey.toString();
  const bet = mockBets.get(betKey);
  
  if (!bet) {
    throw new Error('Bet not found');
  }
  
  if (bet.creator.toString() !== creatorWallet.toString()) {
    throw new Error('Not authorized');
  }
  
  if (bet.status === BetStatus.Resolved) {
    throw new Error('Bet already resolved');
  }
  
  // Update bet status
  bet.status = BetStatus.Resolved;
  bet.outcome = params.outcome;
  
  return true;
}

/**
 * Withdraw from a mock bet
 * @param userBetPubkey User bet account public key
 * @param userWallet User's wallet public key
 */
export async function withdrawFromMockBet(
  userBetPubkey: string | PublicKey,
  userWallet: PublicKey
): Promise<boolean> {
  // Simulate network delay
  await delay(900);
  
  const userBetKey = userBetPubkey.toString();
  const userBet = mockUserBets.get(userBetKey);
  
  if (!userBet) {
    throw new Error('User bet not found');
  }
  
  if (userBet.user.toString() !== userWallet.toString()) {
    throw new Error('Not authorized');
  }
  
  if (userBet.isClaimed) {
    throw new Error('Already claimed');
  }
  
  // Get the bet
  const bet = mockBets.get(userBet.betAccount.toString());
  if (!bet) {
    throw new Error('Associated bet not found');
  }
  
  // Can only claim if bet is resolved or expired
  if (bet.status !== BetStatus.Resolved) {
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (now <= bet.expiresAt) {
      throw new Error('Bet not resolved or expired');
    }
  }
  
  // Mark as claimed
  userBet.isClaimed = true;
  
  return true;
}

/**
 * Featured bets to display on the homepage
 */
export const featuredBets = [
  {
    id: '1',
    title: 'Will Bitcoin reach $100k by end of year?',
    description: 'Bitcoin price must reach or exceed $100,000 USD on any major exchange before December 31st, 23:59:59 UTC.',
    yesPool: 3.75,
    noPool: 2.25,
    creator: mockWallets.alice,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
    status: 'ACTIVE'
  },
  {
    id: '2',
    title: 'Will ETH 2.0, Layer 2 Scaling, or Sharding merge before October?',
    description: 'Ethereum must officially announce and implement either ETH 2.0 phase 1, functional Layer 2 scaling, or sharding before October 1st.',
    yesPool: 5.2,
    noPool: 4.8,
    creator: mockWallets.bob,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // 60 days from now
    status: 'ACTIVE'
  },
  {
    id: '3',
    title: 'Will Solana maintain 99.9% uptime for the next month?',
    description: 'Solana mainnet must maintain at least 99.9% uptime with no major outages reported by the Solana Foundation for 30 consecutive days.',
    yesPool: 6.1,
    noPool: 1.9,
    creator: mockWallets.charlie,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
    status: 'ACTIVE'
  },
  {
    id: '4',
    title: 'Will any central bank launch a CBDC this year?',
    description: 'Any central bank must officially launch a Central Bank Digital Currency (CBDC) for public use before December 31st.',
    yesPool: 2.4,
    noPool: 3.6,
    creator: mockWallets.dave,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days from now
    status: 'ACTIVE'
  }
];

// Export for API route handlers
export function generateUserBetsResponse(userAddress: string) {
  const active = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
    id: `bet_${Math.random().toString(36).substr(2, 9)}`,
    title: getRandomBetTitle(),
    description: "A mock bet description for testing purposes",
    amount: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
    position: Math.random() > 0.5 ? "YES" : "NO",
    expiresAt: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  const created = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
    id: `bet_${Math.random().toString(36).substr(2, 9)}`,
    title: getRandomBetTitle(),
    description: "A bet created by this user",
    amount: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
    expiresAt: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  const participated = Array.from({ length: Math.floor(Math.random() * 4) + 2 }, () => ({
    id: `bet_${Math.random().toString(36).substr(2, 9)}`,
    title: getRandomBetTitle(),
    description: "A bet this user participated in",
    amount: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
    position: Math.random() > 0.5 ? "YES" : "NO",
    expiresAt: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  const resolved = Array.from({ length: Math.floor(Math.random() * 6) + 2 }, () => {
    const isWin = Math.random() > 0.4;
    return {
      id: `bet_${Math.random().toString(36).substr(2, 9)}`,
      title: getRandomBetTitle(),
      description: "A resolved bet",
      amount: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
      position: Math.random() > 0.5 ? "YES" : "NO",
      outcome: Math.random() > 0.5 ? "YES" : "NO",
      payout: isWin ? parseFloat((Math.random() * 3 + 0.5).toFixed(2)) : 0,
      expiresAt: new Date(Date.now() - (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
      status: "resolved",
      createdAt: new Date(Date.now() - (Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
  
  return { active, created, participated, resolved };
}

// Helper function to generate random bet titles
function getRandomBetTitle() {
  const titles = [
    "Will BTC reach $100K by the end of 2025?",
    "Will Ethereum 2.0 fully launch this year?",
    "Will Solana reach 100K TPS?",
    "Will Apple release a foldable iPhone?",
    "Will the EU pass major crypto regulation?",
    "Will the US have a CBDC by 2026?",
    "Will NFT trading volume exceed $10B?",
    "Will Tesla accept BTC again?",
    "Will El Salvador remain Bitcoin legal tender?",
    "Will a country adopt Solana as legal tender?",
    "Will ChatGPT-5 be released this year?",
    "Will Metaverse land sales top $1B?",
    "Will Cardano smart contracts gain traction?",
    "Will the US approve a spot Bitcoin ETF?",
    "Will a DAO buy a major sports team?"
  ];
  
  return titles[Math.floor(Math.random() * titles.length)];
}
