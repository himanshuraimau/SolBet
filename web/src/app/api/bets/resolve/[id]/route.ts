import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, ApiError, validateUserByWalletAddress, formatApiResponse } from "@/lib/api-utils";

interface ResolveBetRequest {
  walletAddress: string;
  outcome: "yes" | "no";
  onChainTxId?: string; // Optional on-chain transaction ID
}

/**
 * @route PUT /api/bets/resolve/:id
 * @description Resolve a bet with the final outcome
 * @param {string} id - The bet ID
 * @body {Object} body - Contains wallet address, outcome, and optional transaction ID
 * @returns {Object} Updated bet information with resolution details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeApiHandler(async () => {
    // Parse the request body
    const body: ResolveBetRequest = await request.json();
    const { walletAddress, outcome, onChainTxId } = body;
    const betId = params.id;
    
    // Validate required fields
    if (!outcome) {
      return ApiError.badRequest("Outcome is required");
    }

    const user = await validateUserByWalletAddress(walletAddress);

    // Find the bet
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
    });

    if (!bet) {
      return ApiError.notFound("Bet not found");
    }

    // Verify that the user is the creator of the bet
    if (bet.creatorId !== user.id) {
      return ApiError.forbidden("Only the creator of the bet can resolve it");
    }

    // Validate that the bet is still active
    if (bet.status !== "active") {
      return ApiError.badRequest("This bet cannot be resolved because it's not active");
    }

    // Update the bet status to resolved_yes or resolved_no based on outcome
    const updatedBet = await prisma.bet.update({
      where: { id: betId },
      data: {
        status: outcome === "yes" ? "resolved_yes" : "resolved_no",
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                walletAddress: true,
              }
            }
          }
        },
        creator: {
          select: {
            walletAddress: true,
            displayName: true,
          }
        }
      }
    });

    // Create a transaction record for the on-chain settlement
    if (onChainTxId) {
      await prisma.transaction.create({
        data: {
          amount: 0, // Settlement doesn't involve direct amount
          type: "settlement",
          status: "confirmed",
          userId: user.id,
          betId: bet.id,
          txHash: onChainTxId,
        },
      });
    }

    // Format the response
    const formattedBet = {
      id: updatedBet.id,
      title: updatedBet.title,
      description: updatedBet.description,
      category: updatedBet.category,
      creator: updatedBet.creator.walletAddress,
      creatorName: updatedBet.creator.displayName,
      yesPool: updatedBet.yesPool,
      noPool: updatedBet.noPool,
      totalPool: updatedBet.yesPool + updatedBet.noPool,
      minimumBet: updatedBet.minimumBet,
      maximumBet: updatedBet.maximumBet,
      startTime: updatedBet.startTime,
      endTime: updatedBet.endTime,
      status: updatedBet.status,
      outcome: outcome,
      participants: updatedBet.participants.map((p) => ({
        walletAddress: p.user.walletAddress,
        position: p.position,
        amount: p.amount,
        timestamp: p.timestamp,
      })),
    };

    return formatApiResponse({
      message: "Bet resolved successfully",
      bet: formattedBet,
      transactionSignature: onChainTxId || null,
    });
  });
}
