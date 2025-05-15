import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { WalletTransaction, UserProfile } from '@/types/wallet';

/**
 * Format a wallet address for display by truncating the middle
 * @param publicKey The public key to format
 * @returns Formatted address string like "Bxk1...3jdU"
 */
export function formatWalletAddress(publicKey: PublicKey | string): string {
  const address = typeof publicKey === 'string' ? publicKey : publicKey.toString();
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Verify a signature from a Solana wallet
 * @param walletAddress The public key of the wallet as a string
 * @param signature The signature as a base58 string
 * @param message The message that was signed
 * @returns Promise resolving to a boolean indicating if the signature is valid
 */
export async function verifyWalletSignature(
  walletAddress: string, 
  signature: string, 
  message: string
): Promise<boolean> {
  try {
    // Convert wallet address string to PublicKey
    const publicKey = new PublicKey(walletAddress);
    
    // Convert signature from base58 to Uint8Array
    const signatureBytes = bs58.decode(signature);
    
    // Convert message to Uint8Array
    const messageBytes = new TextEncoder().encode(message);
    
    // Verify the signature
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );
  } catch (error) {
    console.error('Error verifying wallet signature:', error);
    return false;
  }
}

/**
 * Get a single character to use as an avatar initial from a wallet address
 */
export function getWalletInitial(address: string | PublicKey): string {
  const addressStr = typeof address === 'string' ? address : address.toString();
  
  // Use the first character of the address, or a fallback
  return addressStr.substring(0, 1).toUpperCase();
}

/**
 * Check if two wallet addresses are the same
 * @param a First wallet address
 * @param b Second wallet address
 * @returns True if addresses represent the same wallet
 */
export function isSameWallet(a: string | PublicKey | null, b: string | PublicKey | null): boolean {
  if (!a || !b) return false;
  
  const aStr = typeof a === 'string' ? a : a.toString();
  const bStr = typeof b === 'string' ? b : b.toString();
  
  return aStr === bStr;
}

/**
 * Create a standard authentication message for signing
 * @param action The action being performed (e.g., "create-bet", "login")
 * @param data Optional data to include in the message
 * @returns A formatted message string
 */
export function createAuthMessage(action: string, data?: Record<string, any>): string {
  const timestamp = new Date().toISOString();
  let message = `SolBet: Authenticate for ${action} at ${timestamp}`;
  
  if (data) {
    // Add relevant data to the message
    Object.entries(data).forEach(([key, value]) => {
      if (value && typeof value !== 'object') {
        message += `\n${key}: ${value}`;
      }
    });
  }
  
  return message;
}
