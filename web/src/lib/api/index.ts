/**
 * API module provides centralized functions for all API interactions.
 * Organizes API calls by domain (bets, users, wallet, community).
 */

import { BetCategory, BetStatus } from "@/types/bet";
import { TimeFrame } from "@/types/common";
import { showErrorToast } from "@/lib/error-handling";
import {
  fetchUserProfile as getUserProfile,
  updateProfile as updateUserProfile,
  verifyWalletSignature,
  fetchWalletActivity
} from "./user";

// -------------------------------------------------------
// Bets API
// -------------------------------------------------------

/**
 * Fetch a list of bets from the API with optional filtering
 * @param category Optional category filter
 * @param status Optional status filter
 * @param page Page number (default: 1)
 * @param limit Number of bets per page (default: 10)
 */
export const fetchBets = async (category?: BetCategory, status?: BetStatus, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await fetch(`/api/bets?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch bets");
    }
    return response.json();
  } catch (error) {
    showErrorToast(error);
    throw error;
  }
}

/**
 * Fetch a single bet by ID
 * @param id The bet ID
 */
export const fetchBetById = async (id: string) => {
  try {
    const response = await fetch(`/api/bets/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch bet");
    }
    return response.json();
  } catch (error) {
    showErrorToast(error);
    throw error;
  }
}

/**
 * Create a new bet
 * @param params Bet creation parameters
 */
export const createBet = async (params: {
  title: string;
  description: string;
  category: BetCategory;
  minimumBet: number;
  maximumBet: number;
  endTime: Date;
  creator: string;
}) => {
  const response = await fetch("/api/bets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to create bet");
  }

  return response.json();
};

/**
 * Place a bet on an existing bet
 * @param betId ID of the bet
 * @param position Yes/No position
 * @param amount Amount to bet
 * @param walletAddress User's wallet address
 */
export const placeBet = async (
  betId: string,
  position: "yes" | "no",
  amount: number,
  walletAddress: string
) => {
  const response = await fetch(`/api/bets/${betId}/place`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ position, amount, walletAddress }),
  });

  if (!response.ok) {
    throw new Error("Failed to place bet");
  }

  return response.json();
};

/**
 * Fetch bet statistics
 * @param address User's wallet address
 */
export const fetchBetStatistics = async (address: string) => {
  const response = await fetch(`/api/bets/statistics?address=${address}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch bet statistics");
  }
  return response.json();
};

// -------------------------------------------------------
// User API
// -------------------------------------------------------

/**
 * Fetch user profile data from the API
 * @param walletAddress The wallet address to fetch profile for
 */
export const fetchUserProfile = getUserProfile;

/**
 * Update user profile data
 * @param address User's wallet address
 * @param profileData Profile data to update
 */
export const updateProfile = updateUserProfile;

/**
 * Fetch user statistics for a specific time frame
 * @param walletAddress User's wallet address
 * @param timeFrame Time period for statistics
 */
export const fetchUserStats = async (walletAddress: string, timeFrame: TimeFrame) => {
  const response = await fetch(`/api/users/stats?address=${walletAddress}&timeFrame=${timeFrame}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch user stats");
  }
  return response.json();
};

/**
 * Fetch user bets grouped by status
 * @param walletAddress User's wallet address
 */
export const fetchUserBets = async (walletAddress: string) => {
  const response = await fetch(`/api/users/bets?address=${walletAddress}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user bets");
  }
  return response.json();
};

/**
 * Fetch user activity
 * @param walletAddress User's wallet address
 * @param limit Number of items to return
 */
export const fetchUserActivity = async (walletAddress: string, limit: number = 5) => {
  const response = await fetch(`/api/users/activity?address=${walletAddress}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user activity");
  }
  return response.json();
};

/**
 * Fetch user transactions
 * @param walletAddress User's wallet address
 */
export const fetchUserTransactions = async (walletAddress: string) => {
  const response = await fetch(`/api/users/transactions?address=${walletAddress}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user transactions");
  }
  return response.json();
};

export { verifyWalletSignature, fetchWalletActivity };

// -------------------------------------------------------
// Wallet API
// -------------------------------------------------------

/**
 * Fetch wallet transactions
 * @param walletAddress User's wallet address
 */
export const fetchWalletTransactions = async (walletAddress: string) => {
  const response = await fetch(`/api/wallet/transactions?address=${walletAddress}`);
  if (!response.ok) {
    throw new Error("Failed to fetch wallet transactions");
  }
  return response.json();
};

// -------------------------------------------------------
// Community API
// -------------------------------------------------------

/**
 * Fetch community activity feed
 */
export const fetchCommunityActivity = async () => {
  const response = await fetch("/api/community/activity");
  if (!response.ok) {
    throw new Error("Failed to fetch community activity");
  }
  return response.json();
};

/**
 * Fetch leaderboard data
 * @param period Time period for leaderboard
 */
export const fetchLeaderboard = async (period: string) => {
  const response = await fetch(`/api/community/leaderboard?period=${period}`);
  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }
  return response.json();
};
