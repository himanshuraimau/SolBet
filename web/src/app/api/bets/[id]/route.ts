import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BetCategory, BetStatus } from '@/types/bet';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const bet = await prisma.bet.findUnique({
      where: { id },
      include: {
        participants: true,
        creator: {
          select: {
            walletAddress: true,
          },
        },
      },
    });

    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    // Format response to match frontend expectations
    const formattedBet = {
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
    };

    return NextResponse.json(formattedBet);
  } catch (error) {
    console.error('Error fetching bet:', error);
    return NextResponse.json(
      { message: 'Failed to fetch bet' },
      { status: 500 }
    );
  }
}
