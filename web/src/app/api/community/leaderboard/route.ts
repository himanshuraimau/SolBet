import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, getPeriodStartDate, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/community/leaderboard
 * @description Get the leaderboard of top users by winnings for a specific time period
 * @param {string} period - Time period for leaderboard (weekly, monthly, allTime)
 * @returns {Array} Ranked list of top users
 */
export async function GET(request: NextRequest) {
  return safeApiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "weekly";
    
    // Determine the start date based on the requested period
    const now = new Date();
    let startDate = getPeriodStartDate(period);

    // Get users with their bet statistics within the time period
    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        displayName: true,
        avatar: true,
        winRate: true,
        totalWinnings: true,
        // Include transactions of type "winnings" in the specified period
        transactions: {
          where: {
            type: "winnings",
            timestamp: {
              gte: startDate,
              lte: now
            }
          },
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        totalWinnings: "desc"
      },
      take: 10 // Limit to top 10 users
    });

    // Calculate period-specific winnings and prepare the leaderboard data
    const leaderboard = users.map((user, index) => {
      // Calculate the sum of winnings for the period
      const periodWinnings = user.transactions.reduce(
        (sum, tx) => sum + Number(tx.amount), 
        0
      );
      
      return {
        rank: index + 1,
        address: user.walletAddress,
        displayName: user.displayName || null,
        avatar: user.avatar || null,
        winRate: Math.round(user.winRate), // Round to whole number
        winnings: period === "allTime" ? user.totalWinnings : periodWinnings
      };
    });

    // Sort by period winnings for weekly/monthly, or by totalWinnings for allTime
    leaderboard.sort((a, b) => b.winnings - a.winnings);
    
    // Re-assign ranks after sorting
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    return formatApiResponse(leaderboard);
  });
}