# SolBet - Decentralized Betting on Solana

SolBet is a decentralized betting platform built on the Solana blockchain. It allows users to create bets, place bets on binary outcomes (Yes/No), resolve bets, and claim winnings in a trustless manner.

## Project Structure

```
SolBet/
├── smart_contract/
│   ├── src/
│   │   ├── error.rs         # Custom error definitions
│   │   ├── instruction.rs   # Instruction definitions and deserialization
│   │   ├── lib.rs           # Program entrypoint
│   │   ├── processor.rs     # Core business logic
│   │   ├── state.rs         # State definitions and serialization
│   │   └── tests.rs         # Unit tests
│   └── Cargo.toml           # Dependencies and build configuration
```

## Core Features

1. **Create Bets**: Users can create new binary outcome bets with custom parameters:
   - Expiration time
   - Minimum and maximum bet amounts
   - Automatically created escrow to hold funds

2. **Place Bets**: Users can participate in active bets:
   - Choose a position (Yes/No)
   - Stake the desired amount (within min/max limits)
   - All funds are held in escrow until resolution

3. **Resolve Bets**: The bet creator can determine the outcome:
   - Set final result (Yes or No)
   - Funds are allocated for claiming by winners

4. **Withdraw Funds**: Users can claim their winnings or refunds:
   - Winners receive proportional shares of the total pool
   - For expired bets, users can withdraw their original stake

## How the Contract Works

The smart contract maintains several account types:
- **Bet Account**: Holds the metadata about the bet (pools, timing, status)
- **Escrow Account**: Holds all funds for a particular bet
- **User Bet Account**: Tracks an individual user's participation

## Building the Contract

1. Install Rust and Solana CLI tools:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
```

2. Add the BPF target to your Rust toolchain:
```bash
rustup component add rust-src
rustup target add bpfelf-unknown-unknown
```

3. Build the program:
```bash
cd smart_contract
cargo build-bpf
```

## Deploying to Solana

1. Create a wallet if you don't have one:
```bash
solana-keygen new
```

2. Get SOL for deployment (using devnet):
```bash
solana config set --url devnet
solana airdrop 2
```

3. Deploy the program:
```bash
solana program deploy target/deploy/solbet.so
```

## Interacting with the Contract

After deployment, you can interact with the program using:

1. The Solana CLI:
```bash
solana program call <PROGRAM_ID> -- <SERIALIZED_INSTRUCTION>
```

2. Client SDKs:
- JavaScript/TypeScript SDK
- Rust SDK
- Python SDK

## Architecture

The contract follows a standard Solana program architecture:
- **Entrypoint**: Central entry function for the program
- **Instruction Processing**: Deserialize and route to appropriate handlers
- **State Management**: Serialize/deserialize account data using Borsh
- **Error Handling**: Custom errors with descriptive messages

## Security Considerations

- Funds are held in escrow until bet resolution or expiration
- Only the creator can resolve a bet
- Bets have expiration times to prevent locked funds
- The contract validates all account authorities
- Overflow protection in pool calculations

## Future Enhancements

- Oracle integration for automated resolution
- Multiple outcome bets (beyond binary Yes/No)
- Betting pools with dynamic odds
- DAO governance for dispute resolution
- Fee structure for protocol sustainability

