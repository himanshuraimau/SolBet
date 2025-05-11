import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/bets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
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
    const active: any[] = [];
    const created: any[] = [];
    const participated: any[] = [];
    const resolved: any[] = [];

    // Process created bets
    for (const bet of createdBets) {
      const betData = {
        id: bet.id,
        title: bet.title,
        description: bet.description,
        amount: bet.maximumBet, // Using maximumBet as an amount reference
        status: bet.status,
        createdAt: bet.createdAt.toISOString(),
        expiresAt: bet.endTime.toISOString(),
      };

      if (bet.status === "ACTIVE" || bet.status === "active") {
        created.push(betData);
      } else if (bet.status === "SETTLED" || bet.status === "settled") {
        resolved.push({
          ...betData,
          outcome: bet.status, // Using status as outcome since outcome field doesn't exist
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
        expiresAt: bet.endTime.toISOString(),
      };

      if (bet.status === "ACTIVE" || bet.status === "active") {
        participated.push(betData);
        active.push(betData);
      } else if (bet.status === "SETTLED" || bet.status === "settled") {
        // Determine winner based on position and yes/no pools ratio
        const yesWon = bet.yesPool > bet.noPool;
        const isWinner = (userBet.position === "YES" && yesWon) || 
                         (userBet.position === "NO" && !yesWon);
        
        resolved.push({
          ...betData,
          outcome: yesWon ? "YES" : "NO",
          payout: isWinner ? Number(userBet.amount) * 2 : 0, // Simple payout calculation
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
