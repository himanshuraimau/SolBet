import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, ApiError, validateUserByWalletAddress, formatApiResponse } from "@/lib/api-utils";

/**
 * @route POST /api/bets/:id/withdraw
 * @description Withdraw funds from a bet
 * @param {string} id - The bet ID
 * @body {Object} body - Contains wallet address and transaction ID
 * @returns {Object} Success status and updated user bet information
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeApiHandler(async () => {
    const betId = params.id;
    
    if (!betId) {
      return ApiError.badRequest("Bet ID is required");
    }
    
    const data = await request.json();
    const { walletAddress, onChainTxId } = data;
    
    const user = await validateUserByWalletAddress(walletAddress);
    
    // Find the user's bet
    const userBet = await prisma.userBet.findUnique({
      where: {
        userId_betId: {
          userId: user.id,
          betId,
        },
      },
    });
    
    if (!userBet) {
      return ApiError.notFound("User has not participated in this bet");
    }
    
    // Mark the bet as claimed
    const updatedUserBet = await prisma.userBet.update({
      where: { id: userBet.id },
      data: {
        claimed: true,
        // Store the transaction ID if provided
        ...(onChainTxId && { onChainTxId }),
      },
    });
    
    // Record the transaction
    if (onChainTxId) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: userBet.amount, // Withdrawal amount is the original bet amount
          type: "withdrawal",
          status: "confirmed",
          betId: betId,
          txHash: onChainTxId,
        },
      });
    }
    
    return formatApiResponse({
      success: true,
      message: "Funds withdrawn successfully",
      userBet: updatedUserBet,
    });
  });
}
