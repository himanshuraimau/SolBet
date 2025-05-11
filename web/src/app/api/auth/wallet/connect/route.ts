import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WalletConnectionRequest {
  walletAddress: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WalletConnectionRequest = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find existing user or create a new one
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      // First time connection - create new user
      user = await prisma.user.create({
        data: {
          walletAddress,
          // Default values will be applied from the schema
        },
      });

      console.log(`New user created with wallet address: ${walletAddress}`);
    } else {
      console.log(`Existing user found with wallet address: ${walletAddress}`);
    }

    // Format the user data to match our UserProfile type
    const userProfile = {
      walletAddress: user.walletAddress,
      displayName: user.displayName || undefined,
      avatar: user.avatar || undefined,
      stats: {
        betsCreated: user.betsCreated,
        betsJoined: user.betsJoined,
        winRate: user.winRate,
        totalWinnings: user.totalWinnings,
      },
      preferences: {
        theme: user.theme as "light" | "dark" | "system",
        notifications: user.notifications,
      },
    };

    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error("Error connecting wallet:", error);
    return NextResponse.json(
      { error: "Failed to process wallet connection" },
      { status: 500 }
    );
  }
}