import { BetOutcome, BetState, BetStatus, UserBet } from "../types";
import { PublicKey } from "@solana/web3.js";
import * as borsh from "borsh";

/**
 * Schema classes for Borsh serialization
 * These classes must match the structure of the Rust structs in the Solana program
 */

// Schema for initializing a new bet
class InitializeBetSchema {
  expires_at: number;
  min_bet: bigint;
  max_bet: bigint;

  constructor(props: {
    expires_at: number;
    min_bet: bigint;
    max_bet: bigint;
  }) {
    this.expires_at = props.expires_at;
    this.min_bet = props.min_bet;
    this.max_bet = props.max_bet;
  }
}

// Schema for placing a bet
class PlaceBetSchema {
  amount: bigint;
  position: number;

  constructor(props: {
    amount: bigint;
    position: number;
  }) {
    this.amount = props.amount;
    this.position = props.position;
  }
}

// Schema for resolving a bet
class ResolveBetSchema {
  outcome: number;

  constructor(props: {
    outcome: number;
  }) {
    this.outcome = props.outcome;
  }
}

// Schema for withdrawing from a bet (no parameters needed)
class WithdrawExpiredSchema {
  constructor() {}
}

// Borsh schema definitions
const schemas = {
  InitializeBet: InitializeBetSchema,
  PlaceBet: PlaceBetSchema,
  ResolveBet: ResolveBetSchema,
  WithdrawExpired: WithdrawExpiredSchema
};

// Borsh schema field definitions for serialization
const serializeSchemas = new Map<any, any>([
  [InitializeBetSchema, { kind: 'struct', fields: [
    ['expires_at', 'i64'],
    ['min_bet', 'u64'],
    ['max_bet', 'u64']
  ]}],
  [PlaceBetSchema, { kind: 'struct', fields: [
    ['amount', 'u64'],
    ['position', 'u8']
  ]}],
  [ResolveBetSchema, { kind: 'struct', fields: [
    ['outcome', 'u8']
  ]}],
  [WithdrawExpiredSchema, { kind: 'struct', fields: [] }]
]);

/**
 * Serializes instruction data for the SolBet program
 * 
 * This function converts JavaScript objects into a Buffer format that
 * can be understood by the Solana program written in Rust.
 * 
 * @param instructionType - The type of instruction to serialize (from BetInstructionType enum)
 * @param data - The data to serialize, structure depends on the instruction type
 * @returns A Buffer containing the serialized instruction data
 * @throws Error if the instruction type is unknown
 */
export function serialize(instructionType: number, data: any): Buffer {
  // Create a buffer for the instruction type (1 byte)
  const instructionBuffer = Buffer.alloc(1);
  instructionBuffer.writeUInt8(instructionType, 0);

  // No data for WithdrawExpired
  if (instructionType === 3) {
    return instructionBuffer;
  }

  // Determine schema based on instruction type
  let schemaClass;
  let schemaData;
  
  switch (instructionType) {
    case 0: // InitializeBet
      schemaClass = InitializeBetSchema;
      schemaData = new InitializeBetSchema({
        expires_at: data.expires_at,
        min_bet: data.min_bet,
        max_bet: data.max_bet
      });
      break;
    case 1: // PlaceBet
      schemaClass = PlaceBetSchema;
      schemaData = new PlaceBetSchema({
        amount: data.amount,
        position: data.position
      });
      break;
    case 2: // ResolveBet
      schemaClass = ResolveBetSchema;
      schemaData = new ResolveBetSchema({
        outcome: data.outcome
      });
      break;
    default:
      throw new Error(`Unknown instruction type: ${instructionType}`);
  }

  // Serialize the instruction data
  const dataBuffer = borsh.serialize(
    serializeSchemas,
    schemaData
  );

  // Concatenate the instruction type and data
  return Buffer.concat([instructionBuffer, dataBuffer]);
}

/**
 * Deserializes BetState from account data
 * 
 * This function parses the raw binary data from a bet account and
 * converts it into a structured JavaScript object.
 * 
 * @param data - The raw account data as a Buffer
 * @returns A structured BetState object
 * @remarks The layout must match the Rust struct in the Solana program
 */
export function deserializeBetState(data: Buffer): BetState {
  // Deserialize using borsh layout
  // This is a simplified implementation - in a real app you'd use a proper deserializer
  
  // Read the fields based on their layout in the Rust struct
  let offset = 0;
  
  // Read creator pubkey (32 bytes)
  const creator = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  // Read escrow account pubkey (32 bytes)
  const escrowAccount = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  // Read total_pool (8 bytes, u64)
  const totalPool = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read yes_pool (8 bytes, u64)
  const yesPool = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read no_pool (8 bytes, u64)
  const noPool = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read expires_at (8 bytes, i64)
  const expiresAt = data.readBigInt64LE(offset);
  offset += 8;
  
  // Read status (1 byte, enum)
  const status = data.readUInt8(offset) as BetStatus;
  offset += 1;
  
  // Read outcome option (1 byte tag + 1 byte for enum if Some)
  const outcomeTag = data.readUInt8(offset);
  offset += 1;
  
  let outcome = null;
  if (outcomeTag === 1) {
    outcome = data.readUInt8(offset) as BetOutcome;
    offset += 1;
  }
  
  // Read min_bet_amount (8 bytes, u64)
  const minBetAmount = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read max_bet_amount (8 bytes, u64)
  const maxBetAmount = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read is_initialized (1 byte, bool)
  const isInitialized = Boolean(data.readUInt8(offset));
  
  return {
    creator,
    escrowAccount,
    totalPool,
    yesPool,
    noPool,
    expiresAt: expiresAt * BigInt(1000), // Convert to milliseconds for JS
    status,
    outcome,
    minBetAmount,
    maxBetAmount,
    isInitialized
  };
}

/**
 * Deserializes UserBet from account data
 * 
 * This function parses the raw binary data from a user bet account and
 * converts it into a structured JavaScript object.
 * 
 * @param data - The raw account data as a Buffer
 * @returns A structured UserBet object
 * @remarks The layout must match the Rust struct in the Solana program
 */
export function deserializeUserBet(data: Buffer): UserBet {
  let offset = 0;
  
  // Read user pubkey (32 bytes)
  const user = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  // Read bet_account pubkey (32 bytes)
  const betAccount = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  // Read amount (8 bytes, u64)
  const amount = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read position (1 byte, enum)
  const position = data.readUInt8(offset) as BetOutcome;
  offset += 1;
  
  // Read is_claimed (1 byte, bool)
  const isClaimed = Boolean(data.readUInt8(offset));
  
  return {
    user,
    betAccount,
    amount,
    position,
    isClaimed
  };
}
