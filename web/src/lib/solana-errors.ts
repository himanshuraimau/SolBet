// Handle Solana transaction errors and provide useful user feedback

/**
 * Extracts a user-friendly error message from Solana transaction errors
 * @param error The error object from a Solana transaction
 * @returns A user-friendly error message
 */
export function getSolanaErrorMessage(error: any): string {
  // Default error message
  let userMessage = "Blockchain transaction failed. Please try again.";
  
  try {
    // Handle specific error types with custom messages
    if (!error) return userMessage;
    
    // Extract error name and message
    const errorName = error.name || '';
    const errorMessage = typeof error.message === 'string' ? error.message : '';
    
    // Check for specific error conditions
    if (errorName === "WalletSendTransactionError") {
      userMessage = "Your wallet declined the transaction. Please check your wallet and try again.";
    } else if (errorName === "WalletConnectionError") {
      userMessage = "Could not connect to your wallet. Please check your connection and try again.";
    } else if (errorName === "WalletTimeoutError") {
      userMessage = "Wallet operation timed out. Please try again.";
    } else if (errorName === "WalletDisconnectedError") {
      userMessage = "Your wallet disconnected. Please reconnect and try again.";
    } else if (errorName === "WalletAccountError") {
      userMessage = "There was an issue with your wallet account. Please check your wallet and try again.";
    } else if (errorName === "WalletPublicKeyError") {
      userMessage = "Could not access your wallet's public key. Please check your wallet permissions.";
    } else if (errorName === "WalletSignMessageError" || errorName === "WalletSignTransactionError") {
      userMessage = "Failed to sign the transaction with your wallet. Please try again.";
    } else if (errorMessage.includes("insufficient fund") || errorMessage.includes("insufficient balance")) {
      userMessage = "Your wallet has insufficient funds for this transaction.";
    } else if (errorMessage.includes("blockhash") && errorMessage.includes("expired")) {
      userMessage = "The transaction took too long to confirm. Please try again.";
    } else if (errorMessage.includes("invalid") && errorMessage.includes("account")) {
      userMessage = "One of the accounts in this transaction is invalid. Please refresh and try again.";
    } else if (errorMessage.includes("Transaction simulation failed:")) {
      userMessage = "The transaction failed during simulation. There may be an issue with the smart contract.";
    }
    
    // Log the detailed error for developers
    console.log('Original Solana error:', {
      name: errorName,
      message: errorMessage,
      logs: error.logs || [],
      cause: error.cause
    });
    
    return userMessage;
  } catch (e) {
    // If something goes wrong while parsing the error, return the default message
    console.error("Error while parsing Solana error:", e);
    return userMessage;
  }
}

/**
 * Extracts and logs detailed information from a Solana transaction error for debugging
 * @param error The error object from a Solana transaction
 */
export function logSolanaError(error: any): void {
  console.group("Solana Transaction Error Details");
  console.error("Error object:", error);
  
  try {
    if (error) {
      // Log basic error information
      console.error(`Name: ${error.name || 'Unknown'}`);
      console.error(`Message: ${error.message || 'No message'}`);
      
      // Log any available transaction logs
      if (error.logs && Array.isArray(error.logs)) {
        console.group("Transaction Logs");
        error.logs.forEach((log: string, index: number) => {
          console.log(`${index + 1}: ${log}`);
        });
        console.groupEnd();
      } else if (typeof error.getLogs === 'function') {
        try {
          const logs = error.getLogs();
          console.group("Transaction Logs (from getLogs())");
          logs.forEach((log: string, index: number) => {
            console.log(`${index + 1}: ${log}`);
          });
          console.groupEnd();
        } catch (e) {
          console.error("Error extracting logs via getLogs():", e);
        }
      }
      
      // Log error code if available
      if (error.code) {
        console.error(`Error Code: ${error.code}`);
      }
      
      // Log any cause or stack information
      if (error.cause) {
        console.group("Error Cause");
        console.error(error.cause);
        console.groupEnd();
      }
      
      if (error.stack) {
        console.group("Stack Trace");
        console.error(error.stack);
        console.groupEnd();
      }
    }
  } catch (e) {
    console.error("Error while logging Solana error details:", e);
  }
  
  console.groupEnd();
}
