import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
  TransactionInstruction,
  TransactionSignature,
  Signer
} from '@solana/web3.js';
import { SOLBET_PROGRAM_ID } from '../types/constants';
import { WalletAdapter } from './betService';


/**
 * SolanaService provides core functionality for interacting with the Solana blockchain
 * 
 * This service handles low-level Solana operations like:
 * - Managing connections to the Solana network
 * - Sending and signing transactions
 * - Retrieving account data
 * - Converting between SOL and lamports
 */
export class SolanaService {
  private connection: Connection;
  private programId: PublicKey;

  /**
   * Creates a new SolanaService instance
   * 
   * @param endpoint - The Solana RPC endpoint URL (e.g., devnet or mainnet)
   * @param programId - The SolBet program ID (defaults to constant from types)
   */
  constructor(endpoint: string, programId: string = SOLBET_PROGRAM_ID) {
    this.connection = new Connection(endpoint, 'confirmed');
    this.programId = new PublicKey(programId);
  }

  /**
   * Get the Solana connection instance
   * 
   * @returns The active Solana Connection object
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get the SolBet program ID
   * 
   * @returns The PublicKey of the SolBet program
   */
  getProgramId(): PublicKey {
    return this.programId;
  }

  /**
   * Sends a transaction to the Solana blockchain
   * 
   * @param instructions - Array of instructions to include in the transaction
   * @param signers - Array of signers required for the transaction
   * @param feePayer - The public key of the account paying transaction fees
   * @returns Promise resolving to the transaction signature
   * @throws Error if the transaction fails to send or confirm
   */
  async sendTransaction(
    instructions: TransactionInstruction[],
    signers: Signer[],
    feePayer: PublicKey
  ): Promise<TransactionSignature> {
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = feePayer;
    transaction.recentBlockhash = (
      await this.connection.getLatestBlockhash()
    ).blockhash;

    // Sign the transaction with all signers
    transaction.sign(...signers);

    // Send and confirm the transaction
    return await this.connection.sendRawTransaction(transaction.serialize());
  }

  /**
   * Sends a transaction using a wallet adapter
   * 
   * @param instructions - Array of instructions to include in the transaction
   * @param wallet - The wallet adapter to sign the transaction
   * @param feePayer - The public key of the fee payer
   * @returns Promise resolving to the transaction signature
   */
  async sendTransactionWithWallet(
    instructions: TransactionInstruction[],
    wallet: WalletAdapter,
    feePayer: PublicKey
  ): Promise<string> {
    const connection = this.getConnection();
    
    // Create a new transaction
    const transaction = new Transaction();
    
    // Add all instructions
    instructions.forEach(instruction => {
      transaction.add(instruction);
    });
    
    // Set recent blockhash and fee payer
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = feePayer;
  
    // Sign the transaction with the wallet adapter
    if (!wallet.signTransaction) {
      throw new Error("Wallet doesn't support transaction signing");
    }
    
    const signedTx = await wallet.signTransaction(transaction);
    
    // Send the signed transaction
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    // Confirm the transaction
    await connection.confirmTransaction(signature);
    
    return signature;
  }

  /**
   * Retrieves account data for a given public key
   * 
   * @param pubkey - The public key of the account to fetch
   * @returns Promise resolving to the account data as a Buffer, or null if not found
   */
  async getAccountData(
    pubkey: PublicKey
  ): Promise<Buffer | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(pubkey);
      if (!accountInfo) {
        return null;
      }
      return Buffer.from(accountInfo.data);
    } catch (error) {
      console.error('Error fetching account data:', error);
      return null;
    }
  }

  /**
   * Converts SOL to lamports (SOL's smallest unit)
   * 
   * @param sol - Amount in SOL
   * @returns Equivalent amount in lamports (1 SOL = 1,000,000,000 lamports)
   */
  static solToLamports(sol: number): number {
    return sol * LAMPORTS_PER_SOL;
  }

  /**
   * Converts lamports to SOL
   * 
   * @param lamports - Amount in lamports
   * @returns Equivalent amount in SOL (1 SOL = 1,000,000,000 lamports)
   */
  static lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }
}

/**
 * Factory function to create a SolanaService instance
 * 
 * @param endpoint - The Solana RPC endpoint URL
 * @returns A new SolanaService instance
 */
export const createSolanaService = (endpoint: string) => new SolanaService(endpoint);
