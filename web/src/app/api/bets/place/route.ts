import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Parse request data
    const data = await req.json();
    
    // Log the incoming data
    console.log('Received bet placement data:', {
      betId: data.betId,
      position: data.position,
      amount: data.amount,
      walletAddress: data.walletAddress,
      onChainTxId: data.onChainTxId ? `${data.onChainTxId.substring(0, 10)}...` : 'none'
    });
    
    // Validate required fields
    if (!data.betId || !data.position || !data.amount || !data.walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }
    
    try {
      // Find or create user by wallet address
      let user = await prisma.user.findUnique({
        where: {
          walletAddress: data.walletAddress
        }
      });
      
      if (!user) {
        // Auto-create user by wallet address
        user = await prisma.user.create({
          data: {
            walletAddress: data.walletAddress,
          },
        });
      }
      
      // Find bet
      const bet = await prisma.bet.findUnique({
        where: {
          id: data.betId
        }
      });
      
      if (!bet) {
        return NextResponse.json({
          success: false,
          error: 'Bet not found'
        }, { status: 404 });
      }
      
      // Convert amount to lamports (as string)
      const amountInLamports = Math.round(data.amount * 1e9).toString();
      
      // Create user bet record
      const userBet = await prisma.userBet.create({
        data: {
          userId: user.id,
          betId: bet.id,
          betPublicKey: bet.betPublicKey,
          userBetPublicKey: data.onChainTxId || `generated-${Date.now()}`,
          amount: amountInLamports,
          position: data.position.toUpperCase() === 'YES' ? 'YES' : 'NO',
          isClaimed: false
        }
      });
      
      // Update pool amounts in the bet
      const currentYesPool = BigInt(bet.yesPool);
      const currentNoPool = BigInt(bet.noPool);
      const currentTotalPool = BigInt(bet.totalPool);
      const betAmountBigInt = BigInt(amountInLamports);
      
      const updatedBet = await prisma.bet.update({
        where: {
          id: bet.id
        },
        data: {
          yesPool: data.position.toLowerCase() === 'yes' 
            ? (currentYesPool + betAmountBigInt).toString() 
            : bet.yesPool,
          noPool: data.position.toLowerCase() === 'no' 
            ? (currentNoPool + betAmountBigInt).toString() 
            : bet.noPool,
          totalPool: (currentTotalPool + betAmountBigInt).toString()
        }
      });
      
      return NextResponse.json({
        success: true,
        userBet: {
          id: userBet.id,
          position: userBet.position,
          amount: parseFloat(userBet.amount) / 1e9
        }
      });
      
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json({ 
        success: false,
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error placing bet:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to place bet', 
      details: errorMessage 
    }, { status: 500 });
  }
}
