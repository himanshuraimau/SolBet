import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, validateUserByWalletAddress, getPeriodStartDate, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/users/stats
 * @description Get detailed statistics for a user over a specific time period
 * @param {string} address - The user's wallet address
 * @param {string} timeFrame - Time period for statistics (1d, 7d, 30d, all)
 * @returns {Object} User stats and bet history
 */
export async function GET(request: NextRequest) {
  return safeApiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const timeFrame = searchParams.get("timeFrame") || "7d";
    
    const user = await validateUserByWalletAddress(address!);

    const now = new Date();
    // Get period start date
    const startDate = getPeriodStartDate(timeFrame, user.createdAt);

    const userBets = await prisma.userBet.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        bet: true,
      },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    // Calculate statistics
    let betsWon = 0;
    let betsLost = 0;
    let winnings = 0;
    let losses = 0;
    let activeBets = 0;
    let totalBetAmount = 0;

    userBets.forEach((userBet) => {
      totalBetAmount += Number(userBet.amount) || 0;

      if (userBet.bet) {
        const status = userBet.bet.status;
        
        if (status.startsWith("resolved_") || status === "SETTLED" || status === "settled") {
          const outcomeIsYes = status.includes("yes");
          const userPositionIsYes = userBet.position.toUpperCase() === "YES";
          
          // Check if user won
          if ((outcomeIsYes && userPositionIsYes) || (!outcomeIsYes && !userPositionIsYes)) {
            betsWon++;
            // Calculate winnings - in a real app, you'd have actual payout data
            winnings += Number(userBet.amount) * 2; // Simple calculation
          } else {
            betsLost++;
            losses += Number(userBet.amount) || 0;
          }
        } else if (status === "ACTIVE" || status === "active") {
          activeBets++;
        }
      }
    });

    // Format transaction history
    const betHistory = transactions.map((tx) => ({
      timestamp: tx.timestamp,
      type: tx.type,
      amount: Number(tx.amount) || 0,
      title: `Type: ${tx.type}, Amount: ${tx.amount}`,
    }));

    // Compile stats
    const stats = {
      winnings,
      losses,
      netProfit: winnings - losses,
      winRate: userBets.length > 0 && (betsWon + betsLost) > 0 ? (betsWon / (betsWon + betsLost)) * 100 : 0,
      betsPlaced: userBets.length,
      avgBetSize: userBets.length > 0 ? totalBetAmount / userBets.length : 0,
      betsWon,
      betsLost,
      activeBets,
    };

    return formatApiResponse({
      stats,
      betHistory,
      timeFrame,
    });
  });
}