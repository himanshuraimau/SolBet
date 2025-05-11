import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the wallet address from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("address");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find the user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Format the user data to match our UserProfile type
    const userProfile = {
      walletAddress: user.walletAddress,
      displayName: user.displayName || undefined,
      avatar: user.avatar || undefined,
      createdAt: user.createdAt, // Include createdAt field
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

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}