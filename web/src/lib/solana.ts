import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair
} from '@solana/web3.js';
import { BorshCoder, Idl } from '@project-serum/anchor';
import { Buffer } from 'buffer';

// Program ID for the SolBet smart contract on devnet
export const PROGRAM_ID = new PublicKey('PUT_YOUR_ACTUAL_PROGRAM_ID_HERE');

// Devnet connection
export const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Initialize a bet
export async function initializeBet(
  wallet: any, 
  expiresAt: number, 
  minBet: number, 
  maxBet: number
) {
  try {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    
    // Create keypairs for the new accounts
    const betAccount = Keypair.generate();
    const escrowAccount = Keypair.generate();
    
    // Convert SOL to lamports
    const minBetLamports = minBet * LAMPORTS_PER_SOL;
    const maxBetLamports = maxBet * LAMPORTS_PER_SOL;
    
    // Create instruction data buffer
    const instructionData = Buffer.from([
      0, // Instruction index for InitializeBet
      ...new Uint8Array(new BigInt64Array([BigInt(expiresAt)]).buffer), // expiresAt as i64
      ...new Uint8Array(new BigUint64Array([BigInt(minBetLamports)]).buffer), // minBet as u64
      ...new Uint8Array(new BigUint64Array([BigInt(maxBetLamports)]).buffer), // maxBet as u64
    ]);
    
    // Create the instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // Creator
        { pubkey: betAccount.publicKey, isSigner: true, isWritable: true }, // Bet account
        { pubkey: escrowAccount.publicKey, isSigner: true, isWritable: true }, // Escrow account
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false } // System program
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign with all required signers
    transaction.sign(betAccount, escrowAccount);
    
    // Sign with wallet and send
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    return {
      betAccount: betAccount.publicKey.toString(),
      escrowAccount: escrowAccount.publicKey.toString(),
      signature,
    };
  } catch (error) {
    console.error("Error initializing bet:", error);
    throw error;
  }
}

// Place a bet
export async function placeBet(
  wallet: any,
  betAccount: string,
  escrowAccount: string,
  amount: number,
  position: "yes" | "no"
) {
  try {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    
    // Convert string addresses to PublicKey
    const betAccountPubkey = new PublicKey(betAccount);
    const escrowAccountPubkey = new PublicKey(escrowAccount);
    
    // Generate a user bet account
    const userBetAccount = Keypair.generate();
    
    // Convert SOL to lamports
    const amountLamports = amount * LAMPORTS_PER_SOL;
    
    // Create instruction data buffer
    const instructionData = Buffer.from([
      1, // Instruction index for PlaceBet
      ...new Uint8Array(new BigUint64Array([BigInt(amountLamports)]).buffer), // amount as u64
      position === "yes" ? 0 : 1, // position as BetOutcome enum (0 for Yes, 1 for No)
    ]);
    
    // Create the instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // Bettor
        { pubkey: betAccountPubkey, isSigner: false, isWritable: true }, // Bet account
        { pubkey: escrowAccountPubkey, isSigner: false, isWritable: true }, // Escrow account
        { pubkey: userBetAccount.publicKey, isSigner: true, isWritable: true }, // User bet account
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false } // System program
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign with all required signers
    transaction.sign(userBetAccount);
    
    // Sign with wallet and send
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    return {
      userBetAccount: userBetAccount.publicKey.toString(),
      signature,
    };
  } catch (error) {
    console.error("Error placing bet:", error);
    throw error;
  }
}

// Resolve a bet (creator only)
export async function resolveBet(
  wallet: any,
  betAccount: string,
  escrowAccount: string,
  outcome: "yes" | "no"
) {
  try {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    
    // Convert string addresses to PublicKey
    const betAccountPubkey = new PublicKey(betAccount);
    const escrowAccountPubkey = new PublicKey(escrowAccount);
    
    // Create instruction data buffer
    const instructionData = Buffer.from([
      2, // Instruction index for ResolveBet
      outcome === "yes" ? 0 : 1, // outcome as BetOutcome enum (0 for Yes, 1 for No)
    ]);
    
    // Create the instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // Creator
        { pubkey: betAccountPubkey, isSigner: false, isWritable: true }, // Bet account
        { pubkey: escrowAccountPubkey, isSigner: false, isWritable: true }, // Escrow account
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign with wallet and send
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    return {
      signature,
    };
  } catch (error) {
    console.error("Error resolving bet:", error);
    throw error;
  }
}

