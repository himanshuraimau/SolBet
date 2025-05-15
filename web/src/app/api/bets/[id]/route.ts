import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the ID parameter - properly awaiting params to address Next.js warning
    const params = await context.params;
    const betId = params.id;
    
    // Fetch the bet from the database
    const bet = await prisma.bet.findUnique({
      where: {
        id: betId,
      },
      include: {
        creator: true,
        userBets: {
          select: {
            userId: true,
            position: true,
            amount: true,
            createdAt: true,
            userBetPublicKey: true,
            user: {
              select: {
                walletAddress: true
              }
            }
          }
        }
      },
    });
    
    if (!bet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Bet not found' 
      }, { status: 404 });
    }
    
    // Format the bet data
    const formattedBet = {
      id: bet.id,
      title: bet.title,
      description: bet.description,
      creatorAddress: bet.creator.walletAddress,
      betPublicKey: bet.betPublicKey,
      escrowAccount: bet.escrowAccount,
      category: bet.category,
      status: bet.status.toLowerCase(),
      outcome: bet.outcome?.toLowerCase() || null,
      yesPool: parseFloat(bet.yesPool) / 1e9, // Convert from lamports to SOL
      noPool: parseFloat(bet.noPool) / 1e9,
      totalPool: parseFloat(bet.totalPool) / 1e9,
      minimumBet: parseFloat(bet.minBetAmount) / 1e9,
      maximumBet: parseFloat(bet.maxBetAmount) / 1e9,
      expiresAt: bet.expiresAt.toISOString(),
      endTime: bet.expiresAt,
      startTime: bet.createdAt,
      daysLeft: Math.max(0, Math.ceil((bet.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      participants: bet.userBets.map(userBet => ({
        walletAddress: userBet.user.walletAddress,
        position: userBet.position.toLowerCase() === "yes" ? "yes" : "no", // Ensure it's either "yes" or "no"
        amount: parseFloat(userBet.amount) / 1e9,
        timestamp: userBet.createdAt,
        onChainUserBetAccount: userBet.userBetPublicKey
      }))
    };
    
    return NextResponse.json({
      success: true,
      bet: formattedBet
    });
    
  } catch (error) {
    console.error('Error fetching bet:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch bet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
