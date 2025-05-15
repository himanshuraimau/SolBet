import { PublicKey } from '@solana/web3.js';
import { BetOutcome, BetState, BetStatus, UserBet } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { generateMockPublicKey } from './utils';

// Types used in components that we need to adapt to
export interface Bet {
  id: string;
  title: string;
  description?: string;
  creator: string;
  category: string;
  status: string;
  yesPool: number;
  noPool: number;
  totalPool?: number;
  minBet?: number;
  maxBet?: number;
  daysLeft?: number;
  expiresAt: Date | string;
  endTime: Date | string;
  startTime: Date | string;
  participants: Participant[];
  minimumBet: number;
  maximumBet: number;
}

export interface Participant {
  walletAddress: string;
  position: 'yes' | 'no';
  amount: number;
  timestamp: Date;
  onChainUserBetAccount?: string; // Add missing property
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

// Convert BetState to Bet
export function convertBetStateToComponentBet(
  betState: BetState, 
  betPubkey: string,
  userBets: UserBet[] = []
): Bet {
  const expiresAt = new Date(Number(betState.expiresAt) * 1000);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const participants: Participant[] = userBets.map(userBet => ({
    walletAddress: userBet.user.toString(),
    position: userBet.position === BetOutcome.Yes ? 'yes' : 'no',
    amount: Number(userBet.amount) / 1_000_000_000, // Convert lamports to SOL
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)), // Random date in the last week
    onChainUserBetAccount: generateMockPublicKey().toString() // Add mock on-chain account ID
  }));

  return {
    id: betPubkey,
    title: `Mock Bet #${betPubkey.substring(0, 6)}`,
    description: "This is a mock bet generated for development purposes.",
    creator: betState.creator.toString(),
    category: getRandomCategory(),
    status: getBetStatusString(betState.status, betState.outcome),
    yesPool: Number(betState.yesPool) / 1_000_000_000, // Convert to SOL
    noPool: Number(betState.noPool) / 1_000_000_000, // Convert to SOL
    totalPool: Number(betState.totalPool) / 1_000_000_000, // Convert to SOL
    minBet: Number(betState.minBetAmount) / 1_000_000_000, // Convert to SOL
    maxBet: Number(betState.maxBetAmount) / 1_000_000_000, // Convert to SOL
    daysLeft,
    expiresAt,
    endTime: expiresAt,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * Math.floor(Math.random() * 14)), // Random date in the last 2 weeks
    participants,
    minimumBet: Number(betState.minBetAmount) / 1_000_000_000,
    maximumBet: Number(betState.maxBetAmount) / 1_000_000_000
  };
}

// Utility functions
function getRandomCategory(): string {
  const categories = ['crypto', 'sports', 'politics', 'entertainment', 'science', 'tech'];
  return categories[Math.floor(Math.random() * categories.length)];
}

function getBetStatusString(status: BetStatus, outcome: BetOutcome | null): string {
  switch (status) {
    case BetStatus.Active:
      return 'active';
    case BetStatus.Closed:
      return 'closed';
    case BetStatus.Resolved:
      return outcome === BetOutcome.Yes ? 'resolved_yes' : 'resolved_no';
    case BetStatus.Disputed:
      return 'disputed';
    default:
      return 'active';
  }
}
