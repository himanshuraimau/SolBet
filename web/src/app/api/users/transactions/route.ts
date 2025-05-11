import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/users/transactions
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

    // Get user transactions
    const userTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to recent 50 transactions
    });

    // Get bet information for bet-related transactions
    const betIds = userTransactions
      .filter(t => t.betId !== null)
      .map(t => t.betId);

    const bets = await prisma.bet.findMany({
      where: {
        id: {
          in: betIds as string[],
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const betsMap = new Map(bets.map(bet => [bet.id, bet.title]));

    // Format the transactions
    const formattedTransactions = userTransactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      timestamp: t.createdAt.toISOString(),
      betId: t.betId || undefined,
      betTitle: t.betId ? betsMap.get(t.betId) : undefined,
      address: t.toAddress || undefined,
      status: t.status,
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch user transactions" },
      { status: 500 }
    );
  }
}
