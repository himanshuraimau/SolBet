import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "weekly";
    
    // Determine the start date based on the requested period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "allTime":
        // Just set to a far past date for "all time"
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(now.getDate() - 7); // Default to weekly
    }

    // Get users with their bet statistics within the time period
    // First, get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        displayName: true,
        avatar: true,
        winRate: true,
        totalWinnings: true,
        // Include transactions of type "winnings" in the specified period
        transactions: {
          where: {
            type: "winnings",
            timestamp: {
              gte: startDate,
              lte: now
            }
          },
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        totalWinnings: "desc"
      },
      take: 10 // Limit to top 10 users
    });

    // Calculate period-specific winnings and prepare the leaderboard data
    const leaderboard = users.map((user, index) => {
      // Calculate the sum of winnings for the period
      const periodWinnings = user.transactions.reduce(
        (sum, tx) => sum + tx.amount, 
        0
      );
      
      return {
        rank: index + 1,
        address: user.walletAddress,
        displayName: user.displayName || null,
        avatar: user.avatar || null,
        winRate: Math.round(user.winRate), // Round to whole number
        winnings: period === "allTime" ? user.totalWinnings : periodWinnings
      };
    });

    // Sort by period winnings for weekly/monthly, or by totalWinnings for allTime
    leaderboard.sort((a, b) => b.winnings - a.winnings);
    
    // Re-assign ranks after sorting
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}