// /app/src/app/api/users/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @route GET /api/users/profile
 * @desc Fetch user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find or create user by wallet address
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    // If user doesn't exist, create a new one
    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: address,
        },
      });
    }

    // Get user statistics from bets
    const userBets = await prisma.userBet.findMany({
      where: { userId: user.id },
      include: {
        bet: true
      }
    });

    const createdBets = await prisma.bet.count({
      where: { creatorId: user.id }
    });

    // Calculate stats
    let totalWinnings = 0;
    let betsWon = 0;
    
    userBets.forEach(bet => {
      if (bet.bet.status === 'RESOLVED' && bet.bet.outcome === bet.position) {
        betsWon++;
        // Simple calculation - normally would use odds from the bet
        const betAmount = parseFloat(bet.amount) / 1000000000; // Convert lamports to SOL
        totalWinnings += betAmount * 1.8; // Simplified payout calculation
      }
    });

    const winRate = userBets.length > 0 ? Math.round((betsWon / userBets.length) * 100) : 0;

    const profile = {
      walletAddress: address,
      displayName: `User_${address.substring(0, 6)}`, // Simple display name, could be customized
      avatar: null, // No avatar in the schema, could be added
      stats: {
        betsCreated: createdBets,
        betsJoined: userBets.length,
        winRate,
        totalWinnings,
      }
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
