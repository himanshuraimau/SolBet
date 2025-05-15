import type { BetCategory, BetStatus } from '@/types/bet'
import type { TimeFrame } from '@/types/common'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

/**
 * Cancel a bet
 * Only the creator of a bet can cancel it if no bets have been placed
 * @param betId ID of the bet to cancel
 * @param walletAddress Wallet address of the user (must be creator)
 * @returns The cancelled bet data
 */
export async function cancelBet(betId: string, walletAddress: string) {
  const response = await fetch(`${API_URL}/bets/${betId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to cancel bet');
  }

  return response.json();
}

/**
 * Fetch a list of bets with optional filtering
 */
export async function fetchBets(category?: BetCategory, status?: BetStatus, page?: number) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (status) params.append("status", status);
  if (page) params.append("page", page.toString());
  
  const response = await fetch(`${API_URL}/bets?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bets');
  }
  return response.json();
}

/**
 * Fetch a specific bet by ID
 */
export async function fetchBetById(betId: string) {
  const response = await fetch(`${API_URL}/bets/${betId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bet');
  }
  return response.json();
}

/**
 * Fetch all bets for a user (created, participated, etc.)
 */
export async function fetchUserBets(walletAddress: string) {
  const response = await fetch(`${API_URL}/users/bets?address=${walletAddress}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user bets');
  }
  return response.json();
}

/**
 * Fetch user profile information
 */
export async function fetchUserProfile(walletAddress: string) {
  const response = await fetch(`${API_URL}/users/profile?address=${walletAddress}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
}

/**
 * Fetch user statistics over a specific time frame
 */
export async function fetchUserStats(walletAddress: string, timeFrame: TimeFrame) {
  const response = await fetch(`${API_URL}/users/stats?address=${walletAddress}&timeFrame=${timeFrame}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user stats');
  }
  return response.json();
}

/**
 * Fetch bet statistics for a user (yes/no distribution)
 */
export async function fetchBetStatistics(walletAddress: string) {
  const response = await fetch(`${API_URL}/bets/statistics?address=${walletAddress}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bet statistics');
  }
  return response.json();
}

/**
 * Fetch user's activity feed
 */
export async function fetchUserActivity(walletAddress: string, limit: number = 5) {
  const response = await fetch(`${API_URL}/users/activity?address=${walletAddress}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user activity');
  }
  return response.json();
}

/**
 * Fetch user's transactions
 */
export async function fetchUserTransactions(walletAddress: string) {
  const response = await fetch(`${API_URL}/users/transactions?address=${walletAddress}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user transactions');
  }
  return response.json();
}

/**
 * Fetch community activity feed
 */
export async function fetchCommunityActivity() {
  const response = await fetch(`${API_URL}/community/activity`);
  if (!response.ok) {
    throw new Error('Failed to fetch community activity');
  }
  return response.json();
}

/**
 * Fetch the community leaderboard
 */
export async function fetchLeaderboard(period: string = 'weekly') {
  const response = await fetch(`${API_URL}/community/leaderboard?period=${period}`);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  return response.json();
}

/**
 * Connect wallet to the system
 */
export async function connectWallet(walletAddress: string) {
  const response = await fetch(`${API_URL}/auth/wallet/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to connect wallet');
  }
  
  return response.json();
}

/**
 * Place a bet
 */
export async function placeBet(walletAddress: string, betId: string, position: 'yes' | 'no', amount: number, onChainTxId?: string) {
  const response = await fetch(`${API_URL}/bets/place`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      betId,
      position,
      amount,
      onChainTxId,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to place bet');
  }
  
  return response.json();
}
