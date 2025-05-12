import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ResolveBetRequest {
  walletAddress: string;
  outcome: "yes" | "no";
  onChainTxId?: string; // Optional on-chain transaction ID
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse the request body
    const body: ResolveBetRequest = await request.json();
    const { walletAddress, outcome, onChainTxId } = body;
    const betId = params.id;
    
    // Validate required fields
    if (!walletAddress || !outcome) {
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

    // Verify that the user is the creator of the bet
    if (bet.creatorId !== user.id) {
      return NextResponse.json(
        { error: "Only the creator of the bet can resolve it" },
        { status: 403 }
      );
    }

    // Validate that the bet is still active
    if (bet.status !== "active") {
      return NextResponse.json(
        { error: "This bet cannot be resolved because it's not active" },
        { status: 400 }
      );
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

    return NextResponse.json({
      message: "Bet resolved successfully",
      bet: formattedBet,
      transactionSignature: onChainTxId || null,
    });
  } catch (error) {
    console.error("Error resolving bet:", error);
    return NextResponse.json(
      { error: "Failed to resolve bet" },
      { status: 500 }
    );
  }
}
