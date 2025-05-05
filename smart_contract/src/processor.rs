use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
    msg,
    clock::Clock,
};
use borsh::{BorshDeserialize, BorshSerialize};
use crate::{
    instruction::BetInstruction,
    state::{BetState, BetStatus, UserBet},
    error::BetError,
};

/// Process the program instructions
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = BetInstruction::unpack(instruction_data)?;

    match instruction {
        BetInstruction::InitializeBet { expires_at, min_bet, max_bet } => {
            initialize_bet(program_id, accounts, expires_at, min_bet, max_bet)
        },
        BetInstruction::PlaceBet { amount, position } => {
            place_bet(program_id, accounts, amount, position)
        },
        BetInstruction::ResolveBet { outcome } => {
            resolve_bet(program_id, accounts, outcome)
        },
        BetInstruction::WithdrawExpired {} => {
            withdraw_expired(program_id, accounts)
        },
    }
}

/// Initialize a new bet with an escrow account
fn initialize_bet(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    expires_at: i64,
    min_bet: u64,
    max_bet: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get the required accounts
    let creator_info = next_account_info(account_info_iter)?;
    let bet_account_info = next_account_info(account_info_iter)?;
    let escrow_account_info = next_account_info(account_info_iter)?;
    let system_program_info = next_account_info(account_info_iter)?;
    let rent_info = next_account_info(account_info_iter)?;
    
    // Ensure creator is the signer
    if !creator_info.is_signer {
        return Err(BetError::Unauthorized.into());
    }
    
    // Get current timestamp to verify expiration is in the future
    let clock = Clock::get()?;
    if expires_at <= clock.unix_timestamp {
        return Err(BetError::BetExpired.into());
    }
    
    // Ensure min bet is less than max bet and both are greater than 0
    if min_bet == 0 || max_bet < min_bet {
        return Err(BetError::InvalidBetAmount.into());
    }
    
    // Create the bet account
    let space = BetState::calculate_space();
    let rent = Rent::from_account_info(rent_info)?;
    let rent_lamports = rent.minimum_balance(space);
    
    // Create a new account for the bet data
    invoke(
        &system_instruction::create_account(
            creator_info.key,
            bet_account_info.key,
            rent_lamports,
            space as u64,
            program_id,
        ),
        &[creator_info.clone(), bet_account_info.clone(), system_program_info.clone()],
    )?;
    
    // Create the escrow account
    invoke(
        &system_instruction::create_account(
            creator_info.key,
            escrow_account_info.key,
            rent.minimum_balance(0),
            0,
            program_id,
        ),
        &[creator_info.clone(), escrow_account_info.clone(), system_program_info.clone()],
    )?;
    
    // Initialize bet data
    let bet_state = BetState {
        creator: *creator_info.key,
        escrow_account: *escrow_account_info.key,
        total_pool: 0,
        yes_pool: 0,
        no_pool: 0,
        expires_at: expires_at,
        status: BetStatus::Active,
        outcome: None,
        min_bet_amount: min_bet,
        max_bet_amount: max_bet,
        is_initialized: true,
    };
    
    bet_state.serialize(&mut *bet_account_info.data.borrow_mut())?;
    
    msg!("Bet initialized successfully!");
    Ok(())
}

/// Place a bet (yes/no) with amount
fn place_bet(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
    position: crate::state::BetOutcome,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get the required accounts
    let bettor_info = next_account_info(account_info_iter)?;
    let bet_account_info = next_account_info(account_info_iter)?;
    let escrow_account_info = next_account_info(account_info_iter)?;
    let user_bet_account_info = next_account_info(account_info_iter)?;
    let system_program_info = next_account_info(account_info_iter)?;
    
    // Ensure bettor is the signer
    if !bettor_info.is_signer {
        return Err(BetError::Unauthorized.into());
    }
    
    // Ensure the escrow account belongs to the program
    if escrow_account_info.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Load and validate bet state
    let mut bet_state = BetState::try_from_slice(&bet_account_info.data.borrow())?;
    
    // Check that the bet is still active
    if bet_state.status != BetStatus::Active {
        return Err(BetError::InvalidBetState.into());
    }
    
    // Check that the bet hasn't expired
    let clock = Clock::get()?;
    if clock.unix_timestamp >= bet_state.expires_at {
        return Err(BetError::BetExpired.into());
    }
    
    // Validate bet amount
    if amount < bet_state.min_bet_amount || amount > bet_state.max_bet_amount {
        return Err(BetError::InvalidBetAmount.into());
    }
    
    // Create user bet account if it doesn't exist
    let rent = Rent::get()?;
    let user_bet_space = UserBet::calculate_space();
    let user_bet_rent = rent.minimum_balance(user_bet_space);
    
    // Create the user bet account if it's a new account
    if user_bet_account_info.data_is_empty() {
        invoke(
            &system_instruction::create_account(
                bettor_info.key,
                user_bet_account_info.key,
                user_bet_rent,
                user_bet_space as u64,
                program_id,
            ),
            &[bettor_info.clone(), user_bet_account_info.clone(), system_program_info.clone()],
        )?;
        
        // Initialize user bet data
        let user_bet = UserBet {
            user: *bettor_info.key,
            bet_account: *bet_account_info.key,
            amount,
            position,
            is_claimed: false,
        };
        
        user_bet.serialize(&mut *user_bet_account_info.data.borrow_mut())?;
    } else {
        // User already has a bet, check if they're trying to update it
        // This could be expanded to allow adding to an existing bet
        return Err(BetError::InvalidBetState.into());
    }
    
    // Transfer funds from bettor to escrow
    invoke(
        &system_instruction::transfer(
            bettor_info.key,
            escrow_account_info.key,
            amount,
        ),
        &[bettor_info.clone(), escrow_account_info.clone(), system_program_info.clone()],
    )?;
    
    // Update bet state
    bet_state.total_pool += amount;
    match position {
        crate::state::BetOutcome::Yes => bet_state.yes_pool += amount,
        crate::state::BetOutcome::No => bet_state.no_pool += amount,
    }
    
    bet_state.serialize(&mut *bet_account_info.data.borrow_mut())?;
    
    msg!("Bet placed successfully!");
    Ok(())
}

