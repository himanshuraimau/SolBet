import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, validateUserByWalletAddress, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/users/bets
 * @description Get all bets created by or participated in by a user
 * @param {string} address - The user's wallet address
 * @returns {Object} Object containing arrays of active, created, participated, and resolved bets
 */
export async function GET(request: NextRequest) {
  return safeApiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    
    const user = await validateUserByWalletAddress(address!);

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
      } else if (bet.status === "SETTLED" || bet.status === "settled" || 
                bet.status.startsWith("resolved_")) {
        const outcome = bet.status.includes("yes") ? "YES" : "NO";
        resolved.push({
          ...betData,
          outcome,
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
      } else if (bet.status === "SETTLED" || bet.status === "settled" || 
                bet.status.startsWith("resolved_")) {
        // Determine outcome based on status
        const outcomeIsYes = bet.status.includes("yes");
        const outcome = outcomeIsYes ? "YES" : "NO";
        
        // Determine winner based on position and outcome
        const isWinner = (userBet.position.toUpperCase() === "YES" && outcomeIsYes) || 
                         (userBet.position.toUpperCase() === "NO" && !outcomeIsYes);
        
        resolved.push({
          ...betData,
          outcome,
          payout: isWinner ? Number(userBet.amount) * 2 : 0, // Simple payout calculation
        });
      }
    }

    // Remove duplicates from active bets (those created by the user and participated in)
    const uniqueActive = active.filter(activeBet => 
      !created.some(createdBet => createdBet.id === activeBet.id)
    );

    return formatApiResponse({
      active: uniqueActive,
      created,
      participated,
      resolved,
    });
  });
}
