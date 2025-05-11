import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/users/activity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const limitParam = searchParams.get("limit") || "5";
    const limit = parseInt(limitParam, 10);

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    // Authenticate the user
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user from wallet address
    const user = await prisma.user.findFirst({
      where: {
        walletAddress: address,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        status: "confirmed",
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
      include: {
        bet: {
          select: {
            title: true,
          },
        },
      },
    });

    // Format transactions for the activity feed
    const activities = transactions.map(tx => {
      // Map transaction types to activity types and create appropriate titles
      let activityType = "unknown";
      let title = "";

      switch (tx.type) {
        case "bet":
          activityType = "bet_placed";
          title = tx.bet 
            ? `Placed a bet on '${tx.bet.title}'` 
            : "Placed a bet";
          break;
        case "winnings":
          activityType = "bet_won";
          title = tx.bet 
            ? `Won bet on '${tx.bet.title}'` 
            : "Won a bet";
          break;
        case "lostBet":
          activityType = "bet_lost";
          title = tx.bet 
            ? `Lost bet on '${tx.bet.title}'` 
            : "Lost a bet";
          break;
        case "withdrawal":
          activityType = "withdrawal";
          title = "Withdrew funds to wallet";
          break;
        case "deposit":
          activityType = "deposit";
          title = "Deposited funds from wallet";
          break;
        case "payout":
          activityType = "payout";
          title = tx.bet 
            ? `Received payout from '${tx.bet.title}'` 
            : "Received payout";
          break;
        default:
          activityType = tx.type;
          title = tx.type;
      }

      return {
        id: tx.id,
        type: activityType,
        title,
        amount: Number(tx.amount) || 0,
        timestamp: tx.timestamp,
        betId: tx.betId,
      };
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activity" },
      { status: 500 }
    );
  }
}
