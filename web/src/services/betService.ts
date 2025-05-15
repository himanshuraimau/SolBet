import {
  PublicKey,
  Keypair,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  sendAndConfirmTransaction,
  Signer
} from "@solana/web3.js";
import { SolanaService } from "./solanaService";
import {
  BetOutcome,
  BetState,
  BetStatus,
  InitializeBetParams,
  PlaceBetParams,
  ResolveBetParams,
  UserBet,
  BetInstructionType,
  USER_BET_SEED,
  ESCROW_SEED,
  BET_STATE_SPACE,
  USER_BET_SPACE
} from "../types";
import { serialize, deserializeBetState, deserializeUserBet } from "./serializationService";

// Define a type that works with wallet adapters
export interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
}

/**
 * BetService handles all bet-related operations on the Solana blockchain.
 * It provides methods to create, place, resolve bets and withdraw funds
 * from resolved or expired bets.
 */
export class BetService {
  private solanaService: SolanaService;

  constructor(solanaService: SolanaService) {
    this.solanaService = solanaService;
  }

  /**
   * Creates a new bet on the Solana blockchain
   * 
   * @param wallet - The creator's wallet, must be a Signer
   * @param params - Parameters for initializing the bet including minimum and maximum bet amounts
   * @returns Promise resolving to the public key of the new bet account as a string
   * @throws Error if the transaction fails
   */
  async createBet(
    wallet: Signer,
    params: InitializeBetParams
  ): Promise<string> {
    const betAccount = Keypair.generate();
    const escrowAccount = Keypair.generate();

    // Get connection and program ID
    const connection = this.solanaService.getConnection();
    const programId = this.solanaService.getProgramId();

    // Create instruction data
    const data = serialize(BetInstructionType.InitializeBet, {
      expires_at: Math.floor(params.expiresAt / 1000), // Convert to seconds
      min_bet: params.minBet,
      max_bet: params.maxBet
    });

    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: betAccount.publicKey, isSigner: true, isWritable: true },
        { pubkey: escrowAccount.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
      ],
      programId,
      data
    });

    // Send the transaction
    const signature = await this.solanaService.sendTransaction(
      [instruction],
      [wallet, betAccount, escrowAccount],
      wallet.publicKey
    );

    // Return the bet account public key
    return betAccount.publicKey.toString();
  }

  /**
   * Places a bet on an existing bet account
   * 
   * @param wallet - The bettor's wallet, must be a Signer
   * @param betAccountPubkey - The public key of the bet account
   * @param params - Parameters for placing the bet including amount and position (Yes/No)
   * @returns Promise resolving to the public key of the user bet account as a string
   * @throws Error if the bet account is not found or transaction fails
   */
  async placeBet(
    wallet: Signer,
    betAccountPubkey: PublicKey,
    params: PlaceBetParams
  ): Promise<string> {
    // Get connection and program ID
    const connection = this.solanaService.getConnection();
    const programId = this.solanaService.getProgramId();

    // Get bet state to find escrow account
    const betData = await this.solanaService.getAccountData(betAccountPubkey);
    if (!betData) throw new Error("Bet account not found");
    
    const betState = deserializeBetState(betData);
    const escrowAccount = new PublicKey(betState.escrowAccount);

    // Derive the user bet PDA
    const [userBetPDA, userBetBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(USER_BET_SEED),
        wallet.publicKey.toBuffer(),
        betAccountPubkey.toBuffer()
      ],
      programId
    );

    // Create instruction data
    const data = serialize(BetInstructionType.PlaceBet, {
      amount: params.amount,
      position: params.position
    });

    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: betAccountPubkey, isSigner: false, isWritable: true },
        { pubkey: escrowAccount, isSigner: false, isWritable: true },
        { pubkey: userBetPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId,
      data
    });

    // Send the transaction
    const signature = await this.solanaService.sendTransaction(
      [instruction],
      [wallet],
      wallet.publicKey
    );

    return userBetPDA.toString();
  }

  /**
   * Resolves a bet with the specified outcome (Yes/No)
   * Can only be called by the bet creator
   * 
   * @param wallet - The creator's wallet, can be a Signer or WalletAdapter
   * @param betAccountPubkey - The public key of the bet account to resolve
   * @param params - Parameters for resolving the bet, including the outcome
   * @returns Promise resolving to the transaction signature
   * @throws Error if the bet account is not found or transaction fails
   */
  async resolveBet(
    wallet: Signer | WalletAdapter,
    betAccountPubkey: PublicKey,
    params: ResolveBetParams
  ): Promise<string> {
    // Get connection and program ID
    const connection = this.solanaService.getConnection();
    const programId = this.solanaService.getProgramId();

    // Get bet state to find escrow account
    const betData = await this.solanaService.getAccountData(betAccountPubkey);
    if (!betData) throw new Error("Bet account not found");
    
    const betState = deserializeBetState(betData);
    const escrowAccount = new PublicKey(betState.escrowAccount);

    // Create instruction data
    const data = serialize(BetInstructionType.ResolveBet, {
      outcome: params.outcome
    });

    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: betAccountPubkey, isSigner: false, isWritable: true },
        { pubkey: escrowAccount, isSigner: false, isWritable: true }
      ],
      programId,
      data
    });

    // Send the transaction using appropriate method based on wallet type
    if ('signTransaction' in wallet && wallet.signTransaction) {
      // WalletAdapter case
      return await this.solanaService.sendTransactionWithWallet(
        [instruction],
        wallet as WalletAdapter,
        wallet.publicKey
      );
    } else {
      // Signer case (original implementation)
      return await this.solanaService.sendTransaction(
        [instruction],
        [wallet as Signer],
        wallet.publicKey
      );
    }
  }

  /**
   * Withdraws funds from a resolved or expired bet
   * - For winners: withdraws winnings based on the bet outcome
   * - For losers in expired bets: refunds the bet amount
   * 
   * @param wallet - The user's wallet, must be a Signer
   * @param betAccountPubkey - The public key of the bet account
   * @param userBetPubkey - The public key of the user's bet account
   * @returns Promise resolving to the transaction signature
   * @throws Error if accounts are not found or transaction fails
   */
  async withdrawFromBet(
    wallet: Signer,
    betAccountPubkey: PublicKey,
    userBetPubkey: PublicKey
  ): Promise<string> {
    // Get connection and program ID
    const connection = this.solanaService.getConnection();
    const programId = this.solanaService.getProgramId();

    // Get bet state to find escrow account
    const betData = await this.solanaService.getAccountData(betAccountPubkey);
    if (!betData) throw new Error("Bet account not found");
    
    const betState = deserializeBetState(betData);
    const escrowAccount = new PublicKey(betState.escrowAccount);

    // Create instruction data for withdraw
    const data = serialize(BetInstructionType.WithdrawExpired, {});

    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: betAccountPubkey, isSigner: false, isWritable: true },
        { pubkey: escrowAccount, isSigner: false, isWritable: true },
        { pubkey: userBetPubkey, isSigner: false, isWritable: true }
      ],
      programId,
      data
    });

    // Send the transaction
    const signature = await this.solanaService.sendTransaction(
      [instruction],
      [wallet],
      wallet.publicKey
    );

    return signature;
  }

  /**
   * Retrieves the state of a bet account
   * 
   * @param betAccountPubkey - The public key of the bet account
   * @returns Promise resolving to the bet state or null if not found
   */
  async getBetState(betAccountPubkey: PublicKey): Promise<BetState | null> {
    const betData = await this.solanaService.getAccountData(betAccountPubkey);
    if (!betData) return null;
    
    return deserializeBetState(betData);
  }

  /**
   * Retrieves a specific user bet
   * 
   * @param userBetPubkey - The public key of the user bet account
   * @returns Promise resolving to the user bet data or null if not found
   */
  async getUserBet(userBetPubkey: PublicKey): Promise<UserBet | null> {
    const userBetData = await this.solanaService.getAccountData(userBetPubkey);
    if (!userBetData) return null;
    
    return deserializeUserBet(userBetData);
  }

  /**
   * Retrieves all bets placed by a specific user
   * 
   * @param userPubkey - The public key of the user
   * @returns Promise resolving to an array of the user's bets
   */
  async getUserBets(userPubkey: PublicKey): Promise<UserBet[]> {
    const programId = this.solanaService.getProgramId();
    const connection = this.solanaService.getConnection();
    
    // Filter accounts by owner and memcmp with user's public key
    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        { dataSize: USER_BET_SPACE }, // Filter by expected size
        { 
          memcmp: {
            offset: 0, // Offset where user pubkey is stored
            bytes: userPubkey.toBase58()
          }
        }
      ]
    });

    // Parse account data
    return accounts.map(account => {
      return deserializeUserBet(Buffer.from(account.account.data));
    });
  }
}

/**
 * Factory function to create a BetService instance
 * 
 * @param solanaService - An instance of SolanaService
 * @returns A new BetService instance
 */
export const createBetService = (solanaService: SolanaService) => new BetService(solanaService);
