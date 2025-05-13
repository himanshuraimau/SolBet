import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, validateUserByWalletAddress, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/users/transactions
 * @description Get transactions for a user by wallet address
 * @param {string} address - The user's wallet address
 * @returns {Object} List of transactions with related bet information
 */
export async function GET(request: NextRequest) {
  return safeApiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    
    const user = await validateUserByWalletAddress(address!);

    // Get user transactions
    const userTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        timestamp: "desc",
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
      timestamp: t.timestamp.toISOString(),
      betId: t.betId || undefined,
      betTitle: t.betId ? betsMap.get(t.betId) : undefined,
      txHash: t.txHash || undefined,
      status: t.status,
    }));

    return formatApiResponse({
      transactions: formattedTransactions,
    });
  });
}
