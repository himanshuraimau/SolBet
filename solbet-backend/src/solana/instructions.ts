import { 
  PublicKey, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY, 
  TransactionInstruction,
  Keypair
} from '@solana/web3.js';
import { BorshCoder,type Idl } from '@project-serum/anchor';
import { programId } from '../config/solana';
import { BetOutcome } from '../models/bet.model';

// Enum that matches the contract's BetOutcome
enum SolanaBetOutcome {
  Yes = 0,
  No = 1
}

// Convert our API BetOutcome to Solana contract's BetOutcome
function convertBetOutcome(outcome: BetOutcome): SolanaBetOutcome {
  return outcome === BetOutcome.YES ? SolanaBetOutcome.Yes : SolanaBetOutcome.No;
}

/**
 * Create instruction to initialize a new bet
 */
export const createInitializeBetInstruction = (
  creator: PublicKey,
  betAccount: PublicKey,
  escrowAccount: PublicKey,
  expiresAt: number,
  minBet: number,
  maxBet: number
): TransactionInstruction => {
  // Create buffer for instruction data
  const data = Buffer.from([
    0, // Instruction index for InitializeBet
    ...new Uint8Array(new BigInt64Array([BigInt(expiresAt)]).buffer), // expires_at as i64
    ...new Uint8Array(new BigUint64Array([BigInt(minBet)]).buffer),   // min_bet as u64
    ...new Uint8Array(new BigUint64Array([BigInt(maxBet)]).buffer)    // max_bet as u64
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: betAccount, isSigner: false, isWritable: true },
      { pubkey: escrowAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ],
    programId,
    data
  });
};

/**
 * Create instruction to place a bet
 */
export const createPlaceBetInstruction = (
  bettor: PublicKey,
  betAccount: PublicKey,
  escrowAccount: PublicKey,
  userBetAccount: PublicKey,
  amount: number,
  position: BetOutcome
): TransactionInstruction => {
  // Create buffer for instruction data
  const data = Buffer.from([
    1, // Instruction index for PlaceBet
    ...new Uint8Array(new BigUint64Array([BigInt(amount)]).buffer),  // amount as u64
    convertBetOutcome(position) // position as BetOutcome enum
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: bettor, isSigner: true, isWritable: true },
      { pubkey: betAccount, isSigner: false, isWritable: true },
      { pubkey: escrowAccount, isSigner: false, isWritable: true },
      { pubkey: userBetAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId,
    data
  });
};

/**
 * Create instruction to resolve a bet
 */
export const createResolveBetInstruction = (
  creator: PublicKey,
  betAccount: PublicKey,
  escrowAccount: PublicKey,
  outcome: BetOutcome
): TransactionInstruction => {
  // Create buffer for instruction data
  const data = Buffer.from([
    2, // Instruction index for ResolveBet
    convertBetOutcome(outcome) // outcome as BetOutcome enum
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: betAccount, isSigner: false, isWritable: true },
      { pubkey: escrowAccount, isSigner: false, isWritable: true }
    ],
    programId,
    data
  });
};

/**
 * Create instruction to withdraw from an expired bet
 */
export const createWithdrawExpiredInstruction = (
  user: PublicKey,
  betAccount: PublicKey,
  escrowAccount: PublicKey,
  userBetAccount: PublicKey
): TransactionInstruction => {
  // Create buffer for instruction data
  const data = Buffer.from([
    3 // Instruction index for WithdrawExpired
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: betAccount, isSigner: false, isWritable: true },
      { pubkey: escrowAccount, isSigner: false, isWritable: true },
      { pubkey: userBetAccount, isSigner: false, isWritable: true }
    ],
    programId,
    data
  });
};