/// Resolve a bet and distribute funds
fn resolve_bet(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    outcome: crate::state::BetOutcome,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get the required accounts
    let creator_info = next_account_info(account_info_iter)?;
    let bet_account_info = next_account_info(account_info_iter)?;
    let escrow_account_info = next_account_info(account_info_iter)?;
    
    // Ensure creator is the signer
    if !creator_info.is_signer {
        return Err(BetError::Unauthorized.into());
    }
    
    // Load and validate bet state
    let mut bet_state = BetState::try_from_slice(&bet_account_info.data.borrow())?;
    
    // Verify the creator is calling this function
    if bet_state.creator != *creator_info.key {
        return Err(BetError::Unauthorized.into());
    }
    
    // Ensure bet is still active
    if bet_state.status != BetStatus::Active {
        return Err(BetError::InvalidBetState.into());
    }
    
    // Update bet state to resolved
    bet_state.status = BetStatus::Resolved;
    bet_state.outcome = Some(outcome);
    
    // Save the updated state
    bet_state.serialize(&mut *bet_account_info.data.borrow_mut())?;
    
    // Note: Actual fund distribution would happen when users claim their winnings
    // to avoid having to load all user bet accounts at once
    
    msg!("Bet resolved successfully with outcome: {:?}", outcome);
    Ok(())
}

/// Withdraw funds from an expired bet
fn withdraw_expired(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get the required accounts
    let user_info = next_account_info(account_info_iter)?;
    let bet_account_info = next_account_info(account_info_iter)?;
    let escrow_account_info = next_account_info(account_info_iter)?;
    let user_bet_account_info = next_account_info(account_info_iter)?;
    
    // Ensure user is the signer
    if !user_info.is_signer {
        return Err(BetError::Unauthorized.into());
    }
    
    // Load and validate bet state
    let bet_state = BetState::try_from_slice(&bet_account_info.data.borrow())?;
    
    // Load user bet data
    let mut user_bet = UserBet::try_from_slice(&user_bet_account_info.data.borrow())?;
    
    // Ensure the user owns this bet
    if user_bet.user != *user_info.key {
        return Err(BetError::Unauthorized.into());
    }
    
    // Check if the bet has expired or is resolved
    let clock = Clock::get()?;
    let is_expired = clock.unix_timestamp >= bet_state.expires_at;
    
    if !is_expired && bet_state.status != BetStatus::Resolved {
        return Err(BetError::BetNotExpired.into());
    }
    
    // Ensure user hasn't already claimed their funds
    if user_bet.is_claimed {
        return Err(BetError::InvalidBetState.into());
    }
    
    // Calculate amount to return to user
    let amount_to_return = if bet_state.status == BetStatus::Resolved {
        // If bet is resolved, check if user won
        if let Some(outcome) = bet_state.outcome {
            if outcome == user_bet.position {
                // Winner gets proportional share of the pool
                let winning_pool = match outcome {
                    crate::state::BetOutcome::Yes => bet_state.yes_pool,
                    crate::state::BetOutcome::No => bet_state.no_pool,
                };
                
                // Avoid division by zero
                if winning_pool == 0 {
                    user_bet.amount // Return original bet if no one else bet
                } else {
                    let proportion = (user_bet.amount as f64) / (winning_pool as f64);
                    let winnings = ((bet_state.total_pool as f64) * proportion) as u64;
                    
                    winnings
                }
            } else {
                // Loser gets nothing
                0
            }
        } else {
            // No outcome set, return original amount
            user_bet.amount
        }
    } else {
        // For expired bets, return original amount
        user_bet.amount
    };
    
    // Transfer funds from escrow to user if there's anything to return
    if amount_to_return > 0 {
        // Get the bump seed for the PDA
        let (escrow_authority, bump_seed) = Pubkey::find_program_address(
            &[b"escrow", bet_account_info.key.as_ref()],
            program_id
        );
        
        // Verify the escrow account is correct
        if escrow_account_info.key != &escrow_authority {
            return Err(ProgramError::InvalidAccountData);
        }
        
        // Transfer funds from escrow to user
        let seeds = &[
            b"escrow", 
            bet_account_info.key.as_ref(),
            &[bump_seed]
        ];
        
        invoke_signed(
            &system_instruction::transfer(
                escrow_account_info.key,
                user_info.key,
                amount_to_return,
            ),
            &[
                escrow_account_info.clone(),
                user_info.clone(),
            ],
            &[seeds],
        )?;
    }
    
    // Mark user bet as claimed
    user_bet.is_claimed = true;
    user_bet.serialize(&mut *user_bet_account_info.data.borrow_mut())?;
    
    msg!("Withdrawal processed successfully!");
    Ok(())
}
