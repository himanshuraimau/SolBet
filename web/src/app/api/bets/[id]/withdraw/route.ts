import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const betId = params.id;
    
    if (!betId) {
      return NextResponse.json({ error: "Bet ID is required" }, { status: 400 });
    }
    
    const data = await request.json();
    const { walletAddress, onChainTxId } = data;
    
    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }
    
    // Find the user with this wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
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
      return NextResponse.json({ error: "User has not participated in this bet" }, { status: 404 });
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
    
    return NextResponse.json({
      success: true,
      message: "Funds withdrawn successfully",
      userBet: updatedUserBet,
    });
    
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    return NextResponse.json(
      { error: "Failed to withdraw funds" },
      { status: 500 }
    );
  }
}
