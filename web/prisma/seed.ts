import { PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';
import { BetCategory, BetStatus } from '@/types/bet';

const prisma = new PrismaClient();

// Generate a random Solana address
const generateSolanaAddress = (): string => {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

async function main() {
  try {
    console.log('Starting seed script...');

    // Create users
    const userAddresses = [
      "8xrt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
      "5Gh7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj",
      "3xKm9Q7rT5XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
      "7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj",
      "9qRt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj"
    ];

    const userNames = [
      "Solana Enthusiast",
      "Crypto Whale",
      "Blockchain Guru",
      "DeFi Degen",
      "NFT Collector"
    ];

    const themes = ["dark", "light", "system", "dark", "light"];
    
    console.log('Creating users...');
    const users = [];
    
    for (let i = 0; i < userAddresses.length; i++) {
      const user = await prisma.user.upsert({
        where: { walletAddress: userAddresses[i] },
        update: {},
        create: {
          walletAddress: userAddresses[i],
          displayName: userNames[i],
          theme: themes[i],
          notifications: i % 2 === 0, // alternate true/false
          betsCreated: (i + 1) * 4,
          betsJoined: (i + 1) * 7,
          winRate: 50 + i * 5,
          totalWinnings: 100 + i * 100,
        },
      });
      
      users.push(user);
      console.log(`Created user: ${user.displayName}`);
    }

    // Create bets
    console.log('Creating bets...');
    
    const betData = [
      {
        title: "Will BTC reach $100k before July 2024?",
        description: "Bitcoin price to hit $100,000 USD on any major exchange before July 1st, 2024.",
        category: "crypto" as BetCategory,
        minimumBet: 0.1,
        maximumBet: 100,
        startTime: subDays(new Date(), 5),
        endTime: addDays(new Date(), 60),
        creatorId: users[0].id,
        yesPool: 1250,
        noPool: 850,
      },
      {
        title: "Will the Lakers win the NBA Championship?",
        description: "Los Angeles Lakers to win the 2024 NBA Championship.",
        category: "sports" as BetCategory,
        minimumBet: 0.5,
        maximumBet: 200,
        startTime: subDays(new Date(), 30),
        endTime: addDays(new Date(), 120),
        creatorId: users[1].id,
        yesPool: 2300,
        noPool: 3100,
      },
      {
        title: "Will Solana reach 500 TPS sustained?",
        description: "Solana network to maintain 500+ transactions per second for 7 consecutive days.",
        category: "crypto" as BetCategory,
        minimumBet: 0.2,
        maximumBet: 150,
        startTime: subDays(new Date(), 10),
        endTime: addDays(new Date(), 45),
        creatorId: users[2].id,
        yesPool: 4500,
        noPool: 1200,
      },
      {
        title: "Will it rain in Miami on July 4th?",
        description: "Precipitation of at least 0.1 inches recorded at Miami International Airport on July 4th, 2024.",
        category: "weather" as BetCategory,
        minimumBet: 0.1,
        maximumBet: 50,
        startTime: subDays(new Date(), 15),
        endTime: addDays(new Date(), 90),
        creatorId: users[3].id,
        yesPool: 750,
        noPool: 950,
      },
      {
        title: "Will ETH 2.0 launch before September 2024?",
        description: "Ethereum 2.0 mainnet to be fully operational before September 1st, 2024.",
        category: "crypto" as BetCategory,
        minimumBet: 0.3,
        maximumBet: 250,
        startTime: subDays(new Date(), 20),
        endTime: addDays(new Date(), 150),
        creatorId: users[4].id,
        yesPool: 3200,
        noPool: 2800,
      },
    ];

    const bets = [];
    
    for (const data of betData) {
      const bet = await prisma.bet.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          minimumBet: data.minimumBet,
          maximumBet: data.maximumBet,
          startTime: data.startTime,
          endTime: data.endTime,
          status: "active" as BetStatus,
          yesPool: data.yesPool,
          noPool: data.noPool,
          creator: {
            connect: { id: data.creatorId },
          },
        },
      });
      
      bets.push(bet);
      console.log(`Created bet: ${bet.title}`);
    }

    // Create participations
    console.log('Creating participations...');
    
    for (const bet of bets) {
      // Each bet has 3-5 participants
      const participantCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < participantCount; i++) {
        try {
          // Choose a random user (but not the creator)
          const availableUsers = users.filter(user => user.id !== bet.creatorId);
          const user = availableUsers[Math.floor(Math.random() * availableUsers.length)];
          
          // Random position and amount
          const position = Math.random() > 0.5 ? 'yes' : 'no';
          const amount = parseFloat((Math.random() * (bet.maximumBet - bet.minimumBet) + bet.minimumBet).toFixed(2));
          
          // Check if participation already exists
          const existingParticipation = await prisma.participation.findFirst({
            where: {
              betId: bet.id,
              userId: user.id,
              position: position,
            },
          });
          
          if (existingParticipation) {
            console.log(`Participation already exists for ${user.displayName} on "${bet.title}" for position ${position}`);
            continue;
          }
          
          // Create participation
          const participation = await prisma.participation.create({
            data: {
              position,
              amount,
              bet: {
                connect: { id: bet.id },
              },
              user: {
                connect: { id: user.id },
              },
            },
          });
          
          console.log(`Created participation: ${user.displayName} bet ${amount} on ${position} for "${bet.title}"`);
          
          // Create transaction for this participation
          await prisma.transaction.create({
            data: {
              amount,
              type: 'bet',
              status: 'confirmed',
              user: {
                connect: { id: user.id },
              },
              bet: {
                connect: { id: bet.id },
              },
            },
          });
          
          // Create activity for this participation
          await prisma.activity.create({
            data: {
              type: 'bet_placed',
              title: `placed a bet on '${bet.title}'`,
              amount,
              user: {
                connect: { id: user.id },
              },
              bet: {
                connect: { id: bet.id },
              },
            },
          });
        } catch (error) {
          console.error(`Error creating participation: ${error}`);
          // Continue with the next iteration
          continue;
        }
      }
    }

    // Create additional transactions
    console.log('Creating additional transactions...');
    
    for (const user of users) {
      // Create 2 random transactions (deposit, withdrawal) for each user
      const txTypes = ['deposit', 'withdrawal'];
      
      for (const type of txTypes) {
        const amount = parseFloat((Math.random() * 50 + 5).toFixed(2));
        
        await prisma.transaction.create({
          data: {
            amount,
            type,
            status: 'confirmed',
            user: {
              connect: { id: user.id },
            },
          },
        });
        
        // Create activity for this transaction
        await prisma.activity.create({
          data: {
            type: type === 'deposit' ? 'deposit' : 'withdrawal',
            title: type === 'deposit' ? 'deposited funds to wallet' : 'withdrew funds from wallet',
            amount,
            user: {
              connect: { id: user.id },
            },
          },
        });
        
        console.log(`Created ${type} transaction for ${user.displayName}: ${amount}`);
      }
    }

    // Create leaderboard entries
    console.log('Creating leaderboard entries...');
    
    // Sort users by totalWinnings to determine ranks
    const sortedUsers = [...users].sort((a, b) => b.totalWinnings - a.totalWinnings);
    
    // Create weekly, monthly, and all-time leaderboard entries
    const periods = ['weekly', 'monthly', 'allTime'];
    
    for (const period of periods) {
      for (let i = 0; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];
        const rank = i + 1;
        
        // Adjust winnings based on period (weekly < monthly < allTime)
        let winnings = user.totalWinnings;
        if (period === 'weekly') winnings = winnings * 0.2;
        if (period === 'monthly') winnings = winnings * 0.6;
        
        // Calculate week number and month for weekly/monthly leaderboards
        const now = new Date();
        const weekNumber = period === 'weekly' ? Math.floor(now.getDate() / 7) + 1 : null;
        const month = period === 'monthly' ? now.getMonth() : null;
        const year = (period === 'weekly' || period === 'monthly') ? now.getFullYear() : null;
        
        await prisma.leaderboardEntry.create({
          data: {
            rank,
            winnings,
            winRate: user.winRate,
            period,
            weekNumber,
            month,
            year,
            user: {
              connect: { id: user.id },
            },
          },
        });
        
        console.log(`Created ${period} leaderboard entry for ${user.displayName}: rank ${rank}`);
      }
    }

    console.log('Seed script completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();