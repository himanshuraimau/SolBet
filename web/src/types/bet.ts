export type BetStatus = "ACTIVE" | "PENDING" | "RESOLVED" | "EXPIRED" | "CANCELLED";

export type BetCategory = "SPORTS" | "POLITICS" | "CRYPTO" | "ENTERTAINMENT" | "OTHER";

export interface Bet {
  id: string;
  title: string;
  description: string;
  category: BetCategory;
  creator: string;
  yesPool: number;
  noPool: number;
  totalPool: number;
  createdAt: string;
  expiresAt: string;
  status: BetStatus;
  outcome?: "yes" | "no";
  participants: BetParticipant[];
  minBet?: number;
  maxBet?: number;
}

export interface BetParticipant {
  walletAddress: string;
  position: "yes" | "no";
  amount: number;
  timestamp: Date;
}

export interface CreateBetParams {
  title: string;
  description: string;
  category: BetCategory;
  expiresAt: Date;
  walletAddress: string;
  minBet?: number;
  maxBet?: number;
}

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BetsResponse {
  bets: Bet[]
  pagination: PaginationInfo
}

export type BetTab = 'all' | 'trending' | 'ending-soon' | 'my-bets'
