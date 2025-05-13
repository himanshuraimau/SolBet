import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, ApiError, formatApiResponse } from "@/lib/api-utils";

interface WalletConnectionRequest {
  walletAddress: string;
}

/**
 * @route POST /api/auth/wallet/connect
 * @description Connect a wallet address to create or retrieve a user
 * @body {Object} body - Contains the wallet address
 * @returns {Object} User profile information
 */
export async function POST(request: NextRequest) {
  return safeApiHandler(async () => {
    const body: WalletConnectionRequest = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return ApiError.badRequest("Wallet address is required");
    }

    // Find existing user or create a new one
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      // First time connection - create new user
      user = await prisma.user.create({
        data: {
          walletAddress,
          // Default values will be applied from the schema
        },
      });

      console.log(`New user created with wallet address: ${walletAddress}`);
    } else {
      console.log(`Existing user found with wallet address: ${walletAddress}`);
    }

    // Format the user data to match our UserProfile type
    const userProfile = {
      walletAddress: user.walletAddress,
      displayName: user.displayName || undefined,
      avatar: user.avatar || undefined,
      stats: {
        betsCreated: user.betsCreated,
        betsJoined: user.betsJoined,
        winRate: user.winRate,
        totalWinnings: user.totalWinnings,
      },
      preferences: {
        theme: user.theme as "light" | "dark" | "system",
        notifications: user.notifications,
      },
    };

    return formatApiResponse({ user: userProfile });
  });
}