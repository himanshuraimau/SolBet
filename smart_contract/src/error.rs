use solana_program::{program_error::ProgramError, msg};
use thiserror::Error;

/// Custom error messages for the SolBet program
#[derive(Error, Debug, Copy, Clone)]
pub enum BetError {
    #[error("Bet has expired")]
    BetExpired,
    
    #[error("Insufficient funds")]
    InsufficientFunds,
    
    #[error("Bet amount outside limits")]
    InvalidBetAmount,
    
    #[error("Unauthorized")]
    Unauthorized,
    
    #[error("Invalid bet state")]
    InvalidBetState,
    
    #[error("Bet is not yet expired")]
    BetNotExpired,
    
    #[error("Bet already resolved")]
    BetAlreadyResolved,
    
    #[error("Invalid account data")]
    InvalidAccountData,
}

impl From<BetError> for ProgramError {
    fn from(e: BetError) -> Self {
        msg!("SolBet Error: {}", e);
        ProgramError::Custom(e as u32)
    }
}
