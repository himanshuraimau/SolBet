import type { BetCategory, BetStatus } from '@/types/bet'
import type { TimeFrame } from '@/types/common'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

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

export async function fetchBets(category?: BetCategory, status?: BetStatus, page?: number) {
  const response = await fetch(`${API_URL}/bets?category=${category}&status=${status}&page=${page}`)
  if (!response.ok) {
    throw new Error('Failed to fetch bets')
  }
  return response.json()
}

export async function fetchBetById(betId: string) {
  const response = await fetch(`${API_URL}/bets/${betId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch bet')
  }
  return response.json()
}

export async function fetchUserBets(walletAddress: string) {
  const response = await fetch(`${API_URL}/user/${walletAddress}/bets`)
  if (!response.ok) {
    throw new Error('Failed to fetch user bets')
  }
  return response.json()
}

export async function fetchUserProfile(walletAddress: string) {
  const response = await fetch(`${API_URL}/user/${walletAddress}/profile`)
  if (!response.ok) {
    throw new Error('Failed to fetch user profile')
  }
  return response.json()
}

export async function fetchUserStats(walletAddress: string, timeFrame: TimeFrame) {
  const response = await fetch(`${API_URL}/user/${walletAddress}/stats?timeFrame=${timeFrame}`)
  if (!response.ok) {
    throw new Error('Failed to fetch user stats')
  }
  return response.json()
}

export async function fetchBetStatistics(walletAddress: string) {
  const response = await fetch(`${API_URL}/user/${walletAddress}/bet-stats`)
  if (!response.ok) {
    throw new Error('Failed to fetch bet statistics')
  }
  return response.json()
}