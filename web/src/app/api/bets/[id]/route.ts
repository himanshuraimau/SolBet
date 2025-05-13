import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, ApiError, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/bets/:id
 * @description Get a bet by ID with details
 * @param {string} id - The bet ID
 * @returns {Object} Bet details including participants
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeApiHandler(async () => {
    const { id } = params;

    // Fetch the bet by ID
    const bet = await prisma.bet.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            walletAddress: true,
            displayName: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                walletAddress: true,
              },
            },
          },
        },
      },
    });

    if (!bet) {
      return ApiError.notFound("Bet not found");
    }

    // Format the response
    const formattedBet = {
      id: bet.id,
      title: bet.title,
      description: bet.description,
      category: bet.category,
      creator: bet.creator.walletAddress,
      creatorName: bet.creator.displayName,
      yesPool: bet.yesPool,
      noPool: bet.noPool,
      minimumBet: bet.minimumBet,
      maximumBet: bet.maximumBet,
      startTime: bet.startTime,
      endTime: bet.endTime,
      status: bet.status,
      participants: bet.participants.map((p) => ({
        walletAddress: p.user.walletAddress,
        position: p.position,
        amount: p.amount,
        timestamp: p.timestamp,
      })),
    };

    return formatApiResponse(formattedBet);
  });
}
