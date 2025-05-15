// Utility functions for Solana error handling

/**
 * Get a user-friendly message from a Solana error
 */
export function getSolanaErrorMessage(error: any): string {
  // Extract the most relevant message from Solana errors
  if (!error) return "Unknown error occurred";
  
  if (typeof error === 'string') return error;
  
  if (error.logs && Array.isArray(error.logs)) {
    // Try to find a meaningful error in logs
    for (const log of error.logs) {
      if (log.includes("Error") || log.includes("failed")) {
        return log;
      }
    }
  }
  
  return error.message || "Unknown Solana error";
}

/**
 * Log detailed Solana error information to the console
 */
export function logSolanaError(error: any, context: string = ''): void {
  console.error(`Solana Error [${context}]:`, error);
  
  if (error.logs) {
    console.error('Transaction logs:', error.logs);
  }
}
