import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/users/bets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

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

    // Get all bets created by the user
    const createdBets = await prisma.bet.findMany({
      where: {
        creatorId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all bets participated in by the user
    const participatedBets = await prisma.userBet.findMany({
      where: {
        userId: user.id,
      },
      include: {
        bet: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Format the data for the frontend
    const active = [];
    const created = [];
    const participated = [];
    const resolved = [];

    // Process created bets
    for (const bet of createdBets) {
      const betData = {
        id: bet.id,
        title: bet.title,
        description: bet.description,
        amount: Number(bet.amount),
        status: bet.status,
        createdAt: bet.createdAt.toISOString(),
        expiresAt: bet.expiresAt.toISOString(),
      };

      if (bet.status === "ACTIVE") {
        created.push(betData);
      } else if (bet.status === "SETTLED") {
        resolved.push({
          ...betData,
          outcome: bet.outcome,
        });
      }
    }

    // Process participated bets
    for (const userBet of participatedBets) {
      const bet = userBet.bet;
      if (!bet) continue;

      const betData = {
        id: bet.id,
        title: bet.title,
        description: bet.description,
        amount: Number(userBet.amount),
        position: userBet.position,
        status: bet.status,
        createdAt: bet.createdAt.toISOString(),
        expiresAt: bet.expiresAt.toISOString(),
      };

      if (bet.status === "ACTIVE") {
        participated.push(betData);
        active.push(betData);
      } else if (bet.status === "SETTLED") {
        const isWinner = (userBet.position === "YES" && bet.outcome === "YES") || 
                         (userBet.position === "NO" && bet.outcome === "NO");
        
        resolved.push({
          ...betData,
          outcome: bet.outcome,
          payout: isWinner ? Number(bet.amount) * 2 : 0, // Simple payout calculation
        });
      }
    }

    // Remove duplicates from active bets (those created by the user and participated in)
    const uniqueActive = active.filter(activeBet => 
      !created.some(createdBet => createdBet.id === activeBet.id)
    );

    return NextResponse.json({
      active: uniqueActive,
      created,
      participated,
      resolved,
    });
  } catch (error) {
    console.error("Error fetching user bets:", error);
    return NextResponse.json(
      { error: "Failed to fetch user bets" },
      { status: 500 }
    );
  }
}
