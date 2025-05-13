// utilities for debugging Solana transactions
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Extracts and formats useful information from a Solana transaction error
 * @param error The error object from a failed Solana transaction
 * @returns Formatted error information
 */
export function formatSolanaError(error: any): string {
  // Start with basic error message
  let formattedError = `Error: ${error?.message || String(error)}\n`;
  
  // Add error type if available
  if (error?.name) {
    formattedError += `Type: ${error.name}\n`;
  }
  
  // Extract and format instruction logs if available
  if (error?.logs && Array.isArray(error.logs)) {
    formattedError += "Transaction Logs:\n";
    error.logs.forEach((log: string, i: number) => {
      formattedError += `  ${i + 1}. ${log}\n`;
    });
  }
  
  // Add error code and source if available
  if (error?.code) {
    formattedError += `Error Code: ${error.code}\n`;
  }
  
  if (error?.source) {
    formattedError += `Source: ${error.source}\n`;
  }
  
  return formattedError;
}

/**
 * Attempts to fetch more detailed transaction data when a transaction signature is available
 * @param signature Transaction signature
 * @param connection Solana connection
 * @returns Promise with detailed transaction data
 */
export async function getTransactionDetails(signature: string, connection: Connection) {
  try {
    // Try to get transaction details
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });
    
    // Try to get parsed transaction confirmation status
    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true
    });
    
    return {
      transaction: tx,
      status: status,
      error: tx?.meta?.err || status?.value?.err || null
    };
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return { error: error };
  }
}

/**
 * Helper to verify if a wallet has sufficient SOL for a transaction
 * @param connection Solana connection
 * @param publicKey Wallet public key
 * @param estimatedCost Estimated cost in lamports
 */
export async function checkSufficientBalance(connection: Connection, publicKey: string, estimatedCost: number) {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    const isEnough = balance >= estimatedCost;
    
    return {
      isEnough,
      balance,
      shortfall: isEnough ? 0 : estimatedCost - balance
    };
  } catch (error) {
    console.error("Error checking balance:", error);
    return { isEnough: false, error };
  }
}
