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
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const walletAddress = searchParams.get('wallet');
    const tab = searchParams.get('tab') || 'all';
    
    const skip = (page - 1) * limit;
    
    // Build the where clause based on filters
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Handle different tabs
    if (tab === 'ending-soon') {
      where.endTime = {
        gt: new Date(),
      };
      where.status = 'active';
    } else if (tab === 'trending') {
      // For trending, we'll sort by total pool size
      where.status = 'active';
    } else if (tab === 'my-bets' && walletAddress) {
      // Find user by wallet address
      const user = await prisma.user.findUnique({
        where: { walletAddress },
        select: { id: true },
      });
      
      if (user) {
        // For My Bets tab, get bets where the user has participated
        const userBets = await prisma.userBet.findMany({
          where: { userId: user.id },
          select: { betId: true },
        });
        
        where.OR = [
          { id: { in: userBets.map(bet => bet.betId) } },
          { creatorId: user.id }
        ];
      } else {
        // If user not found, return empty result
        return NextResponse.json({
          bets: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          }
        });
      }
    }
    
    // Count total bets matching the criteria
    const total = await prisma.bet.count({ where });
    
    // Get the bets with sorting options
    let orderBy: any = {};
    
    if (tab === 'trending') {
      // Sort by total pool size for trending
      orderBy = {
        yesPool: 'desc',
      };
    } else if (tab === 'ending-soon') {
      // Sort by end time (soonest first) for ending soon
      orderBy = {
        endTime: 'asc',
      };
    } else {
      // Default sort by creation date (newest first)
      orderBy = {
        createdAt: 'desc',
      };
    }
    
    const bets = await prisma.bet.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        creator: {
          select: {
            walletAddress: true,
            displayName: true,
          },
        },
        _count: {
          select: { participants: true },
        },
      },
    });
    
    // Format the bets
    const formattedBets = bets.map(bet => ({
      id: bet.id,
      title: bet.title,
      description: bet.description,
      category: bet.category,
      creator: bet.creator.walletAddress,
      creatorName: bet.creator.displayName,
      yesPool: bet.yesPool,
      noPool: bet.noPool,
      totalPool: bet.yesPool + bet.noPool,
      minimumBet: bet.minimumBet,
      maximumBet: bet.maximumBet,
      startTime: bet.startTime,
      endTime: bet.endTime,
      status: bet.status,
      participantCount: bet._count.participants,
      daysLeft: Math.max(0, Math.ceil((new Date(bet.endTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      bets: formattedBets,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      }
    });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    );
  }
}