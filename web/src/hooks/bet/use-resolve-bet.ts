import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { SolanaService } from "@/services/solanaService";
import { BetService } from "@/services/betService";
import { BetOutcome } from "@/types";
import { toast } from "@/hooks/use-toast";
import { PublicKey } from "@solana/web3.js";

interface ResolveBetParams {
  betId: string;
  betPublicKey: string;
  outcome: "YES" | "NO";
}

export function useResolveBet() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ betId, betPublicKey, outcome }: ResolveBetParams) => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }
      
      try {
        // First resolve on the blockchain
        const solanaService = new SolanaService("https://api.devnet.solana.com");
        const betService = new BetService(solanaService);
        
        // Convert outcome to enum
        const betOutcome = outcome === "YES" ? BetOutcome.Yes : BetOutcome.No;
        
        // Call blockchain
        const signature = await betService.resolveBet(
          {
            publicKey,
            signTransaction
          },
          new PublicKey(betPublicKey),
          { outcome: betOutcome }
        );
        
        // Then update in our database
        const response = await fetch(`/api/bets/${betId}/resolve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            outcome,
            signature,
            walletAddress: publicKey.toString(),
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to resolve bet");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error resolving bet:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch the updated bet
      queryClient.invalidateQueries({ queryKey: ["bet", variables.betId] });
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      
      toast({
        title: "Bet Resolved",
        description: `The bet has been successfully resolved with outcome: ${variables.outcome}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to resolve bet",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
}
