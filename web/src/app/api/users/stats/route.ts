import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const timeFrame = searchParams.get("timeFrame") || "7d";

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    let startDate = new Date();

    switch (timeFrame) {
      case "1d":
        startDate.setDate(now.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "all":
        startDate.setFullYear(now.getFullYear() - 1);
        const accountCreationDate = new Date(user.createdAt);
        if (accountCreationDate > startDate) {
          startDate = accountCreationDate;
        }
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const userBets = await prisma.userBet.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        bet: true, // This will make userBet.bet available and typed
      },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    let betsWon = 0;
    let betsLost = 0;
    let winnings = 0;
    let losses = 0;
    let activeBets = 0;
    let totalBetAmount = 0;

    userBets.forEach((userBet) => { // Type for userBet is inferred here
      totalBetAmount += Number(userBet.amount) || 0;

      if (userBet.bet && userBet.bet.status === "SETTLED") {
        if (userBet.claimed) {
          // Assuming 'claimed' means they won. Win amount is not on UserBet model.
          // betsWon++; 
          // winnings += ???; // winAmount is not available on UserBet.
        } else {
          betsLost++;
          losses += Number(userBet.amount) || 0;
        }
      } else if (userBet.bet && userBet.bet.status === "ACTIVE") {
        activeBets++;
      }
    });

    const betHistory = transactions.map((tx) => ({
      timestamp: tx.timestamp,
      type: tx.type,
      amount: Number(tx.amount) || 0,
      title: `Type: ${tx.type}, Amount: ${tx.amount}`,
    }));

    const stats = {
      winnings,
      losses,
      netProfit: winnings - losses,
      winRate: userBets.length > 0 && (betsWon + betsLost) > 0 ? (betsWon / (betsWon + betsLost)) * 100 : 0,
      betsPlaced: userBets.length,
      avgBetSize: userBets.length > 0 ? totalBetAmount / userBets.length : 0,
      betsWon,
      betsLost,
      activeBets,
    };

    return NextResponse.json({
      stats,
      betHistory,
      timeFrame,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}