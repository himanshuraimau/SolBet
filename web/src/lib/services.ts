import { prisma } from './prisma';
import type { Bet, BetCategory, BetStatus } from '@/types/bet';
import type { UserProfile } from '@/types/user';
import type { WalletTransaction } from '@/types/wallet';

/**
 * User Services
 */
export async function getUserByWalletAddress(walletAddress: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (!user) return null;

  return {
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
}

export async function createUser(walletAddress: string, displayName?: string): Promise<UserProfile> {
  const user = await prisma.user.create({
    data: {
      walletAddress,
      displayName,
    },
  });

  return {
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
}

/**
 * Bet Services
 */
export async function getBets(
  category?: BetCategory,
  status?: BetStatus,
  page = 1,
  limit = 10
): Promise<{ bets: Bet[]; totalPages: number }> {
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
      },
    }),
    prisma.bet.count({ where }),
  ]);

  return {
    bets: bets.map(mapPrismaBetToAppBet),
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getBetById(id: string): Promise<Bet | null> {
  const bet = await prisma.bet.findUnique({
    where: { id },
    include: {
      participants: true,
    },
  });

  if (!bet) return null;

  return mapPrismaBetToAppBet(bet);
}

export async function createBet(data: {
  title: string;
  description: string;
  category: BetCategory;
  minimumBet: number;
  maximumBet: number;
  startTime: Date;
  endTime: Date;
  creatorWalletAddress: string;
}): Promise<Bet> {
  // Find the creator by wallet address
  const creator = await prisma.user.findUnique({
    where: { walletAddress: data.creatorWalletAddress },
  });

  if (!creator) {
    throw new Error('Creator not found');
  }

  // Create the bet
  const bet = await prisma.bet.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      minimumBet: data.minimumBet,
      maximumBet: data.maximumBet,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'active',
      creator: {
        connect: { id: creator.id },
      },
    },
    include: {
      participants: true,
    },
  });

  // Update user stats
  await prisma.user.update({
    where: { id: creator.id },
    data: {
      betsCreated: { increment: 1 },
    },
  });

  return mapPrismaBetToAppBet(bet);
}

export async function placeBet(
  betId: string,
  walletAddress: string,
  position: 'yes' | 'no',
  amount: number
): Promise<Bet> {
  // Find the user
  const user = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Transaction to ensure data consistency
  return await prisma.$transaction(async (tx) => {
    // Get the bet
    const bet = await tx.bet.findUnique({
      where: { id: betId },
      include: {
        participants: true,
      },
    });

    if (!bet) {
      throw new Error('Bet not found');
    }

    if (bet.status !== 'active') {
      throw new Error('Bet is not active');
    }

    if (amount < bet.minimumBet || amount > bet.maximumBet) {
      throw new Error(`Bet amount must be between ${bet.minimumBet} and ${bet.maximumBet}`);
    }

    // Create user bet participation (changed from participation to userBet)
    await tx.userBet.create({
      data: {
        position,
        amount,
        user: {
          connect: { id: user.id }
        },
        bet: {
          connect: { id: betId }
        }
      },
    });

    // Update bet pools
    const updatedBet = await tx.bet.update({
      where: { id: betId },
      data: {
        ...(position === 'yes'
          ? { yesPool: { increment: amount } }
          : { noPool: { increment: amount } }),
      },
      include: {
        participants: true,
      },
    });

    // Update user stats
    await tx.user.update({
      where: { id: user.id },
      data: {
        betsJoined: { increment: 1 },
      },
    });

    // Create transaction record - removed bet connection since it's not properly defined in schema
    await tx.transaction.create({
      data: {
        amount,
        type: 'bet',
        status: 'confirmed',
        betId: betId, // Use betId field directly
        user: {
          connect: { id: user.id },
        },
      },
    });

    // Removed activity creation since the model doesn't exist in schema

    return mapPrismaBetToAppBet(updatedBet);
  });
}

/**
 * Transaction Services
 */
export async function getWalletTransactions(walletAddress: string): Promise<WalletTransaction[]> {
  const user = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (!user) {
    return [];
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { timestamp: 'desc' },
  });

  return transactions.map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    timestamp: tx.timestamp,
    type: tx.type as WalletTransaction['type'],
    status: tx.status as WalletTransaction['status'],
  }));
}

/**
 * Helper functions
 */
function mapPrismaBetToAppBet(bet: any): Bet {
  // Calculate days left
  const now = new Date();
  const endTime = new Date(bet.endTime);
  const diffTime = endTime.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Get participant count
  const participantCount = bet.participants ? bet.participants.length : 0;

  return {
    id: bet.id,
    title: bet.title,
    description: bet.description,
    creator: bet.creatorId, // This should be mapped to wallet address in a real app
    category: bet.category as BetCategory,
    yesPool: bet.yesPool,
    noPool: bet.noPool,
    minimumBet: bet.minimumBet,
    maximumBet: bet.maximumBet,
    startTime: bet.startTime,
    endTime: bet.endTime,
    status: bet.status as BetStatus,
    participants: bet.participants.map((p: any) => ({
      walletAddress: p.userId, // This should be mapped to wallet address in a real app
      position: p.position as 'yes' | 'no',
      amount: p.amount,
      timestamp: p.timestamp,
    })),
    // Add the missing properties
    participantCount: participantCount,
    daysLeft: daysLeft
  };
}