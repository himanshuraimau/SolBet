// /app/src/app/api/users/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @route GET /api/users/transactions
 * @desc Fetch user's transactions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find the user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json(
        { transactions: [] },
        { status: 200 }
      );
    }

    // Get the user's bets as transactions
    const userBets = await prisma.userBet.findMany({
      where: { userId: user.id },
      include: {
        bet: {
          select: {
            title: true,
            status: true,
            outcome: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform UserBet to transaction format
    const transactions = userBets.map(userBet => {
      const isWin = userBet.bet.status === 'RESOLVED' && 
                    userBet.bet.outcome === userBet.position;
                    
      return {
        id: userBet.id,
        type: isWin ? "winnings" : "bet",
        amount: parseFloat(userBet.amount) / 1000000000, // Convert lamports to SOL
        timestamp: userBet.createdAt.toISOString(),
        betId: userBet.betId,
        betTitle: userBet.bet.title,
        status: userBet.isClaimed && isWin ? "completed" : userBet.bet.status === 'RESOLVED' ? "completed" : "pending"
      };
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch user transactions" },
      { status: 500 }
    );
  }
}
