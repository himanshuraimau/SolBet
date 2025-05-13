import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/user/:address/bet-stats
 * @description Get betting statistics for a user
 * @param {string} address - User wallet address
 * @returns {Object} Betting statistics
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { address: string } }
) {
  return safeApiHandler(async () => {
    const { address } = params;

    // Find the user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return formatApiResponse({
        betsCreated: 0,
        betsJoined: 0,
        winRate: 0,
        totalWinnings: 0,
      });
    }

    // Get bets created by the user
    const betsCreated = await prisma.bet.count({
      where: { creatorId: user.id },
    });

    // Get bets joined by the user
    const betsJoined = await prisma.betParticipant.count({
      where: { userId: user.id },
    });

    // Get winning bets (where position matches outcome)
    const winningBets = await prisma.betParticipant.count({
      where: {
        userId: user.id,
        bet: {
          status: "RESOLVED",
          outcome: {
            equals: prisma.betParticipant.fields.position,
          },
        },
      },
    });

    // Calculate win rate
    const winRate = betsJoined > 0 ? Math.floor((winningBets / betsJoined) * 100) : 0;

    // Calculate total winnings
    // This would ideally be more complex, accounting for actual payouts
    const totalWinnings = await prisma.betParticipant.aggregate({
      where: {
        userId: user.id,
        bet: {
          status: "RESOLVED",
          outcome: {
            equals: prisma.betParticipant.fields.position,
          },
        },
      },
      _sum: {
        amount: true,
      },
    });

    return formatApiResponse({
      betsCreated,
      betsJoined,
      winRate,
      totalWinnings: totalWinnings._sum.amount || 0,
    });
  });
}
