import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format SOL amount with 2 decimal places and SOL symbol
 * @param amount Amount in SOL
 * @returns Formatted string (e.g. "1.50 SOL")
 */
export function formatSOL(amount: number): string {
  return `${amount.toFixed(2)} SOL`;
}

/**
 * Format wallet address by showing first 4 and last 4 characters
 * @param address Wallet address
 * @returns Shortened address (e.g. "3dgy...7Ubp")
 */
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
}

// Calculate time remaining until a date
export function calculateTimeLeft(endTime: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  const now = new Date();
  const difference = end.getTime() - now.getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
}

// Calculate betting odds
export function calculateOdds(yesPool: number, noPool: number, position: 'yes' | 'no'): number {
  const totalPool = yesPool + noPool;
  if (totalPool === 0) return 2.0; // Default for empty pools
  
  if (position === 'yes') {
    return yesPool === 0 ? 2.0 : totalPool / yesPool;
  } else {
    return noPool === 0 ? 2.0 : totalPool / noPool;
  }
}

/**
 * Calculate bet pool percentages in a way that's safe for SSR
 * Ensures consistent rendering between server and client
 */
export function calculateBetPercentages(yesPool: number | bigint, noPool: number | bigint, isMounted: boolean = true) {
  // If not mounted yet (server-side), use fixed values to prevent hydration mismatch
  if (!isMounted) {
    return {
      yesPercent: 50,
      noPercent: 50
    };
  }
  
  // Convert to numbers if needed
  const yesAmount = typeof yesPool === 'bigint' ? Number(yesPool) : yesPool;
  const noAmount = typeof noPool === 'bigint' ? Number(noPool) : noPool;
  
  const totalPool = yesAmount + noAmount;
  
  if (totalPool === 0) {
    return {
      yesPercent: 50,
      noPercent: 50
    };
  }
  
  // Use toFixed to ensure consistent decimal places
  const yesPercent = parseFloat(((yesAmount / totalPool) * 100).toFixed(1));
  // Calculate noPercent based on yesPercent to ensure they sum to 100
  const noPercent = parseFloat((100 - yesPercent).toFixed(1));
  
  return { yesPercent, noPercent };
}
