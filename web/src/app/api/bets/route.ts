import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CreateBetRequest {
  title: string;
  description: string;
  category: string;
  minimumBet: number;
  maximumBet: number;
  endTime: Date;
  creator: string; // Wallet address
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: CreateBetRequest = await request.json();
    
    // Validate required fields
    if (!body.title || !body.category || !body.creator || !body.endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amounts
    if (body.minimumBet <= 0 || body.maximumBet <= 0 || body.minimumBet > body.maximumBet) {
      return NextResponse.json(
        { error: "Invalid bet amounts" },
        { status: 400 }
      );
    }

    // Check if endTime is in the future
    const now = new Date();
    const endTime = new Date(body.endTime);
    if (endTime <= now) {
      return NextResponse.json(
        { error: "End time must be in the future" },
        { status: 400 }
      );
    }

    // Find the user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress: body.creator },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please connect your wallet first." },
        { status: 404 }
      );
    }

    // Create the bet in the database
    const bet = await prisma.bet.create({
      data: {
        title: body.title,
        description: body.description || "",
        category: body.category,
        minimumBet: body.minimumBet,
        maximumBet: body.maximumBet,
        startTime: now,
        endTime: endTime,
        yesPool: 0,
        noPool: 0,
        status: "active",
        creatorId: user.id,
      },
      include: {
        creator: {
          select: {
            walletAddress: true,
            displayName: true,
          },
        },
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        betsCreated: { increment: 1 },
      },
    });

    // Format the bet for the response
    const formattedBet = {
      id: bet.id,
      title: bet.title,
      description: bet.description,
      category: bet.category,
      creator: user.walletAddress,
      creatorName: user.displayName,
      yesPool: bet.yesPool,
      noPool: bet.noPool,
      minimumBet: bet.minimumBet,
      maximumBet: bet.maximumBet,
      startTime: bet.startTime,
      endTime: bet.endTime,
      status: bet.status,
      participants: [],
    };

    return NextResponse.json(formattedBet);
  } catch (error) {
    console.error("Error creating bet:", error);
    return NextResponse.json(
      { error: "Failed to create bet" },
      { status: 500 }
    );
  }
}

// Add GET handler to retrieve bets with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build the query filter
    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    // Get total count for pagination
    const totalCount = await prisma.bet.count({
      where: filter
    });
    
    // Fetch bets with pagination
    const bets = await prisma.bet.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        creator: {
          select: {
            walletAddress: true,
            displayName: true,
          }
        },
        participants: {
          include: {
            user: {
              select: {
                walletAddress: true,
              }
            }
          }
        },
      }
    });
    
    // Format the response
    const formattedBets = bets.map(bet => ({
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
      participants: bet.participants.map(p => ({
        walletAddress: p.user.walletAddress,
        position: p.position,
        amount: p.amount,
        timestamp: p.timestamp,
      })),
    }));
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      bets: formattedBets,
      totalPages,
      currentPage: page,
      totalBets: totalCount,
    });
  } catch (error) {
    console.error("Error fetching bets:", error);
    return NextResponse.json(
      { error: "Failed to fetch bets" },
      { status: 500 }
    );
  }
}