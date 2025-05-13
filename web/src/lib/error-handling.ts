import { toast } from "@/hooks/use-toast";

// -------------------------------------------------------
// Error Types
// -------------------------------------------------------

export type ErrorSource = 
  | "api" 
  | "blockchain" 
  | "wallet" 
  | "validation" 
  | "unknown";

export interface ErrorDetails {
  message: string;
  code?: string | number;
  source: ErrorSource;
  originalError?: any;
}

// -------------------------------------------------------
// Error Handling Functions
// -------------------------------------------------------

/**
 * Formats API errors consistently
 */
export function handleApiError(error: any): ErrorDetails {
  let message = "An error occurred while communicating with the server";
  let code = "API_ERROR";
  
  if (error?.response?.data?.message) {
    message = error.response.data.message;
    code = error.response.data.code || error.response.status;
  } else if (error instanceof Error) {
    message = error.message;
  }
  
  return {
    message,
    code,
    source: "api",
    originalError: error
  };
}

/**
 * Formats blockchain errors consistently
 */
export function handleBlockchainError(error: any): ErrorDetails {
  let message = "An error occurred while interacting with the blockchain";
  let code = "BLOCKCHAIN_ERROR";
  
  if (error?.message?.includes("insufficient fund")) {
    message = "Insufficient funds to complete this transaction";
    code = "INSUFFICIENT_FUNDS";
  } else if (error?.name === "WalletSendTransactionError") {
    message = "Transaction was rejected by the wallet";
    code = "WALLET_REJECTED";
  } else if (error instanceof Error) {
    message = error.message;
  }
  
  return {
    message,
    code,
    source: "blockchain",
    originalError: error
  };
}

/**
 * Formats wallet connection errors consistently
 */
export function handleWalletError(error: any): ErrorDetails {
  let message = "An error occurred with the wallet connection";
  let code = "WALLET_ERROR";
  
  if (error?.name === "WalletConnectionError") {
    message = "Failed to connect to your wallet";
    code = "CONNECTION_FAILED";
  } else if (error?.name === "WalletTimeoutError") {
    message = "Wallet connection timed out";
    code = "CONNECTION_TIMEOUT"; 
  } else if (error instanceof Error) {
    message = error.message;
  }
  
  return {
    message,
    code,
    source: "wallet",
    originalError: error
  };
}

/**
 * Displays an error toast with appropriate message based on error type
 */
export function showErrorToast(error: any) {
  let errorDetails: ErrorDetails;
  
  if (error?.source) {
    // Already formatted
    errorDetails = error as ErrorDetails;
  } else if (error?.response) {
    // Axios-like error
    errorDetails = handleApiError(error);
  } else if (error?.name?.includes("Wallet")) {
    // Wallet error
    errorDetails = handleWalletError(error);
  } else if (error?.logs || error?.message?.includes("Transaction") || error?.message?.includes("Solana")) {
    // Blockchain error
    errorDetails = handleBlockchainError(error);
  } else {
    // Unknown error
    errorDetails = {
      message: error instanceof Error ? error.message : "An unexpected error occurred",
      source: "unknown",
      originalError: error
    };
  }
  
  // Log the full error for debugging
  console.error(`[${errorDetails.source.toUpperCase()}] ${errorDetails.code || 'ERROR'}:`, errorDetails.originalError || errorDetails.message);
  
  // Show user-friendly toast
  toast({
    title: getErrorTitle(errorDetails.source),
    description: errorDetails.message,
    variant: "destructive",
  });
  
  return errorDetails;
}

/**
 * Get a user-friendly error title based on error source
 */
function getErrorTitle(source: ErrorSource): string {
  switch (source) {
    case "api": return "API Error";
    case "blockchain": return "Blockchain Error";
    case "wallet": return "Wallet Error";
    case "validation": return "Validation Error";
    default: return "Error";
  }
}
