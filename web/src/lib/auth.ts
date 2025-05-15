import { cookies } from 'next/headers';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface User {
  id: string;
  walletAddress: string;
}

/**
 * Simple authentication helper function that gets the user from the cookies
 * In a real app, you would verify wallet signatures here
 */
export async function auth(): Promise<User | null> {
  const cookieStore = await cookies();
  const walletAddress = cookieStore.get('walletAddress')?.value;
  
  if (!walletAddress) {
    return null;
  }
  
  try {
    // Find or create the user by wallet address
    let user = await prisma.user.findUnique({
      where: {
        walletAddress
      },
    });
    
    if (!user) {
      // Auto-create users by wallet address
      user = await prisma.user.create({
        data: {
          walletAddress,
        },
      });
    }
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
