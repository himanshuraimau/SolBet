import type { Bet, BetCategory, BetStatus, Participant } from "@/types/bet"
import type { UserProfile } from "@/types/user"
import type { WalletInfo, WalletTransaction } from "@/types/wallet"
import { addDays, subDays, subHours, subMinutes } from "date-fns"

// Generate a random Solana address
const generateSolanaAddress = (): string => {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  let result = ""
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate random participants for a bet
const generateParticipants = (count: number): Participant[] => {
  const participants: Participant[] = []
  for (let i = 0; i < count; i++) {
    participants.push({
      walletAddress: generateSolanaAddress(),
      position: Math.random() > 0.5 ? "yes" : "no",
      amount: Number.parseFloat((Math.random() * 10 + 0.1).toFixed(2)),
      timestamp: subHours(new Date(), Math.floor(Math.random() * 72)),
    })
  }
  return participants
}

// Mock Bets
export const mockBets: Bet[] = [
  {
    id: "bet-1",
    title: "Will BTC reach $100k before July 2024?",
    description: "Bitcoin price to hit $100,000 USD on any major exchange before July 1st, 2024.",
    creator: "8xrt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    category: "crypto",
    yesPool: 1250,
    noPool: 850,
    minimumBet: 0.1,
    maximumBet: 100,
    startTime: subDays(new Date(), 5),
    endTime: addDays(new Date(), 60),
    status: "active",
    participants: generateParticipants(12),
  },
  {
    id: "bet-2",
    title: "Will the Lakers win the NBA Championship?",
    description: "Los Angeles Lakers to win the 2024 NBA Championship.",
    creator: "5Gh7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj",
    category: "sports",
    yesPool: 2300,
    noPool: 3100,
    minimumBet: 0.5,
    maximumBet: 200,
    startTime: subDays(new Date(), 30),
    endTime: addDays(new Date(), 120),
    status: "active",
    participants: generateParticipants(28),
  },
  {
    id: "bet-3",
    title: "Will Solana reach 500 TPS sustained?",
    description: "Solana network to maintain 500+ transactions per second for 7 consecutive days.",
    creator: "3xKm9Q7rT5XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    category: "crypto",
    yesPool: 4500,
    noPool: 1200,
    minimumBet: 0.2,
    maximumBet: 150,
    startTime: subDays(new Date(), 10),
    endTime: addDays(new Date(), 45),
    status: "active",
    participants: generateParticipants(35),
  },
  {
    id: "bet-4",
    title: "Will it rain in Miami on July 4th?",
    description: "Precipitation of at least 0.1 inches recorded at Miami International Airport on July 4th, 2024.",
    creator: "7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj",
    category: "weather",
    yesPool: 750,
    noPool: 950,
    minimumBet: 0.1,
    maximumBet: 50,
    startTime: subDays(new Date(), 15),
    endTime: addDays(new Date(), 90),
    status: "active",
    participants: generateParticipants(18),
  },
  {
    id: "bet-5",
    title: "Will ETH 2.0 launch before September 2024?",
    description: "Ethereum 2.0 mainnet to be fully operational before September 1st, 2024.",
    creator: "9qRt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    category: "crypto",
    yesPool: 3200,
    noPool: 2800,
    minimumBet: 0.3,
    maximumBet: 250,
    startTime: subDays(new Date(), 20),
    endTime: addDays(new Date(), 150),
    status: "active",
    participants: generateParticipants(42),
  },
  {
    id: "bet-6",
    title: "Will SpaceX reach Mars before 2025?",
    description: "SpaceX to successfully land a spacecraft on Mars before January 1st, 2025.",
    creator: "8xrt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    category: "other",
    yesPool: 1800,
    noPool: 4200,
    minimumBet: 0.5,
    maximumBet: 300,
    startTime: subDays(new Date(), 60),
    endTime: addDays(new Date(), 365),
    status: "active",
    participants: generateParticipants(25),
  },
  {
    id: "bet-7",
    title: "Will Apple release a foldable iPhone in 2024?",
    description: "Apple to officially announce and release a foldable iPhone model in 2024.",
    creator: "5Gh7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj",
    category: "entertainment",
    yesPool: 980,
    noPool: 3500,
    minimumBet: 0.2,
    maximumBet: 100,
    startTime: subDays(new Date(), 25),
    endTime: addDays(new Date(), 300),
    status: "active",
    participants: generateParticipants(30),
  },
  {
    id: "bet-8",
    title: "Will the US election have over 65% turnout?",
    description: "US Presidential election in 2024 to have over 65% eligible voter turnout.",
    creator: "3xKm9Q7rT5XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    category: "politics",
    yesPool: 2100,
    noPool: 1900,
    minimumBet: 0.3,
    maximumBet: 150,
    startTime: subDays(new Date(), 40),
    endTime: addDays(new Date(), 270),
    status: "active",
    participants: generateParticipants(38),
  },
]

// Mock User Profiles
export const mockUsers: UserProfile[] = [
  {
    walletAddress: "8xrt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    displayName: "Solana Enthusiast",
    avatar: undefined,
    stats: {
      betsCreated: 12,
      betsJoined: 28,
      winRate: 64,
      totalWinnings: 342.5,
    },
    preferences: {
      theme: "dark",
      notifications: true,
    },
  },
  {
    walletAddress: "5Gh7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj",
    displayName: "Crypto Whale",
    avatar: undefined,
    stats: {
      betsCreated: 24,
      betsJoined: 56,
      winRate: 71,
      totalWinnings: 782.4,
    },
    preferences: {
      theme: "light",
      notifications: true,
    },
  },
  {
    walletAddress: "3xKm9Q7rT5XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    displayName: "Blockchain Guru",
    avatar: undefined,
    stats: {
      betsCreated: 18,
      betsJoined: 42,
      winRate: 59,
      totalWinnings: 487.3,
    },
    preferences: {
      theme: "system",
      notifications: false,
    },
  },
  {
    walletAddress: "7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj",
    displayName: "DeFi Degen",
    avatar: undefined,
    stats: {
      betsCreated: 8,
      betsJoined: 36,
      winRate: 55,
      totalWinnings: 356.9,
    },
    preferences: {
      theme: "dark",
      notifications: true,
    },
  },
  {
    walletAddress: "9qRt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    displayName: "NFT Collector",
    avatar: undefined,
    stats: {
      betsCreated: 32,
      betsJoined: 64,
      winRate: 63,
      totalWinnings: 521.8,
    },
    preferences: {
      theme: "light",
      notifications: false,
    },
  },
]

// Mock Wallet Info
export const mockWalletInfo: WalletInfo = {
  address: "8xrt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
  publicKey: "8xrt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
  balance: 145.72,
  provider: "Phantom",
  connected: true,
}

// Mock Wallet Transactions
export const mockTransactions: WalletTransaction[] = [
  {
    id: "tx1",
    amount: 5.2,
    timestamp: subHours(new Date(), 2),
    type: "bet",
    status: "confirmed",
  },
  {
    id: "tx2",
    amount: 10.0,
    timestamp: subDays(new Date(), 1),
    type: "deposit",
    status: "confirmed",
  },
  {
    id: "tx3",
    amount: 3.7,
    timestamp: subDays(new Date(), 2),
    type: "winnings",
    status: "confirmed",
  },
  {
    id: "tx4",
    amount: 2.5,
    timestamp: subDays(new Date(), 3),
    type: "bet",
    status: "confirmed",
  },
  {
    id: "tx5",
    amount: 15.0,
    timestamp: subDays(new Date(), 5),
    type: "deposit",
    status: "confirmed",
  },
  {
    id: "tx6",
    amount: 8.3,
    timestamp: subDays(new Date(), 7),
    type: "withdrawal",
    status: "confirmed",
  },
]

// Mock Community Activity
export const mockCommunityActivity = [
  {
    id: "act1",
    type: "bet_placed",
    title: "placed a bet on 'Will BTC reach $100k before July 2024?'",
    amount: 5.2,
    timestamp: subMinutes(new Date(), 30),
    user: {
      address: "8xrt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    },
  },
  {
    id: "act2",
    type: "bet_won",
    title: "won bet on 'Will the Lakers win against the Celtics?'",
    amount: 12.8,
    timestamp: subHours(new Date(), 3),
    user: {
      address: "5Gh7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj",
    },
  },
  {
    id: "act3",
    type: "bet_lost",
    title: "lost bet on 'Will it rain in Miami on May 15th?'",
    amount: 2.5,
    timestamp: subDays(new Date(), 1),
    user: {
      address: "3xKm9Q7rT5XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    },
  },
  {
    id: "act4",
    type: "withdrawal",
    title: "withdrew funds to wallet",
    amount: 20.0,
    timestamp: subDays(new Date(), 2),
    user: {
      address: "7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj",
    },
  },
  {
    id: "act5",
    type: "payout",
    title: "received payout from 'Will ETH merge happen in September?'",
    amount: 15.3,
    timestamp: subDays(new Date(), 3),
    user: {
      address: "9qRt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj",
    },
  },
]

// Mock Leaderboard Data
export const mockLeaderboard = {
  weekly: [
    { rank: 1, address: "8xrt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj", winnings: 245.8, winRate: 78 },
    { rank: 2, address: "5Gh7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj", winnings: 187.3, winRate: 65 },
    { rank: 3, address: "3xKm9Q7rT5XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj", winnings: 156.2, winRate: 72 },
    { rank: 4, address: "7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj", winnings: 124.5, winRate: 58 },
    { rank: 5, address: "9qRt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj", winnings: 98.7, winRate: 62 },
  ],
  monthly: [
    { rank: 1, address: "5Gh7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj", winnings: 782.4, winRate: 71 },
    { rank: 2, address: "8xrt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj", winnings: 645.2, winRate: 68 },
    { rank: 3, address: "9qRt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj", winnings: 521.8, winRate: 64 },
    { rank: 4, address: "3xKm9Q7rT5XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj", winnings: 487.3, winRate: 59 },
    { rank: 5, address: "7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj", winnings: 356.9, winRate: 55 },
  ],
  allTime: [
    { rank: 1, address: "5Gh7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj", winnings: 12458.6, winRate: 67 },
    { rank: 2, address: "9qRt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj", winnings: 8745.2, winRate: 63 },
    { rank: 3, address: "8xrt45YrT9XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj", winnings: 7652.8, winRate: 61 },
    { rank: 4, address: "3xKm9Q7rT5XxYMHV8DYGQevNGnQmFurTqwN4jvMQvSPj", winnings: 6548.3, winRate: 58 },
    { rank: 5, address: "7Lk3JvYD8nK9Q2Vw7LJ6PJg6Fz9nKM7oUL5EcbSPj", winnings: 5421.7, winRate: 54 },
  ],
}

// Mock Performance Stats
export const mockPerformanceStats = {
  "1d": {
    winnings: 12.5,
    losses: 5.2,
    netProfit: 7.3,
    winRate: 65,
    betsPlaced: 4,
    avgBetSize: 4.4,
  },
  "7d": {
    winnings: 87.3,
    losses: 42.8,
    netProfit: 44.5,
    winRate: 58,
    betsPlaced: 15,
    avgBetSize: 8.7,
  },
  "30d": {
    winnings: 342.5,
    losses: 198.2,
    netProfit: 144.3,
    winRate: 64,
    betsPlaced: 28,
    avgBetSize: 19.3,
  },
  all: {
    winnings: 1245.8,
    losses: 903.3,
    netProfit: 342.5,
    winRate: 57,
    betsPlaced: 112,
    avgBetSize: 19.2,
  },
}

// Helper functions to simulate API calls
export const fetchBets = async (
  category?: BetCategory,
  status?: BetStatus,
  page = 1,
  limit = 10,
): Promise<{ bets: Bet[]; totalPages: number }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Filter by category if provided
  let filteredBets = category ? mockBets.filter((bet) => bet.category === category) : [...mockBets]

  // Filter by status if provided
  filteredBets = status ? filteredBets.filter((bet) => bet.status === status) : filteredBets

  // Paginate
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedBets = filteredBets.slice(startIndex, endIndex)

  return {
    bets: paginatedBets,
    totalPages: Math.ceil(filteredBets.length / limit),
  }
}

export const fetchBetById = async (id: string): Promise<Bet | undefined> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockBets.find((bet) => bet.id === id)
}

export const fetchUserProfile = async (address: string): Promise<UserProfile | undefined> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockUsers.find((user) => user.walletAddress === address)
}

