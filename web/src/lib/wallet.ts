import { PublicKey } from "@solana/web3.js";

/**
 * Formats a wallet address for display (e.g., "Addr...xyz")
 * 
 * @param publicKey The PublicKey object or string address
 * @param prefixLength Number of characters to show at the beginning
 * @param suffixLength Number of characters to show at the end
 * @returns Formatted address string or empty string if no address
 */
export function formatWalletAddress(
  publicKey: PublicKey | string | null | undefined,
  prefixLength = 4,
  suffixLength = 4
): string {
  if (!publicKey) return "";
  
  // Convert PublicKey object to string if needed
  const address = typeof publicKey === "string" 
    ? publicKey 
    : publicKey.toString();
  
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Gets the first character of a wallet address for avatar displays
 * 
 * @param publicKey The PublicKey object or string address
 * @param fallback Fallback character if no address is provided
 * @returns First character of address or fallback
 */
export function getWalletInitial(
  publicKey: PublicKey | string | null | undefined,
  fallback = "?"
): string {
  if (!publicKey) return fallback;
  
  const address = typeof publicKey === "string" 
    ? publicKey 
    : publicKey.toString();
    
  return address.substring(0, 1).toUpperCase();
}

/**
 * Checks if a wallet is connected
 * 
 * @param wallet The wallet object from useWallet hook
 * @returns True if wallet is connected
 */
export function isWalletConnected(wallet: any): boolean {
  return !!wallet?.publicKey;
}
