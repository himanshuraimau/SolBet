// /app/src/app/api/users/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @route GET /api/users/stats
 * @desc Fetch user's statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const timeFrame = searchParams.get("timeFrame") || "7d";

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
        stats: {
          winnings: 0,
          losses: 0,
          netProfit: 0,
          winRate: 0,
          betsPlaced: 0,
          avgBetSize: 0,
          betsWon: 0,
          betsLost: 0,
          activeBets: 0
        },
        betHistory: []
      }, { status: 200 });
    }

    // Calculate date filter based on timeFrame
    let dateFilter = new Date();
    if (timeFrame === "1d") {
      dateFilter.setDate(dateFilter.getDate() - 1);
    } else if (timeFrame === "7d") {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (timeFrame === "30d") {
      dateFilter.setDate(dateFilter.getDate() - 30);
    } else if (timeFrame === "all") {
      dateFilter = new Date(0); // Beginning of time
    }

    // Get the user's bets within the time frame
    const userBets = await prisma.userBet.findMany({
      where: { 
        userId: user.id,
        createdAt: {
          gte: dateFilter
        }
      },
      include: {
        bet: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get active bets (where bet status is ACTIVE)
    const activeBets = userBets.filter(ub => ub.bet.status === 'ACTIVE').length;

    // Calculate stats
    let winnings = 0;
    let losses = 0;
    let betsWon = 0;
    let betsLost = 0;
    let totalBetAmount = 0;
    
    const history = userBets.map(bet => {
      const amount = parseFloat(bet.amount) / 1000000000; // Convert lamports to SOL
      totalBetAmount += amount;
      
      let type = "PENDING";
      let title = "Bet Pending";
      
      if (bet.bet.status === 'RESOLVED') {
        if (bet.bet.outcome === bet.position) {
          type = "WIN";
          title = "Bet Won";
          betsWon++;
          // Simple calculation for winnings
          const winAmount = amount * 1.8; // Simplified payout calculation
          winnings += winAmount;
          return {
            timestamp: bet.bet.updatedAt.toISOString(),
            type,
            amount: winAmount,
            title,
            status: "success",
            betId: bet.betId
          };
        } else if (bet.bet.outcome !== null) {
          type = "LOSS";
          title = "Bet Lost";
          betsLost++;
          losses += amount;
        }
      }
      
      return {
        timestamp: bet.createdAt.toISOString(),
        type,
        amount,
        title,
        status: bet.bet.status === 'RESOLVED' ? "success" : "pending",
        betId: bet.betId
      };
    });
    
    const betsPlaced = userBets.length;
    const avgBetSize = betsPlaced > 0 ? totalBetAmount / betsPlaced : 0;
    const winRate = betsPlaced > 0 ? Math.round((betsWon / betsPlaced) * 100) : 0;
    
    const stats = {
      stats: {
        winnings: parseFloat(winnings.toFixed(2)),
        losses: parseFloat(losses.toFixed(2)),
        netProfit: parseFloat((winnings - losses).toFixed(2)),
        winRate,
        betsPlaced,
        avgBetSize: parseFloat(avgBetSize.toFixed(2)),
        betsWon,
        betsLost,
        activeBets
      },
      betHistory: history
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