export const fetchWalletTransactions = async (address: string): Promise<WalletTransaction[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockTransactions
}

export const fetchUserStats = async (address: string, timeFrame: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockPerformanceStats[timeFrame as keyof typeof mockPerformanceStats]
}

export const fetchLeaderboard = async (period: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockLeaderboard[period as keyof typeof mockLeaderboard]
}

export const fetchCommunityActivity = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockCommunityActivity
}

export const placeBet = async (
  betId: string,
  position: "yes" | "no",
  amount: number,
  walletAddress: string,
): Promise<Bet> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const bet = mockBets.find((b) => b.id === betId)
  if (!bet) throw new Error("Bet not found")

  // Create a deep copy of the bet to avoid mutating the original
  const updatedBet = JSON.parse(JSON.stringify(bet)) as Bet

  // Update the bet pools
  if (position === "yes") {
    updatedBet.yesPool += amount
  } else {
    updatedBet.noPool += amount
  }

  // Add the participant
  updatedBet.participants.unshift({
    walletAddress,
    position,
    amount,
    timestamp: new Date(),
  })

  // In a real app, we would update the mockBets array here
  // For now, we just return the updated bet
  return updatedBet
}

export const createBet = async (params: {
  title: string
  description: string
  category: BetCategory
  minimumBet: number
  maximumBet: number
  endTime: Date
  creator: string
}): Promise<Bet> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Create a new bet
  const newBet: Bet = {
    id: `bet-${Math.random().toString(36).substring(2, 9)}`,
    title: params.title,
    description: params.description,
    creator: params.creator,
    category: params.category,
    yesPool: 0,
    noPool: 0,
    minimumBet: params.minimumBet,
    maximumBet: params.maximumBet,
    startTime: new Date(),
    endTime: params.endTime,
    status: "active",
    participants: [],
  }

  // In a real app, we would add the new bet to the mockBets array here
  // For now, we just return the new bet
  return newBet
}
