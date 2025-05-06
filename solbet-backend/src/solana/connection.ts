import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  sendAndConfirmTransaction,
  TransactionInstruction
} from '@solana/web3.js';
import { connection, programId } from '../config/solana';

/**
 * Submit a transaction to the Solana blockchain
 * @param transaction The transaction to submit
 * @param signers Array of signers required for the transaction
 * @returns Transaction signature
 */
export const submitTransaction = async (
  transaction: Transaction,
  signers: Keypair[]
): Promise<string> => {
  try {
    // Set recent blockhash and sign transaction
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash('confirmed')
    ).blockhash;
    if (!signers.length) {
      throw new Error('No signers provided for transaction');
    }
    transaction.feePayer = signers[0]?.publicKey;

    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      signers,
      {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      }
    );

    return signature;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
};

/**
 * Get account data for the given public key
 * @param publicKey The public key to get account data for
 * @returns Account data as Buffer
 */
export const getAccountData = async (publicKey: PublicKey): Promise<Buffer> => {
  try {
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    if (!accountInfo) {
      throw new Error(`Account ${publicKey.toBase58()} not found`);
    }
    
    return accountInfo.data;
  } catch (error) {
    console.error('Error getting account data:', error);
    throw error;
  }
};

export { connection, programId };
