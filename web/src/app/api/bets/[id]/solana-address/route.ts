import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the ID parameter
    const params = await context.params;
    const betId = params.id;
    
    // Fetch the bet's Solana addresses from the database
    const bet = await prisma.bet.findUnique({
      where: {
        id: betId,
      },
      select: {
        betPublicKey: true,
        escrowAccount: true
      }
    });
    
    if (!bet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Bet not found' 
      }, { status: 404 });
    }
    
    // Return the Solana addresses
    return NextResponse.json({
      success: true,
      betAccount: bet.betPublicKey,
      escrowAccount: bet.escrowAccount
    });
    
  } catch (error) {
    console.error('Error fetching Solana addresses:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Solana addresses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
