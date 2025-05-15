/**
 * Error codes matching the Rust BetError enum
 */
export enum BetError {
  BetExpired = 0,
  InsufficientFunds = 1,
  InvalidBetAmount = 2,
  Unauthorized = 3,
  InvalidBetState = 4,
  BetNotExpired = 5,
  BetAlreadyResolved = 6,
  InvalidAccountData = 7
}

/**
 * Error messages matching the Rust error descriptions
 */
export const BetErrorMessages: Record<BetError, string> = {
  [BetError.BetExpired]: "Bet has expired",
  [BetError.InsufficientFunds]: "Insufficient funds",
  [BetError.InvalidBetAmount]: "Bet amount outside limits",
  [BetError.Unauthorized]: "Unauthorized",
  [BetError.InvalidBetState]: "Invalid bet state",
  [BetError.BetNotExpired]: "Bet is not yet expired",
  [BetError.BetAlreadyResolved]: "Bet already resolved",
  [BetError.InvalidAccountData]: "Invalid account data"
};
