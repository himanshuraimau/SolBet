use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

mod state;
mod instruction;
mod processor;
mod error;

// Define the program's entry point
entrypoint!(process_instruction);

// Program entrypoint implementation that forwards to our processor
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("SolBet: Processing instruction");
    processor::process_instruction(program_id, accounts, instruction_data)
}

#[cfg(test)]
mod tests;
