import { UserProfile } from "@/types/wallet";
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
});

/**
 * Fetches user profile data from the API
 * @param address Wallet address
 * @returns User profile data
 */
export async function fetchUserProfile(address: string): Promise<UserProfile> {
  // In a production app, you would fetch from your API
  // For demo purposes, we'll return mock data
  
  // Mock API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock profile data
  return {
    id: `user-${address.substring(0, 8)}`,
    walletAddress: address,
    displayName: `Solana User ${address.substring(0, 4)}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in past 30 days
    stats: {
      betsCreated: Math.floor(Math.random() * 10),
      betsJoined: Math.floor(Math.random() * 15),
      winRate: Math.floor(Math.random() * 100),
      totalWinnings: Math.random() * 20
    }
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
    console.error('Error fetching wallet activity:', error);
    return [];
  }
}
