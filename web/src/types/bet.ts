import { PublicKey } from '@solana/web3.js';

// Component-specific bet types

export type BetCategory = 
  | 'crypto' 
  | 'sports' 
  | 'politics' 
  | 'entertainment' 
  | 'tech' 
  | 'other'
  | string; // Add string to make compatible with mock adapters

export type BetStatusType = 
  | 'active' 
  | 'closed' 
  | 'resolved_yes' 
  | 'resolved_no' 
  | 'disputed'
  | string; // Make status compatible with string values from mocks

export type BetOutcomeType = 'yes' | 'no' | string; // Add string for flexibility

/**
 * Available tab options for filtering bets
 */
export type BetTab = 'all' | 'trending' | 'ending-soon' | 'my-bets';

/**
 * Available positions a user can take on a bet
 */
export type BetPosition = 'yes' | 'no';

/**
 * Enum representing bet outcomes
 */
export enum BetOutcome {
  Yes = 0,
  No = 1,
}

/**
 * Basic parameters for a bet operation
 */
export interface BetParams {
  betAccount: string;
  escrowAccount: string;
}

/**
 * Parameters for settling a bet
 */
export interface SettleBetParams extends BetParams {
  outcome: BetPosition;
}

/**
 * Parameters for withdrawing from a bet
 */
export interface WithdrawParams extends BetParams {
  userBetAccount: string;
}

// Component props interfaces
export interface WithdrawFundsFormProps {
  bet: Bet;
  userBetAccount?: string;
  canWithdraw: boolean;
  hasUserParticipated: boolean;
}

export interface BetCardProps {
  bet: Bet;
}

export interface PlaceBetFormProps {
  bet: Bet | any; // Using any for now to accommodate different bet types 
}

export interface ParticipantsListProps {
  participants: Participant[];
}

export interface ResolveBetFormProps {
  bet: Bet;
  isCreator: boolean;
}

export interface BetDetailsProps {
  bet: Bet | any; // Using any for now to accommodate different bet types
}

export interface BetFilterProps {
  searchValue: string;
  category: string;
  onSearch: (search: string) => void;
  onCategoryChange: (category: string) => void;
}

export interface BetPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export interface Bet {
  id: string;
  title: string;
  description: string;
  creatorAddress: string;
  betPublicKey: string;
  escrowAccount: string;
  category: string;
  status: string;
  outcome?: string | null;
  yesPool: number;
  noPool: number;
  totalPool: number;
  minimumBet: number;
  maximumBet: number;
  daysLeft: number;
  expiresAt: string;
  endTime: Date;
  startTime: Date;
  participants: BetParticipant[];
}

export interface BetParticipant {
  walletAddress: string;
  position: "yes" | "no";  // Changed from string to literal union
  amount: number;
  timestamp: Date;
  onChainUserBetAccount?: string;
}

export interface BetQueryParams {
  tab?: BetTab;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface UserBet {
  id: string;
  betId: string;
  user: PublicKey;
  amount: number;
  position: 'yes' | 'no';
  timestamp: Date;
  claimed: boolean;
  outcome?: 'yes' | 'no';
}

export interface Participant {
  walletAddress: string;
  position: 'yes' | 'no';
  amount: number;
  timestamp: Date;
  // Add missing property
  onChainUserBetAccount?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Represents request parameters for creating a new bet
 */
export interface CreateBetRequest {
  title: string;
  description: string;
  category: string;
  minimumBet: number;
  maximumBet: number;
  endTime: Date;
}

/**
 * Constants for bet-related operations
 */
export const USER_BET_SEED = "user-bet";
export const ESCROW_SEED = "escrow";
export const BET_STATE_SPACE = 128; // Example size, adjust as needed
export const USER_BET_SPACE = 64;   // Example size, adjust as needed

/**
 * Enum for bet instruction types
 */
export enum BetInstructionType {
  InitializeBet = 0,
  PlaceBet = 1,
  ResolveBet = 2,
  WithdrawExpired = 3,
}

/**
 * Bet status enum
 */
export enum BetStatus {
  Active = 'ACTIVE',
  Closed = 'CLOSED',
  ResolvedYes = 'RESOLVED_YES',
  ResolvedNo = 'RESOLVED_NO',
  Expired = 'EXPIRED'
}

/**
 * Parameters for initializing a bet
 */
export interface InitializeBetParams {
  expiresAt: number;
  minBet: bigint;
  maxBet: bigint;
}

/**
 * Parameters for placing a bet
 */
export interface PlaceBetParams {
  amount: bigint;
  position: BetOutcome;
}

/**
 * Parameters for resolving a bet
 */
export interface ResolveBetParams {
  outcome: BetOutcome;
}

/**
 * Structure of a bet state on-chain
 */
export interface BetState {
  creator: string;
  escrowAccount: string;
  expiresAt: number;
  yesPool: bigint;
  noPool: bigint;
  status: BetStatus;
  outcome: BetOutcome | null;
  minBetAmount: bigint;
  maxBetAmount: bigint;
}

/**
 * Structure of a user bet on-chain
 */
export interface OnChainUserBet {
  betAccount: string;
  user: PublicKey;
  amount: bigint;
  position: BetOutcome;
  withdrawn: boolean;
}
