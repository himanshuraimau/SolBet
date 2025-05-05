use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::program_error::ProgramError;
use crate::state::BetOutcome;

/// Instructions supported by the SolBet program
#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq)]
pub enum BetInstruction {
    /// Initialize a new bet
    /// Accounts expected:
    /// 0. `[signer]` Creator account (paying for the transaction and rent)
    /// 1. `[writable]` The new bet account
    /// 2. `[writable]` Escrow account to hold funds
    /// 3. `[]` System program
    /// 4. `[]` Rent sysvar
    InitializeBet {
        expires_at: i64,
        min_bet: u64,
        max_bet: u64,
    },

    /// Place a bet (yes/no) with amount
    /// Accounts expected:
    /// 0. `[signer]` User placing the bet
    /// 1. `[writable]` The bet account
    /// 2. `[writable]` Escrow account to receive funds
    /// 3. `[writable]` User bet account (to track user participation)
    /// 4. `[]` System program
    PlaceBet {
        amount: u64,
        position: BetOutcome,
    },

    /// Resolve bet and distribute funds
    /// Accounts expected:
    /// 0. `[signer]` Bet creator account
    /// 1. `[writable]` The bet account
    /// 2. `[writable]` Escrow account to distribute funds from
    ResolveBet {
        outcome: BetOutcome,
    },

    /// Withdraw funds from an expired bet
    /// Accounts expected:
    /// 0. `[signer]` User withdrawing funds
    /// 1. `[writable]` The bet account
    /// 2. `[writable]` Escrow account
    /// 3. `[writable]` User bet account
    WithdrawExpired {},
}

impl BetInstruction {
    /// Unpacks a byte buffer into a BetInstruction
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (tag, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        Ok(match tag {
            0 => {
                let payload = BetInstruction::try_from_slice(rest)?;
                match payload {
                    BetInstruction::InitializeBet { expires_at, min_bet, max_bet } => 
                        BetInstruction::InitializeBet { expires_at, min_bet, max_bet },
                    _ => return Err(ProgramError::InvalidInstructionData),
                }
            },
            1 => {
                let payload = BetInstruction::try_from_slice(rest)?;
                match payload {
                    BetInstruction::PlaceBet { amount, position } => 
                        BetInstruction::PlaceBet { amount, position },
                    _ => return Err(ProgramError::InvalidInstructionData),
                }
            },
            2 => {
                let payload = BetInstruction::try_from_slice(rest)?;
                match payload {
                    BetInstruction::ResolveBet { outcome } => 
                        BetInstruction::ResolveBet { outcome },
                    _ => return Err(ProgramError::InvalidInstructionData),
                }
            },
            3 => BetInstruction::WithdrawExpired {},
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
