import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, ApiError, validateUserByWalletAddress, formatApiResponse } from "@/lib/api-utils";

interface PlaceBetRequest {
  walletAddress: string;
  betId: string;
  position: "yes" | "no";
  amount: number;
  onChainTxId?: string; // Optional on-chain transaction ID
}

/**
 * @route POST /api/bets/place
 * @description Place a bet on a specific outcome
 * @body {Object} body - Contains wallet address, bet ID, position, amount, and optional transaction ID
 * @returns {Object} User bet information
 */
export async function POST(request: NextRequest) {
  return safeApiHandler(async () => {
    // Parse the request body
    const body: PlaceBetRequest = await request.json();
    const { walletAddress, betId, position, amount, onChainTxId } = body;
    
    // Validate required fields
    if (!betId || !position || !amount) {
      return ApiError.badRequest("Missing required fields");
    }

    const user = await validateUserByWalletAddress(walletAddress);

    // Find the bet
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
    });

    if (!bet) {
      return ApiError.notFound("Bet not found");
    }

    // Validate that the bet is still active
    if (bet.status !== "active") {
      return ApiError.badRequest("This bet is no longer active");
    }

    // Validate that the bet hasn't expired
    if (new Date(bet.endTime) <= new Date()) {
      return ApiError.badRequest("This bet has expired");
    }

    // Validate the bet amount
    if (amount < bet.minimumBet || amount > bet.maximumBet) {
      return ApiError.badRequest(`Bet amount must be between ${bet.minimumBet} and ${bet.maximumBet} SOL`);
    }

    // Check if the user has already placed a bet on this bet
    const existingBet = await prisma.userBet.findUnique({
      where: {
        userId_betId: {
          userId: user.id,
          betId: bet.id,
        },
      },
    });

    if (existingBet) {
      return ApiError.badRequest("You have already placed a bet on this event");
    }

    // Create the user bet
    const userBet = await prisma.userBet.create({
      data: {
        position,
        amount,
        userId: user.id,
        betId: bet.id,
        onChainTxId, // Store the on-chain transaction ID if provided
      },
    });

    // Update the bet pools
    await prisma.bet.update({
      where: { id: bet.id },
      data: {
        yesPool: position === "yes" ? { increment: amount } : undefined,
        noPool: position === "no" ? { increment: amount } : undefined,
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        betsJoined: { increment: 1 },
      },
    });

    // Create a transaction record
    await prisma.transaction.create({
      data: {
        amount,
        type: "bet",
        status: "confirmed",
        userId: user.id,
        betId: bet.id,
        txHash: onChainTxId, // Store the on-chain transaction ID
      },
    });

    // Return success response
    return formatApiResponse({
      success: true,
      userBet: {
        id: userBet.id,
        position: userBet.position,
        amount: userBet.amount,
        timestamp: userBet.timestamp,
        walletAddress,
      },
    });
  });
}