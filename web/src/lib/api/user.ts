import { UserProfile } from "@/types/wallet";

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
export async function fetchWalletActivity(address: string) {
  // In a production app, you would fetch from your API
  // For demo purposes, we'll return mock data
  
  // Mock API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Return mock wallet activity
  return [
    {
      id: 'tx1',
      type: 'deposit',
      amount: 2.5,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: 'tx2',
      type: 'bet',
      amount: 0.5,
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    },
    {
      id: 'tx3',
      type: 'winnings',
      amount: 1.2,
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: 'tx4',
      type: 'deposit',
      amount: 1.0,
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
    },
    {
      id: 'tx5',
      type: 'bet',
      amount: 0.75,
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
    }
  ];
}
