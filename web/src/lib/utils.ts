import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatSOL(amount: number): string {
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} SOL`
}

export function shortenAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function calculateTimeLeft(endDate: Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
} {
  const difference = +endDate - +new Date()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

export function calculateOdds(yesPool: number, noPool: number, position: "yes" | "no"): number {
  const totalPool = yesPool + noPool
  if (totalPool === 0) return 2.0 // Default even odds

  if (position === "yes") {
    return totalPool / yesPool
  } else {
    return totalPool / noPool
  }
}
