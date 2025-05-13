import { NextRequest } from "next/server";
import { safeApiHandler, validateUserByWalletAddress, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/users/profile
 * @description Get a user's profile by wallet address
 * @param {string} address - The user's wallet address
 * @returns {Object} User profile information
 */
export async function GET(request: NextRequest) {
  return safeApiHandler(async () => {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("address");
    
    const user = await validateUserByWalletAddress(walletAddress!);

    // Format the user data to match our UserProfile type
    const userProfile = {
      walletAddress: user.walletAddress,
      displayName: user.displayName || undefined,
      avatar: user.avatar || undefined,
      createdAt: user.createdAt,
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

    return formatApiResponse(userProfile);
  });
}