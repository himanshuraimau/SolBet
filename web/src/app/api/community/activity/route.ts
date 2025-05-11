import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the most recent transactions across all users
    const transactions = await prisma.transaction.findMany({
      where: {
        // Only include confirmed transactions
        status: "confirmed",
        // Filter out deposit transactions for the feed
        type: {
          in: ["bet", "withdrawal", "winnings"]
        }
      },
      orderBy: {
        timestamp: "desc"
      },
      take: 20, // Limit to 20 most recent activities
      include: {
        user: {
          select: {
            walletAddress: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    // Format transactions for the activity feed
    const activities = transactions.map(tx => {
      // Map transaction types to activity types
      let activityType = "unknown";
      let title = "";

      switch (tx.type) {
        case "bet":
          activityType = "bet_placed";
          title = `placed a bet`;
          break;
        case "winnings":
          activityType = "bet_won";
          title = `won a bet`;
          break;
        case "withdrawal":
          activityType = "withdrawal";
          title = "withdrew funds";
          break;
        default:
          activityType = tx.type;
          title = tx.type;
      }

      return {
        id: tx.id,
        type: activityType,
        title,
        amount: tx.amount,
        timestamp: tx.timestamp,
        user: {
          address: tx.user.walletAddress,
          displayName: tx.user.displayName,
          avatar: tx.user.avatar
        },
        betId: tx.betId
      };
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching community activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch community activity" },
      { status: 500 }
    );
  }
}