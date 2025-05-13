import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, validateUserByWalletAddress, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/users/activity
 * @description Get a user's activity history
 * @param {string} address - The user's wallet address
 * @param {number} limit - The number of activities to return (default: 5)
 * @returns {Array} User activities
 */
export async function GET(request: NextRequest) {
  return safeApiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const limitParam = searchParams.get("limit") || "5";
    const limit = parseInt(limitParam, 10);
    
    const user = await validateUserByWalletAddress(address!);

    // Get user transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        status: "confirmed",
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });

    // Get bet information for bet-related transactions
    const betIds = transactions
      .filter(t => t.betId !== null)
      .map(t => t.betId);

    const bets = await prisma.bet.findMany({
      where: {
        id: {
          in: betIds as string[],
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const betsMap = new Map(bets.map(bet => [bet.id, bet.title]));

    // Format transactions for the activity feed
    const activities = transactions.map(tx => {
      // Map transaction types to activity types and create appropriate titles
      let activityType = "unknown";
      let title = "";
      const betTitle = tx.betId ? betsMap.get(tx.betId) : undefined;

      switch (tx.type) {
        case "bet":
          activityType = "bet_placed";
          title = betTitle 
            ? `Placed a bet on '${betTitle}'` 
            : "Placed a bet";
          break;
        case "winnings":
          activityType = "bet_won";
          title = betTitle 
            ? `Won bet on '${betTitle}'` 
            : "Won a bet";
          break;
        case "lostBet":
          activityType = "bet_lost";
          title = betTitle 
            ? `Lost bet on '${betTitle}'` 
            : "Lost a bet";
          break;
        case "withdrawal":
          activityType = "withdrawal";
          title = "Withdrew funds to wallet";
          break;
        case "deposit":
          activityType = "deposit";
          title = "Deposited funds from wallet";
          break;
        case "payout":
          activityType = "payout";
          title = betTitle 
            ? `Received payout from '${betTitle}'` 
            : "Received payout";
          break;
        default:
          activityType = tx.type;
          title = tx.type;
      }

      return {
        id: tx.id,
        type: activityType,
        title,
        amount: Number(tx.amount) || 0,
        timestamp: tx.timestamp,
        betId: tx.betId,
      };
    });

    return formatApiResponse(activities);
  });
}
