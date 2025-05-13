import { UserProfile } from "@/types/wallet";
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
});

/**
 * Fetches user betting statistics
 * @param walletAddress Wallet address
 * @returns User betting statistics
 */
export async function fetchUserBetStats(walletAddress: string) {
  try {
    const response = await api.get(`/user/${walletAddress}/bet-stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user bet stats:", error);
    // Fallback to mock data
    return {
      betsCreated: Math.floor(Math.random() * 10),
      betsJoined: Math.floor(Math.random() * 15),
      winRate: Math.floor(Math.random() * 100),
      totalWinnings: Math.random() * 20
    };
  }
}

/**
 * Fetches user profile data from the API
 * @param address Wallet address
 * @returns User profile data
 */
export async function fetchUserProfile(address: string): Promise<UserProfile> {
  try {
    const response = await api.get(`/users/${address}`);
    
    if (response.data) {
      // If we have a response from the API, use it
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
  
  // If the API fails or isn't implemented yet, use mock data
  // Mock API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get bet stats
  const betStats = await fetchUserBetStats(address);
  
  // Return mock profile data with actual bet stats if available
  return {
    id: `user-${address.substring(0, 8)}`,
    walletAddress: address,
    displayName: `Solana User ${address.substring(0, 4)}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in past 30 days
    stats: betStats
  };
}

/**
 * Updates user profile data in the API
 * @param address Wallet address
 * @param profileData Partial profile data to update
 * @returns Updated user profile
 */
export async function updateProfile(address: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  // In a production app, you would send data to your API
  // For demo purposes, we'll simulate a successful update
  
  // Mock API call delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Get current profile data
  const currentProfile = await fetchUserProfile(address);
  
  // Return updated profile
  return {
    ...currentProfile,
    ...profileData,
    // Ensure these fields aren't overwritten
    id: currentProfile.id,
    walletAddress: address,
    createdAt: currentProfile.createdAt
  };
}

/**
 * Verifies a wallet signature to authenticate the user
 * @param address Wallet address
 * @param signature Signed message signature
 * @param message Original message that was signed
 * @returns Whether signature is valid
 */
export async function verifyWalletSignature(
  address: string, 
  signature: string, 
  message: string
): Promise<boolean> {
  // In a production app, you would verify the signature on your server
  // For demo purposes, we'll simulate a successful verification
  
  // Mock API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Always return true for demo
  return true;
}

/**
 * Fetches user wallet activity like deposits, withdrawals etc.
 * @param address Wallet address
 * @returns Array of wallet transactions
 */
export async function fetchWalletActivity(walletAddress: string): Promise<any[]> {
  try {
    const response = await api.get(`/users/${walletAddress}/transactions`);
    
    // Transform the response data to ensure it has all required fields
    return response.data.map((tx: any) => ({
      id: tx.id,
      amount: tx.amount,
      timestamp: new Date(tx.timestamp || Date.now()),
      type: tx.type || 'deposit',
      // Ensure status is always present
      status: tx.status || 'completed'
    }));
  } catch (error) {
    console.error("Error fetching wallet activity:", error);
    return [];
  }
}

/**
 * Fetches user activity including bets, transactions, etc.
 * @param walletAddress Wallet address
 * @param limit Number of items to fetch
 * @returns Array of user activity items
 */
export async function fetchUserActivity(walletAddress: string, limit: number = 5): Promise<any[]> {
  try {
    const response = await api.get(`/users/${walletAddress}/activity?limit=${limit}`);
    
    // If the API endpoint isn't implemented yet, fall back to wallet activity
    if (!response.data) {
      const transactions = await fetchWalletActivity(walletAddress);
      return transactions.slice(0, limit).map(tx => ({
        id: tx.id,
        type: tx.type,
        title: `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}`,
        amount: tx.amount,
        timestamp: tx.timestamp,
        betId: null
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching user activity:", error);
    // Fallback to mock data if API fails
    return generateMockUserActivity(walletAddress, limit);
  }
}

/**
 * Generates mock user activity data for development/testing
 * @param walletAddress Wallet address
 * @param limit Number of items to generate
 * @returns Array of mock activity items
 */
function generateMockUserActivity(walletAddress: string, limit: number): any[] {
  const activityTypes = ['bet_placed', 'bet_won', 'bet_lost', 'deposit', 'withdrawal'];
  const betIds = Array.from({ length: 5 }, (_, i) => `bet-${i}`);
  
  return Array.from({ length: limit }, (_, i) => {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const amount = Math.random() * 5 + 0.1; // 0.1 to 5.1 SOL
    const timestamp = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000); // Last 2 weeks
    const isBetRelated = type.startsWith('bet_');
    const betId = isBetRelated ? betIds[Math.floor(Math.random() * betIds.length)] : null;
    
    let title = '';
    switch(type) {
      case 'bet_placed': title = 'Placed a bet'; break;
      case 'bet_won': title = 'Won a bet'; break;
      case 'bet_lost': title = 'Lost a bet'; break;
      case 'deposit': title = 'Deposited funds'; break;
      case 'withdrawal': title = 'Withdrew funds'; break;
    }
    
    return {
      id: `activity-${i}`,
      type,
      title,
      amount,
      timestamp: timestamp.toISOString(),
      betId
    };
  });
}