// Withdraw funds from a bet
export async function withdrawFromBet(
  wallet: any,
  betAccount: string,
  escrowAccount: string,
  userBetAccount: string
) {
  try {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    
    // Convert string addresses to PublicKey
    const betAccountPubkey = new PublicKey(betAccount);
    const escrowAccountPubkey = new PublicKey(escrowAccount);
    const userBetAccountPubkey = new PublicKey(userBetAccount);
    
    // Create instruction data buffer
    const instructionData = Buffer.from([
      3, // Instruction index for WithdrawExpired
    ]);
    
    // Create the instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // User
        { pubkey: betAccountPubkey, isSigner: false, isWritable: true }, // Bet account
        { pubkey: escrowAccountPubkey, isSigner: false, isWritable: true }, // Escrow account
        { pubkey: userBetAccountPubkey, isSigner: false, isWritable: true }, // User bet account
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign with wallet and send
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    return {
      signature,
    };
  } catch (error) {
    console.error("Error withdrawing from bet:", error);
    throw error;
  }
}

// Helper function to fetch bet data from blockchain
export async function fetchBetData(betAccount: string) {
  try {
    const betAccountPubkey = new PublicKey(betAccount);
    const accountInfo = await connection.getAccountInfo(betAccountPubkey);
    
    if (!accountInfo) {
      throw new Error("Bet account not found");
    }
    
    // Parse the account data here
    // This would typically use a BorshCoder with the program's IDL
    // For now, we'll implement a simplified version
    
    // First byte is a bool for initialized status
    const dataView = new DataView(accountInfo.data.buffer);
    
    // These offsets are based on the order in the BetState struct
    const offset = {
      creator: 0, // Pubkey (32 bytes)
      escrowAccount: 32, // Pubkey (32 bytes)
      totalPool: 64, // u64 (8 bytes)
      yesPool: 72, // u64 (8 bytes)
      noPool: 80, // u64 (8 bytes)
      expiresAt: 88, // i64 (8 bytes)
      status: 96, // enum BetStatus (1 byte)
      outcome: 97, // Option<BetOutcome> (1+1 bytes)
      minBetAmount: 99, // u64 (8 bytes)
      maxBetAmount: 107, // u64 (8 bytes)
      isInitialized: 115, // bool (1 byte)
    };
    
    // Read data according to the structure
    const creator = new PublicKey(accountInfo.data.slice(offset.creator, offset.creator + 32));
    const escrowAccount = new PublicKey(accountInfo.data.slice(offset.escrowAccount, offset.escrowAccount + 32));
    const totalPool = dataView.getBigUint64(offset.totalPool, true);
    const yesPool = dataView.getBigUint64(offset.yesPool, true);
    const noPool = dataView.getBigUint64(offset.noPool, true);
    const expiresAt = dataView.getBigInt64(offset.expiresAt, true);
    const status = accountInfo.data[offset.status];
    
    // For Option<BetOutcome>, first byte is Some(1)/None(0), second byte is the value
    const hasOutcome = accountInfo.data[offset.outcome] === 1;
    const outcome = hasOutcome ? (accountInfo.data[offset.outcome + 1] === 0 ? "yes" : "no") : null;
    
    const minBetAmount = dataView.getBigUint64(offset.minBetAmount, true);
    const maxBetAmount = dataView.getBigUint64(offset.maxBetAmount, true);
    const isInitialized = accountInfo.data[offset.isInitialized] === 1;
    
    // Map status to string values that match our frontend types
    const statusMap = ["active", "closed", "resolved", "disputed"];
    
    return {
      id: betAccount,
      creator: creator.toString(),
      escrowAccount: escrowAccount.toString(),
      totalPool: Number(totalPool) / LAMPORTS_PER_SOL,
      yesPool: Number(yesPool) / LAMPORTS_PER_SOL,
      noPool: Number(noPool) / LAMPORTS_PER_SOL,
      expiresAt: new Date(Number(expiresAt) * 1000),
      status: statusMap[status] || "unknown",
      outcome: outcome,
      minBetAmount: Number(minBetAmount) / LAMPORTS_PER_SOL,
      maxBetAmount: Number(maxBetAmount) / LAMPORTS_PER_SOL,
      isInitialized,
    };
  } catch (error) {
    console.error("Error fetching bet data:", error);
    throw error;
  }
}