// /app/src/app/api/bets/statistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @route GET /api/bets/statistics
 * @desc Fetch bet statistics for a user
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
      return NextResponse.json({
        totalBets: 0,
        yesBets: 0,
        noBets: 0,
        winRate: 0
      }, { status: 200 });
    }

    // Get all of the user's bets
    const userBets = await prisma.userBet.findMany({
      where: { userId: user.id },
      include: {
        bet: true
      }
    });

    // Calculate statistics
    const totalBets = userBets.length;
    const yesBets = userBets.filter(bet => bet.position === 'YES').length;
    const noBets = userBets.filter(bet => bet.position === 'NO').length;
    
    // Calculate win rate from resolved bets
    const resolvedBets = userBets.filter(bet => bet.bet.status === 'RESOLVED' && bet.bet.outcome !== null);
    const wonBets = resolvedBets.filter(bet => bet.bet.outcome === bet.position).length;
    const winRate = resolvedBets.length > 0 ? Math.round((wonBets / resolvedBets.length) * 100) : 0;

    const betStats = {
      totalBets,
      yesBets,
      noBets,
      winRate
    };

    return NextResponse.json(betStats);
  } catch (error) {
    console.error("Error fetching bet statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch bet statistics" },
      { status: 500 }
    );
  }
}
