import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

// Determine the Solana network to connect to
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
// Use the provided RPC endpoint or default to cluster API URL
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || clusterApiUrl(SOLANA_NETWORK as any);

// Create a connection to the Solana network
export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Get the program ID from environment variables, removing any quotes
const programIdStr = process.env.PROGRAM_ID?.replace(/["']/g, '');

// Initialize the program ID as a PublicKey
export const programId = programIdStr 
  ? new PublicKey(programIdStr) 
  : new PublicKey('11111111111111111111111111111111'); // Default to system program if not provided

console.log(`Connected to Solana ${SOLANA_NETWORK} with program ID: ${programId.toString()}`);
