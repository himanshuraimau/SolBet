import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    
    // Pagination
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Filters
    const tab = url.searchParams.get('tab') || 'all';
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const walletAddress = url.searchParams.get('wallet') || '';
    
    // Define the base where clause for filtering
    let whereClause: any = {};
    
    // Apply status filter based on the tab
    if (tab === 'active') {
      whereClause.status = 'ACTIVE';
    } else if (tab === 'resolved') {
      whereClause.status = 'RESOLVED';
    } else if (tab === 'my-bets' && walletAddress) {
      // For "my bets" we need to filter by creator's wallet address
      whereClause.creator = {
        walletAddress: walletAddress
      };
    } else if (tab === 'ending-soon') {
      // Ending soon: active bets that expire within 24 hours
      const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      whereClause.status = 'ACTIVE';
      whereClause.expiresAt = {
        lte: oneDayFromNow,
        gt: new Date() // Not expired yet
      };
    } else if (tab === 'trending') {
      // Trending: active bets with highest totalPool
      whereClause.status = 'ACTIVE';
      // We'll sort by totalPool later
    }
    
    // Apply category filter if specified
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    // Apply search filter if specified
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Determine sort order based on tab
    let orderBy: any = {};
    
    if (tab === 'trending') {
      orderBy = { totalPool: 'desc' }; // Sort by total pool size
    } else if (tab === 'ending-soon') {
      orderBy = { expiresAt: 'asc' }; // Sort by closest expiration
    } else {
      orderBy = { createdAt: 'desc' }; // Default to newest first
    }
    
    // First, count total matches for pagination
    const totalItems = await prisma.bet.count({
      where: whereClause
    });
    
    const totalPages = Math.ceil(totalItems / limit);
    
    // Fetch the bets
    const bets = await prisma.bet.findMany({
      where: whereClause,
      include: {
        creator: true,
        userBets: {
          select: {
            userId: true,
            position: true,
            amount: true,
            createdAt: true,
            user: {
              select: {
                walletAddress: true
              }
            }
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });
    
    // Format the response to match the expected structure
    const formattedBets = bets.map(bet => ({
      id: bet.id,
      title: bet.title,
      description: bet.description,
      creatorAddress: bet.creator.walletAddress,
      betPublicKey: bet.betPublicKey,
      escrowAccount: bet.escrowAccount,
      category: bet.category,
      status: bet.status.toLowerCase(),
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
        position: userBet.position.toLowerCase(),
        amount: parseFloat(userBet.amount) / 1e9,
        timestamp: userBet.createdAt
      }))
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        bets: formattedBets,
        pagination: {
          page,
          pageSize: limit,
          totalItems,
          totalPages
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch bets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
