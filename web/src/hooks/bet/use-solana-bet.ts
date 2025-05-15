import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, VersionedTransaction, Signer } from "@solana/web3.js";
import { BetOutcome } from "@/types";
import { SolanaService } from "@/services/solanaService";
import { BetService } from "@/services/betService";

// Params for making a bet on the Solana blockchain
interface MakeBetParams {
  betAccount: string;
  escrowAccount: string;
  amount: number;
  position: "yes" | "no";
}

// Params for resolving a bet on the Solana blockchain
interface ResolveBetParams {
  betAccount: string;
  outcome: "yes" | "no";
}

// Params for withdrawing from a bet on the Solana blockchain
interface WithdrawBetParams {
  betAccount: string;
  userBetAccount: string;
}

// Custom signer interface that doesn't need secretKey
interface WalletSigner {
  publicKey: PublicKey;
  sign(tx: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction>;
}

// Hook for Solana blockchain bet operations
export function useSolanaBet() {
  const wallet = useWallet();
  const { publicKey, signTransaction } = wallet;
  
  // Create Solana services
  const solanaService = new SolanaService(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
  );
  const betService = new BetService(solanaService);
  
  // Make a bet on the Solana blockchain
  const makeBet = useMutation({
    mutationFn: async (params: MakeBetParams) => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }
      
      // Convert position to BetOutcome enum
      const position = params.position === "yes" ? BetOutcome.Yes : BetOutcome.No;
      
      // Convert amount from SOL to lamports
      const lamports = BigInt(Math.round(params.amount * 1e9));
      
      // Call the betService to place the bet on the blockchain
      const userBetPubkey = await betService.placeBet(
        wallet as any, // Pass the entire wallet adapter
        new PublicKey(params.betAccount),
        {
          amount: lamports,
          position
        }
      );
      
      return {
        userBetAccount: userBetPubkey,
        signature: userBetPubkey, // Using the PDA as the "signature"
      };
    },
  });
  
  // Resolve a bet on the Solana blockchain
  const resolveBet = useMutation({
    mutationFn: async (params: ResolveBetParams) => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }
      
      // Convert outcome to BetOutcome enum
      const outcome = params.outcome === "yes" ? BetOutcome.Yes : BetOutcome.No;
      
      // Call the betService to resolve the bet on the blockchain
      const signature = await betService.resolveBet(
        wallet as any, // Pass the entire wallet adapter
        new PublicKey(params.betAccount),
        { outcome }
      );
      
      return { signature };
    },
  });
  
  // Withdraw from a bet on the Solana blockchain
  const withdrawBet = useMutation({
    mutationFn: async (params: WithdrawBetParams) => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }
      
      // Call the betService to withdraw from the bet on the blockchain
      const signature = await betService.withdrawFromBet(
        wallet as any, // Pass the entire wallet adapter
        new PublicKey(params.betAccount),
        new PublicKey(params.userBetAccount)
      );
      
      return { signature };
    },
  });
  
  return {
    makeBet,
    resolveBet,
    withdrawBet: withdrawBet // Make sure this is explicitly returned
  };
}
