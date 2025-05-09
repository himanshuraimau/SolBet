import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BetCategory, BetStatus } from '@/types/bet';

// GET /api/bets - List all bets with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as BetCategory | null;
    const status = searchParams.get('status') as BetStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where = {
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
    };

    const [bets, totalCount] = await Promise.all([
      prisma.bet.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          participants: true,
          creator: {
            select: {
              walletAddress: true,
            },
          },
        },
      }),
      prisma.bet.count({ where }),
    ]);

    // Map prisma response to match expected format
    const formattedBets = bets.map(bet => ({
      id: bet.id,
      title: bet.title,
      description: bet.description,
      creator: bet.creator.walletAddress,
      category: bet.category as BetCategory,
      yesPool: bet.yesPool,
      noPool: bet.noPool,
      minimumBet: bet.minimumBet,
      maximumBet: bet.maximumBet,
      startTime: bet.startTime,
      endTime: bet.endTime,
      status: bet.status as BetStatus,
      participants: bet.participants.map(p => ({
        walletAddress: p.userId, // Need to join with user to get walletAddress
        position: p.position as 'yes' | 'no',
        amount: p.amount,
        timestamp: p.timestamp,
      })),
    }));

    return NextResponse.json({
      bets: formattedBets,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { message: 'Failed to fetch bets' },
      { status: 500 }
    );
  }
}

// POST /api/bets - Create a new bet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.category || !body.creator) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newBet = await createBet({
      title: body.title,
      description: body.description,
      category: body.category,
      minimumBet: body.minimumBet || 0.1,
      maximumBet: body.maximumBet || 100,
      endTime: new Date(body.endTime || Date.now() + 7 * 24 * 60 * 60 * 1000),
      creator: body.creator,
    });

    return NextResponse.json(newBet, { status: 201 });
  } catch (error) {
    console.error('Error creating bet:', error);
    return NextResponse.json({ error: 'Failed to create bet' }, { status: 500 });
  }
}
