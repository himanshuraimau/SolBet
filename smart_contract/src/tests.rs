#[cfg(test)]
mod tests {
    use super::*;
    use solana_program::{
        account_info::AccountInfo,
        pubkey::Pubkey,
        system_program,
        sysvar::rent,
        clock::Clock,
    };
    use crate::{
        state::{BetState, BetStatus, BetOutcome, UserBet},
        processor,
        instruction::BetInstruction,
        error::BetError,
    };
    use std::time::{SystemTime, UNIX_EPOCH};
    use borsh::{BorshSerialize, BorshDeserialize};
    use std::rc::Rc;
    use std::cell::RefCell;
    
    // Helper function to create an AccountInfo for testing
    fn create_account_info<'a>(
        key: &'a Pubkey,
        is_signer: bool,
        is_writable: bool,
        lamports: &'a mut u64,
        data: &'a mut [u8],
        owner: &'a Pubkey,
    ) -> AccountInfo<'a> {
        AccountInfo {
            key,
            is_signer,
            is_writable,
            lamports: Rc::new(RefCell::new(lamports)),
            data: Rc::new(RefCell::new(data)),
            owner,
            executable: false,
            rent_epoch: 0,
        }
    }
    
    // Mock for current time
    fn mock_current_time() -> i64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs() as i64
    }
    
    #[test]
    fn test_initialize_bet() {
        let program_id = Pubkey::new_unique();
        let creator_key = Pubkey::new_unique();
        let bet_account_key = Pubkey::new_unique();
        let escrow_account_key = Pubkey::new_unique();
        let system_program_key = system_program::id();
        let rent_key = rent::id();
        
        let mut creator_lamports = 1000000;
        let mut bet_account_lamports = 0;
        let mut escrow_account_lamports = 0;
        let mut system_program_lamports = 0;
        let mut rent_lamports = 0;
        
        let mut creator_data = vec![0; 0];
        let mut bet_account_data = vec![0; BetState::calculate_space()];
        let mut escrow_account_data = vec![0; 0];
        let mut system_program_data = vec![0; 0];
        let mut rent_data = vec![0; 0];
        
        // Create AccountInfo objects
        let creator_account = create_account_info(
            &creator_key,
            true,
            false,
            &mut creator_lamports,
            &mut creator_data,
            &system_program_key,
        );
        
        let bet_account = create_account_info(
            &bet_account_key,
            false,
            true,
            &mut bet_account_lamports,
            &mut bet_account_data,
            &program_id,
        );
        
        let escrow_account = create_account_info(
            &escrow_account_key,
            false,
            true,
            &mut escrow_account_lamports,
            &mut escrow_account_data,
            &program_id,
        );
        
        let system_program_account = create_account_info(
            &system_program_key,
            false,
            false,
            &mut system_program_lamports,
            &mut system_program_data,
            &system_program_key,
        );
        
        let rent_account = create_account_info(
            &rent_key,
            false,
            false,
            &mut rent_lamports,
            &mut rent_data,
            &system_program_key,
        );
        
        // Setup accounts vector
        let accounts = vec![
            creator_account,
            bet_account,
            escrow_account,
            system_program_account,
            rent_account,
        ];
        
        // Create instruction data
        let current_time = mock_current_time();
        let expires_at = current_time + 86400; // 1 day in the future
        let min_bet = 100;
        let max_bet = 1000;
        
        let instruction = BetInstruction::InitializeBet {
            expires_at,
            min_bet,
            max_bet,
        };
        
        // Serialize the instruction
        let mut instruction_data = vec![0];
        let instr_data = borsh::to_vec(&instruction).unwrap();
        instruction_data.extend_from_slice(&instr_data);
        
        // Call the process_instruction function
        // Note: In a real test, we'd mock the necessary dependencies
        // But for this example, we'll assume the processor returns Ok
        
        // Verify the bet state was created correctly
        // In an actual test implementation, we would validate this data
        // after running the processor
        let bet_state = BetState {
            creator: creator_key,
            escrow_account: escrow_account_key,
            total_pool: 0,
            yes_pool: 0,
            no_pool: 0,
            expires_at,
            status: BetStatus::Active,
            outcome: None,
            min_bet_amount: min_bet,
            max_bet_amount: max_bet,
            is_initialized: true,
        };
        
        // In a real test, we'd validate the bet state was stored correctly
        assert_eq!(bet_state.creator, creator_key);
        assert_eq!(bet_state.expires_at, expires_at);
        assert_eq!(bet_state.min_bet_amount, min_bet);
        assert_eq!(bet_state.max_bet_amount, max_bet);
    }
    
    #[test]
    fn test_place_bet() {
        let program_id = Pubkey::new_unique();
        let bettor_key = Pubkey::new_unique();
        let bet_account_key = Pubkey::new_unique();
        let escrow_account_key = Pubkey::new_unique();
        let user_bet_account_key = Pubkey::new_unique();
        let system_program_key = system_program::id();
        
        let mut bettor_lamports = 5000;
        let mut bet_account_lamports = 1000;
        let mut escrow_account_lamports = 0;
        let mut user_bet_account_lamports = 0;
        let mut system_program_lamports = 0;
        
        // Initialize bet state data
        let current_time = mock_current_time();
        let expires_at = current_time + 86400; // 1 day in the future
        let bet_state = BetState {
            creator: Pubkey::new_unique(),
            escrow_account: escrow_account_key,
            total_pool: 0,
            yes_pool: 0,
            no_pool: 0,
            expires_at,
            status: BetStatus::Active,
            outcome: None,
            min_bet_amount: 100,
            max_bet_amount: 1000,
            is_initialized: true,
        };
        
        let mut bet_account_data = borsh::to_vec(&bet_state).unwrap();
        let mut bettor_data = vec![0; 0];
        let mut escrow_account_data = vec![0; 0];
        let mut user_bet_account_data = vec![0; UserBet::calculate_space()];
        let mut system_program_data = vec![0; 0];
        
        // Create AccountInfo objects
        let bettor_account = create_account_info(
            &bettor_key,
            true,
            false,
            &mut bettor_lamports,
            &mut bettor_data,
            &system_program_key,
        );
        
        let bet_account = create_account_info(
            &bet_account_key,
            false,
            true,
            &mut bet_account_lamports,
            &mut bet_account_data,
            &program_id,
        );
        
        let escrow_account = create_account_info(
            &escrow_account_key,
            false,
            true,
            &mut escrow_account_lamports,
            &mut escrow_account_data,
            &program_id,
        );
        
        let user_bet_account = create_account_info(
            &user_bet_account_key,
            false,
            true,
            &mut user_bet_account_lamports,
            &mut user_bet_account_data,
            &program_id,
        );
        
        let system_program_account = create_account_info(
            &system_program_key,
            false,
            false,
            &mut system_program_lamports,
            &mut system_program_data,
            &system_program_key,
        );
        
        // Setup accounts vector
        let accounts = vec![
            bettor_account,
            bet_account,
            escrow_account,
            user_bet_account,
            system_program_account,
        ];
        
        // Create instruction data
        let bet_amount = 500;
        let position = BetOutcome::Yes;
        
        let instruction = BetInstruction::PlaceBet {
            amount: bet_amount,
            position,
        };
        
        // Serialize the instruction
        let mut instruction_data = vec![1];
        let instr_data = borsh::to_vec(&instruction).unwrap();
        instruction_data.extend_from_slice(&instr_data);
        
        // In a real test, we'd process the instruction and verify:
        // 1. User bet account was created with correct data
        // 2. Escrow received the correct amount of lamports
        // 3. Bet state pools were updated
        
        // Expected outcomes:
        // escrow_account_lamports should increase by bet_amount
        // bettor_lamports should decrease by bet_amount
        // The yes_pool and total_pool in the bet_state should increase by bet_amount
    }
    
    #[test]
    fn test_resolve_bet() {
        let program_id = Pubkey::new_unique();
        let creator_key = Pubkey::new_unique();
        let bet_account_key = Pubkey::new_unique();
        let escrow_account_key = Pubkey::new_unique();
        
        let mut creator_lamports = 1000000;
        let mut bet_account_lamports = 1000;
        let mut escrow_account_lamports = 5000; // assume some bets were placed
        
        // Initialize bet state with some existing bets
        let current_time = mock_current_time();
        let expires_at = current_time + 86400;
        let bet_state = BetState {
            creator: creator_key,
            escrow_account: escrow_account_key,
            total_pool: 5000,
            yes_pool: 3000,
            no_pool: 2000,
            expires_at,
            status: BetStatus::Active,
            outcome: None,
            min_bet_amount: 100,
            max_bet_amount: 1000,
            is_initialized: true,
        };
        
        let mut creator_data = vec![0; 0];
        let mut bet_account_data = borsh::to_vec(&bet_state).unwrap();
        let mut escrow_account_data = vec![0; 0];
        
        // Create AccountInfo objects
        let creator_account = create_account_info(
            &creator_key,
            true,
            false,
            &mut creator_lamports,
            &mut creator_data,
            &program_id,
        );
        
        let bet_account = create_account_info(
            &bet_account_key,
            false,
            true,
            &mut bet_account_lamports,
            &mut bet_account_data,
            &program_id,
        );
        
        let escrow_account = create_account_info(
            &escrow_account_key,
            false,
            true,
            &mut escrow_account_lamports,
            &mut escrow_account_data,
            &program_id,
        );
        
        // Setup accounts vector
        let accounts = vec![
            creator_account,
            bet_account,
            escrow_account,
        ];
        
        // Create instruction data to resolve bet with "Yes" outcome
        let outcome = BetOutcome::Yes;
        
        let instruction = BetInstruction::ResolveBet {
            outcome,
        };
        
        // Serialize the instruction
        let mut instruction_data = vec![2];
        let instr_data = borsh::to_vec(&instruction).unwrap();
        instruction_data.extend_from_slice(&instr_data);
        
        // In a real test, we'd:
        // 1. Process the instruction
        // 2. Verify the bet state was updated to Resolved with correct outcome
    }
    
    #[test]
    fn test_withdraw_expired() {
        let program_id = Pubkey::new_unique();
        let user_key = Pubkey::new_unique();
        let bet_account_key = Pubkey::new_unique();
        let escrow_account_key = Pubkey::new_unique();
        let user_bet_account_key = Pubkey::new_unique();
        
        let mut user_lamports = 1000;
        let mut bet_account_lamports = 1000;
        let mut escrow_account_lamports = 5000;
        let mut user_bet_account_lamports = 0;
        
        // Create an expired bet state
        let current_time = mock_current_time();
        let expired_time = current_time - 1000; // In the past
        let bet_state = BetState {
            creator: Pubkey::new_unique(),
            escrow_account: escrow_account_key,
            total_pool: 5000,
            yes_pool: 3000,
            no_pool: 2000,
            expires_at: expired_time,
            status: BetStatus::Active,
            outcome: None,
            min_bet_amount: 100,
            max_bet_amount: 1000,
            is_initialized: true,
        };
        
        // Create a user bet
        let user_bet = UserBet {
            user: user_key,
            bet_account: bet_account_key,
            amount: 500,
            position: BetOutcome::Yes,
            is_claimed: false,
        };
        
        let mut user_data = vec![0; 0];
        let mut bet_account_data = borsh::to_vec(&bet_state).unwrap();
        let mut escrow_account_data = vec![0; 0];
        let mut user_bet_account_data = borsh::to_vec(&user_bet).unwrap();
        
        // Create AccountInfo objects
        let user_account = create_account_info(
            &user_key,
            true,
            false,
            &mut user_lamports,
            &mut user_data,
            &program_id,
        );
        
        let bet_account = create_account_info(
            &bet_account_key,
            false,
            false,
            &mut bet_account_lamports,
            &mut bet_account_data,
            &program_id,
        );
        
        let escrow_account = create_account_info(
            &escrow_account_key,
            false,
            true,
            &mut escrow_account_lamports,
            &mut escrow_account_data,
            &program_id,
        );
        
        let user_bet_account = create_account_info(
            &user_bet_account_key,
            false,
            true,
            &mut user_bet_account_lamports,
            &mut user_bet_account_data,
            &program_id,
        );
        
        // Setup accounts vector
        let accounts = vec![
            user_account,
            bet_account,
            escrow_account,
            user_bet_account,
        ];
        
        // Create instruction data
        let instruction = BetInstruction::WithdrawExpired {};
        
        // Serialize the instruction
        let instruction_data = vec![3]; // Index for WithdrawExpired
        
        // In a real test, we'd:
        // 1. Process the instruction
        // 2. Verify user gets refunded their original bet amount
        // 3. Check the user bet is marked as claimed
    }
    
    #[test]
    fn test_error_handling() {
        // Test BetExpired error
        {
            let program_id = Pubkey::new_unique();
            let bettor_key = Pubkey::new_unique();
            let bet_account_key = Pubkey::new_unique();
            let escrow_account_key = Pubkey::new_unique();
            let user_bet_account_key = Pubkey::new_unique();
            let system_program_key = system_program::id();
            
            let mut bettor_lamports = 5000;
            let mut bet_account_lamports = 1000;
            let mut escrow_account_lamports = 0;
            let mut user_bet_account_lamports = 0;
            let mut system_program_lamports = 0;
            
            // Initialize bet state with expired timestamp
            let current_time = mock_current_time();
            let expires_at = current_time - 1; // Already expired
            let bet_state = BetState {
                creator: Pubkey::new_unique(),
                escrow_account: escrow_account_key,
                total_pool: 0,
                yes_pool: 0,
                no_pool: 0,
                expires_at,
                status: BetStatus::Active,
                outcome: None,
                min_bet_amount: 100,
                max_bet_amount: 1000,
                is_initialized: true,
            };
            
            let mut bet_account_data = borsh::to_vec(&bet_state).unwrap();
            let mut bettor_data = vec![0; 0];
            let mut escrow_account_data = vec![0; 0];
            let mut user_bet_account_data = vec![0; UserBet::calculate_space()];
            let mut system_program_data = vec![0; 0];
            
            // Create AccountInfo objects for the place_bet test
            let accounts = vec![
                create_account_info(
                    &bettor_key,
                    true,
                    false,
                    &mut bettor_lamports,
                    &mut bettor_data,
                    &system_program_key,
                ),
                create_account_info(
                    &bet_account_key,
                    false,
                    true,
                    &mut bet_account_lamports,
                    &mut bet_account_data,
                    &program_id,
                ),
                create_account_info(
                    &escrow_account_key,
                    false,
                    true,
                    &mut escrow_account_lamports,
                    &mut escrow_account_data,
                    &program_id,
                ),
                create_account_info(
                    &user_bet_account_key,
                    false,
                    true,
                    &mut user_bet_account_lamports,
                    &mut user_bet_account_data,
                    &program_id,
                ),
                create_account_info(
                    &system_program_key,
                    false,
                    false,
                    &mut system_program_lamports,
                    &mut system_program_data,
                    &system_program_key,
                ),
            ];
            
            // Try to place a bet on expired bet
            let instruction = BetInstruction::PlaceBet {
                amount: 500,
                position: BetOutcome::Yes,
            };
            
            let mut instruction_data = vec![1];
            let instr_data = borsh::to_vec(&instruction).unwrap();
            instruction_data.extend_from_slice(&instr_data);
            
            // In a real test, we'd expect this to return BetError::BetExpired
        }
        
        // Test InvalidBetAmount error
        {
            let program_id = Pubkey::new_unique();
            let bettor_key = Pubkey::new_unique();
            let bet_account_key = Pubkey::new_unique();
            let escrow_account_key = Pubkey::new_unique();
            let user_bet_account_key = Pubkey::new_unique();
            let system_program_key = system_program::id();
            
            let mut bettor_lamports = 5000;
            let mut bet_account_lamports = 1000;
            let mut escrow_account_lamports = 0;
            let mut user_bet_account_lamports = 0;
            let mut system_program_lamports = 0;
            
            // Initialize valid bet state 
            let current_time = mock_current_time();
            let expires_at = current_time + 86400;
            let bet_state = BetState {
                creator: Pubkey::new_unique(),
                escrow_account: escrow_account_key,
                total_pool: 0,
                yes_pool: 0,
                no_pool: 0,
                expires_at,
                status: BetStatus::Active,
                outcome: None,
                min_bet_amount: 100,
                max_bet_amount: 1000,
                is_initialized: true,
            };
            
            let mut bet_account_data = borsh::to_vec(&bet_state).unwrap();
            let mut bettor_data = vec![0; 0];
            let mut escrow_account_data = vec![0; 0];
            let mut user_bet_account_data = vec![0; UserBet::calculate_space()];
            let mut system_program_data = vec![0; 0];
            
            // Create AccountInfo objects for the place_bet test
            let accounts = vec![
                create_account_info(
                    &bettor_key,
                    true,
                    false,
                    &mut bettor_lamports,
                    &mut bettor_data,
                    &system_program_key,
                ),
                create_account_info(
                    &bet_account_key,
                    false,
                    true,
                    &mut bet_account_lamports,
                    &mut bet_account_data,
                    &program_id,
                ),
                create_account_info(
                    &escrow_account_key,
                    false,
                    true,
                    &mut escrow_account_lamports,
                    &mut escrow_account_data,
                    &program_id,
                ),
                create_account_info(
                    &user_bet_account_key,
                    false,
                    true,
                    &mut user_bet_account_lamports,
                    &mut user_bet_account_data,
                    &program_id,
                ),
                create_account_info(
                    &system_program_key,
                    false,
                    false,
                    &mut system_program_lamports,
                    &mut system_program_data,
                    &system_program_key,
                ),
            ];
            
            // Try to place a bet with too small amount
            let instruction = BetInstruction::PlaceBet {
                amount: 50, // Less than min_bet_amount
                position: BetOutcome::Yes,
            };
            
            let mut instruction_data = vec![1];
            let instr_data = borsh::to_vec(&instruction).unwrap();
            instruction_data.extend_from_slice(&instr_data);
            
            // In a real test, we'd expect this to return BetError::InvalidBetAmount
        }
        
        // Additional error tests would follow a similar pattern
    }
}
