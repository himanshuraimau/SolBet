import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface PlaceBetRequest {
  walletAddress: string;
  betId: string;
  position: "yes" | "no";
  amount: number;
  onChainTxId?: string; // Optional on-chain transaction ID
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: PlaceBetRequest = await request.json();
    const { walletAddress, betId, position, amount, onChainTxId } = body;
    
    // Validate required fields
    if (!walletAddress || !betId || !position || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please connect your wallet first." },
        { status: 404 }
      );
    }

    // Find the bet
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
    });

    if (!bet) {
      return NextResponse.json(
        { error: "Bet not found" },
        { status: 404 }
      );
    }

    // Validate that the bet is still active
    if (bet.status !== "active") {
      return NextResponse.json(
        { error: "This bet is no longer active" },
        { status: 400 }
      );
    }

    // Validate that the bet hasn't expired
    if (new Date(bet.endTime) <= new Date()) {
      return NextResponse.json(
        { error: "This bet has expired" },
        { status: 400 }
      );
    }

    // Validate the bet amount
    if (amount < bet.minimumBet || amount > bet.maximumBet) {
      return NextResponse.json(
        { error: `Bet amount must be between ${bet.minimumBet} and ${bet.maximumBet} SOL` },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "You have already placed a bet on this event" },
        { status: 400 }
      );
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
    return NextResponse.json({
      success: true,
      userBet: {
        id: userBet.id,
        position: userBet.position,
        amount: userBet.amount,
        timestamp: userBet.timestamp,
        walletAddress,
      },
    });
  } catch (error) {
    console.error("Error placing bet:", error);
    return NextResponse.json(
      { error: "Failed to place bet" },
      { status: 500 }
    );
  }
}