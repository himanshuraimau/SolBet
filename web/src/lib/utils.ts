import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatWalletAddress } from "./wallet"
import { calculateTimeLeftDetail } from "./date-utils"

/**
 * Utility function for combining Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a SOL amount to a readable string with 2 decimal places
 */
export function formatSOL(amount: number | undefined | null): string {
  // Return 0 SOL if amount is undefined or null
  if (amount === undefined || amount === null) {
    return "0.00 SOL";
  }
  
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} SOL`;
}

/**
 * Shorthand for formatting a wallet address
 * @deprecated Use formatWalletAddress from wallet.ts instead
 */
export function shortenAddress(address: string): string {
  return formatWalletAddress(address, 4, 4);
}

/**
 * Calculates the odds for a bet position based on pool sizes
 */
export function calculateOdds(yesPool: number, noPool: number, position: "yes" | "no"): number {
  const totalPool = yesPool + noPool
  if (totalPool === 0) return 2.0 // Default even odds

  if (position === "yes") {
    return totalPool / yesPool
  } else {
    return totalPool / noPool
  }
}

/**
 * Calculate time remaining until a deadline
 * @param deadline - The target date to calculate time remaining until
 * @returns Object containing days, hours, minutes, and seconds remaining
 */
export function calculateTimeLeft(deadline: Date | string | number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const difference = +new Date(deadline) - +new Date();
  
  // Return all zeros if the deadline has passed
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
}
