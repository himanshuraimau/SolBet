import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Standard error responses for API routes
 */
export const ApiError = {
  badRequest: (message = "Bad request") => 
    NextResponse.json({ error: message }, { status: 400 }),
  
  notFound: (message = "Resource not found") => 
    NextResponse.json({ error: message }, { status: 404 }),
  
  unauthorized: (message = "Unauthorized") => 
    NextResponse.json({ error: message }, { status: 401 }),
  
  forbidden: (message = "Forbidden") => 
    NextResponse.json({ error: message }, { status: 403 }),
  
  serverError: (message = "Internal server error") => 
    NextResponse.json({ error: message }, { status: 500 })
};

/**
 * Find a user by wallet address
 */
export async function getUserByWalletAddress(walletAddress: string) {
  if (!walletAddress) return null;
  
  return prisma.user.findUnique({
    where: { walletAddress }
  });
}

/**
 * Validate that a user exists by wallet address
 * Returns the user or throws an error response
 */
export async function validateUserByWalletAddress(walletAddress: string) {
  if (!walletAddress) {
    throw ApiError.badRequest("Wallet address is required");
  }
  
  const user = await getUserByWalletAddress(walletAddress);
  
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  
  return user;
}

/**
 * Get a period start date based on a time frame
 */
export function getPeriodStartDate(period: string, accountCreationDate?: Date): Date {
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case "1d":
    case "daily":
      startDate.setDate(now.getDate() - 1);
      break;
    case "7d":
    case "weekly":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
    case "monthly":
      startDate.setMonth(now.getMonth() - 30);
      break;
    case "all":
    case "allTime":
      startDate = new Date(0); // Beginning of time
      break;
    default:
      startDate.setDate(now.getDate() - 7); // Default to weekly
  }
  
  // If account creation date is provided and more recent than our calculated date
  if (accountCreationDate && accountCreationDate > startDate) {
    startDate = accountCreationDate;
  }
  
  return startDate;
}

/**
 * Format an API response
 */
export function formatApiResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Safely execute an API handler with error handling
 */
export async function safeApiHandler(handler: () => Promise<NextResponse>) {
  try {
    return await handler();
  } catch (error: any) {
    console.error("API error:", error);
    
    // If the error is already a NextResponse (from ApiError), return it
    if (error instanceof NextResponse) {
      return error;
    }
    
    // Otherwise return a generic server error
    return ApiError.serverError("An unexpected error occurred");
  }
}

/**
 * Client-side API utilities for use with TanStack Query
 */

// Base API response type
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// Base fetch function for TanStack Query
export async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }
  
  return data as T;
}

// Common query keys for TanStack Query
export const queryKeys = {
  user: {
    profile: (address: string) => ['user', 'profile', address],
    transactions: (address: string) => ['user', 'transactions', address],
    activity: (address: string) => ['user', 'activity', address],
    bets: (address: string) => ['user', 'bets', address],
    stats: (address: string, timeFrame: string) => ['user', 'stats', address, timeFrame],
  },
  bets: {
    all: (filters?: any) => ['bets', 'all', filters],
    detail: (id: string) => ['bets', 'detail', id],
    solanaAddress: (id: string) => ['bets', 'solanaAddress', id],
  },
  community: {
    leaderboard: (period: string) => ['community', 'leaderboard', period],
    activity: () => ['community', 'activity'],
  },
};

// API endpoint paths
export const apiEndpoints = {
  user: {
    profile: (address: string) => `/api/users/profile?address=${address}`,
    transactions: (address: string) => `/api/users/transactions?address=${address}`,
    activity: (address: string, limit = 5) => `/api/users/activity?address=${address}&limit=${limit}`,
    bets: (address: string) => `/api/users/bets?address=${address}`,
    stats: (address: string, timeFrame = '7d') => `/api/users/stats?address=${address}&timeFrame=${timeFrame}`,
  },
  auth: {
    connectWallet: () => `/api/auth/wallet/connect`,
  },
  bets: {
    create: () => `/api/bets`,
    getAll: (filters: Record<string, string> = {}) => {
      const params = new URLSearchParams(filters);
      return `/api/bets?${params.toString()}`;
    },
    getById: (id: string) => `/api/bets/${id}`,
    getSolanaAddress: (id: string) => `/api/bets/${id}/solana-address`,
    place: () => `/api/bets/place`,
    resolve: (id: string) => `/api/bets/resolve/${id}`,
    withdraw: (id: string) => `/api/bets/${id}/withdraw`,
    statistics: (address: string) => `/api/bets/statistics?address=${address}`,
  },
  community: {
    leaderboard: (period = 'weekly') => `/api/community/leaderboard?period=${period}`,
    activity: () => `/api/community/activity`,
  },
};

// Example TanStack Query hooks interfaces 
// (these would typically go in a separate hooks file that imports from here)
export interface UseUserProfileOptions {
  address: string;
  enabled?: boolean;
}

export interface UseUserTransactionsOptions {
  address: string;
  enabled?: boolean;
}

export interface UseBetDetailsOptions {
  id: string;
  enabled?: boolean;
}

export interface UsePlaceBetOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}
