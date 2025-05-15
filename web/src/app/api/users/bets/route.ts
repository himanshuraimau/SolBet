// /app/src/app/api/users/bets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @route GET /api/users/bets
 * @desc Fetch user's bets
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
      return NextResponse.json({ bets: [] }, { status: 200 });
    }

    // Get the user's bets
    const userBets = await prisma.userBet.findMany({
      where: { userId: user.id },
      include: {
        bet: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to expected format
    const formattedBets = userBets.map(userBet => {
      // Calculate outcome based on bet status and position
      let outcome = "pending";
      if (userBet.bet.status === 'RESOLVED') {
        if (userBet.bet.outcome === userBet.position) {
          outcome = "win";
        } else if (userBet.bet.outcome !== null) {
          outcome = "loss";
        }
      }

      // Calculate potential return (simple formula)
      const betAmount = parseFloat(userBet.amount) / 1000000000; // Convert lamports to SOL
      const potentialReturn = userBet.position === 'YES' 
        ? betAmount * parseFloat(userBet.bet.totalPool) / parseFloat(userBet.bet.yesPool) 
        : betAmount * parseFloat(userBet.bet.totalPool) / parseFloat(userBet.bet.noPool);
      
      return {
        id: userBet.id,
        betId: userBet.betId,
        title: userBet.bet.title,
        description: userBet.bet.description,
        category: userBet.bet.category,
        position: userBet.position,
        amount: betAmount,
        potentialReturn: parseFloat(potentialReturn.toFixed(2)) || betAmount * 1.8, // fallback to simple calculation
        outcome,
        status: userBet.bet.status.toLowerCase(),
        expiresAt: userBet.bet.expiresAt.toISOString(),
        createdAt: userBet.createdAt.toISOString()
      };
    });

    return NextResponse.json({ bets: formattedBets });
  } catch (error) {
    console.error("Error fetching user bets:", error);
    return NextResponse.json(
      { error: "Failed to fetch user bets" },
      { status: 500 }
    );
  }
}
