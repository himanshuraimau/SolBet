import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Need to await params in dynamic API routes
    const { id } = await params;

    // Fetch the bet by ID
    const bet = await prisma.bet.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            walletAddress: true,
            displayName: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                walletAddress: true,
              },
            },
          },
        },
      },
    });

    if (!bet) {
      return NextResponse.json(
        { error: "Bet not found" },
        { status: 404 }
      );
    }

    // Format the response
    const formattedBet = {
      id: bet.id,
      title: bet.title,
      description: bet.description,
      category: bet.category,
      creator: bet.creator.walletAddress,
      creatorName: bet.creator.displayName,
      yesPool: bet.yesPool,
      noPool: bet.noPool,
      minimumBet: bet.minimumBet,
      maximumBet: bet.maximumBet,
      startTime: bet.startTime,
      endTime: bet.endTime,
      status: bet.status,
      participants: bet.participants.map((p) => ({
        walletAddress: p.user.walletAddress,
        position: p.position,
        amount: p.amount,
        timestamp: p.timestamp,
      })),
    };

    return NextResponse.json(formattedBet);
  } catch (error) {
    console.error("Error fetching bet:", error);
    return NextResponse.json(
      { error: "Failed to fetch bet" },
      { status: 500 }
    );
  }
}
