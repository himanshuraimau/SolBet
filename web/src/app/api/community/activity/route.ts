import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/community/activity
 * @description Get recent activity across all users
 * @returns {Array} Community activity feed
 */
export async function GET(request: NextRequest) {
  return safeApiHandler(async () => {
    // Get the most recent transactions across all users
    const transactions = await prisma.transaction.findMany({
      where: {
        // Only include confirmed transactions
        status: "confirmed",
        // Filter out deposit transactions for the feed
        type: {
          in: ["bet", "withdrawal", "winnings"]
        }
      },
      orderBy: {
        timestamp: "desc"
      },
      take: 20, // Limit to 20 most recent activities
      include: {
        user: {
          select: {
            walletAddress: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    // Format transactions for the activity feed
    const activities = transactions.map(tx => {
      // Map transaction types to activity types
      let activityType = "unknown";
      let title = "";

      switch (tx.type) {
        case "bet":
          activityType = "bet_placed";
          title = `placed a bet`;
          break;
        case "winnings":
          activityType = "bet_won";
          title = `won a bet`;
          break;
        case "withdrawal":
          activityType = "withdrawal";
          title = "withdrew funds";
          break;
        default:
          activityType = tx.type;
          title = tx.type;
      }

      return {
        id: tx.id,
        type: activityType,
        title,
        amount: Number(tx.amount),
        timestamp: tx.timestamp,
        user: {
          address: tx.user.walletAddress,
          displayName: tx.user.displayName,
          avatar: tx.user.avatar
        },
        betId: tx.betId
      };
    });

    return formatApiResponse(activities);
  });
}