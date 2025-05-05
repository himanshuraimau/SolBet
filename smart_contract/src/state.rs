use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    pubkey::Pubkey,
    program_pack::{IsInitialized, Sealed},
};

/// User account structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct User {
    pub wallet_address: Pubkey,
    pub active_bets: Vec<Pubkey>,    // Vector of bet accounts
}

/// Bet outcome enum
#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq, Clone, Copy)]
pub enum BetOutcome {
    Yes,
    No,
}

/// Bet status enum
#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq, Clone, Copy)]
pub enum BetStatus {
    Active,
    Closed,
    Resolved,
    Disputed,
}

/// Bet account structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct BetState {
    pub creator: Pubkey,
    pub escrow_account: Pubkey,
    pub total_pool: u64,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub expires_at: i64,
    pub status: BetStatus,
    pub outcome: Option<BetOutcome>,
    pub min_bet_amount: u64,
    pub max_bet_amount: u64,
    pub is_initialized: bool,
}

/// UserBet - records a user's participation in a bet
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserBet {
    pub user: Pubkey,
    pub bet_account: Pubkey,
    pub amount: u64,
    pub position: BetOutcome,
    pub is_claimed: bool,
}

impl Sealed for BetState {}

impl IsInitialized for BetState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl BetState {
    pub fn calculate_space() -> usize {
        // Calculate exact space needed for the BetState struct
        // Pubkey = 32 bytes each
        // u64 = 8 bytes each
        // i64 = 8 bytes
        // BetStatus enum = 1 byte
        // Option<BetOutcome> = 1 byte for tag + 1 byte for enum value if Some
        // bool = 1 byte
        32 + // creator
        32 + // escrow_account
        8 + // total_pool
        8 + // yes_pool
        8 + // no_pool
        8 + // expires_at
        1 + // status
        2 + // outcome (Option tag + enum value)
        8 + // min_bet_amount
        8 + // max_bet_amount
        1 + // is_initialized
        32 // padding for alignment and future fields
    }
}

impl UserBet {
    pub fn calculate_space() -> usize {
        // Calculate exact space needed for the UserBet struct
        // Pubkey = 32 bytes each
        // u64 = 8 bytes
        // BetOutcome = 1 byte
        // bool = 1 byte
        32 + // user
        32 + // bet_account
        8 + // amount
        1 + // position
        1 + // is_claimed
        16 // padding for alignment and future fields
    }
}
