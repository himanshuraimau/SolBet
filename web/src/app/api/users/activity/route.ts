// /app/src/app/api/users/activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @route GET /api/users/activity
 * @desc Fetch user's activity feed
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

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
      return NextResponse.json([], { status: 200 });
    }

    // Get the user's bets
    const userBets = await prisma.userBet.findMany({
      where: { userId: user.id },
      include: {
        bet: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Get the bets created by the user
    const createdBets = await prisma.bet.findMany({
      where: { creatorId: user.id },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Transform to activity format
    const activities = [
      // Bets placed
      ...userBets.map(userBet => {
        const amount = parseFloat(userBet.amount) / 1000000000; // Convert lamports to SOL
        return {
          id: `bet_placed_${userBet.id}`,
          type: 'bet_placed',
          title: "Placed a bet",
          amount,
          timestamp: userBet.createdAt.toISOString(),
          betId: userBet.betId
        };
      }),
      
      // Bets created
      ...createdBets.map(bet => ({
        id: `bet_created_${bet.id}`,
        type: 'bet_created',
        title: "Created a bet",
        timestamp: bet.createdAt.toISOString(),
        betId: bet.id
      })),
      
      // Bets won (if any)
      ...userBets
        .filter(userBet => 
          userBet.bet.status === 'RESOLVED' && 
          userBet.bet.outcome === userBet.position)
        .map(userBet => {
          const amount = parseFloat(userBet.amount) / 1000000000 * 1.8; // Simple winnings calculation
          return {
            id: `bet_won_${userBet.id}`,
            type: 'bet_won',
            title: "Won a bet",
            amount,
            timestamp: userBet.bet.updatedAt.toISOString(), // When the bet was resolved
            betId: userBet.betId
          };
        }),
        
      // Bets lost (if any)
      ...userBets
        .filter(userBet => 
          userBet.bet.status === 'RESOLVED' && 
          userBet.bet.outcome !== userBet.position &&
          userBet.bet.outcome !== null)
        .map(userBet => {
          const amount = parseFloat(userBet.amount) / 1000000000;
          return {
            id: `bet_lost_${userBet.id}`,
            type: 'bet_lost',
            title: "Lost a bet",
            amount,
            timestamp: userBet.bet.updatedAt.toISOString(),
            betId: userBet.betId
          };
        })
    ];
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to requested number
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json(limitedActivities);
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activity" },
      { status: 500 }
    );
  }
}
