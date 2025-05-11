"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@solana/wallet-adapter-react"
import { formatSOL, calculateOdds } from "@/lib/utils"
import type { Bet } from "@/types/bet"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  Keypair
} from "@solana/web3.js"
import * as borsh from 'borsh'
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query/config"

interface PlaceBetFormProps {
  bet: Bet
}

// BetOutcome enum definition (matching Rust enum)
enum BetOutcome {
  Yes = 0,
  No = 1
}

// Class to mirror the structure for borsh serialization
class PlaceBetInstruction {
  amount: bigint;
  position: BetOutcome;

  constructor(amount: bigint, position: BetOutcome) {
    this.amount = amount;
    this.position = position;
  }

  static schema = new Map([
    [
      PlaceBetInstruction,
      {
        kind: 'struct',
        fields: [
          ['amount', 'u64'],
          ['position', 'u8']
        ]
      }
    ]
  ]);

  serialize(): Buffer {
    // First byte is the instruction code (1 for PlaceBet)
    const instructionCode = Buffer.from([1]);
    const data = borsh.serialize(PlaceBetInstruction.schema, this);
    return Buffer.concat([instructionCode, data]);
  }
}

// API function for placing a bet in the database
const placeBetInDb = async (params: {
  walletAddress: string
  betId: string
  position: "yes" | "no"
  amount: number
}) => {
  const response = await fetch("/api/bets/place", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to place bet")
  }

  return response.json()
}

export default function PlaceBetForm({ bet }: PlaceBetFormProps) {
  const { publicKey, connected, sendTransaction } = useWallet()
  const [position, setPosition] = useState<"yes" | "no">("yes")
  const [amount, setAmount] = useState<number>(bet.minimumBet)
  const [placingOnChain, setPlacingOnChain] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const totalPool = bet.yesPool + bet.noPool
  const odds = calculateOdds(bet.yesPool, bet.noPool, position)
  const potentialReturn = amount * odds

  // Get the program ID from environment variable
  const programId = process.env.NEXT_PUBLIC_SOLBET_PROGRAM_ID || '';
  // Set up connection
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com');

  // Fetch wallet balance
  useEffect(() => {
    if (publicKey) {
      const fetchBalance = async () => {
        try {
          const lamports = await connection.getBalance(publicKey);
          setBalance(lamports / LAMPORTS_PER_SOL);
        } catch (err) {
          console.error("Failed to fetch balance:", err);
          setBalance(null);
        }
      };
      
      fetchBalance();
      // Set up interval to refresh balance every 15 seconds
      const intervalId = setInterval(fetchBalance, 15000);
      
      return () => clearInterval(intervalId);
    } else {
      setBalance(null);
    }
  }, [publicKey, connection]);

  // Set up the mutation for placing a bet in the database
  const placeBetMutation = useMutation({
    mutationFn: placeBetInDb,
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(bet.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.bets() })
      setSuccess(true)
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    },
    onError: (error) => {
      setError(error.message || "Failed to place bet")
    },
  })

  const handleAmountChange = (value: number) => {
    // Ensure amount is within min/max range
    const newAmount = Math.max(bet.minimumBet, Math.min(bet.maximumBet, value))
    setAmount(newAmount)
  }

  const handleSliderChange = (value: number[]) => {
    handleAmountChange(value[0])
  }

  // Function to place a bet on-chain
  const placeBetOnChain = async (): Promise<boolean> => {
    if (!publicKey || !sendTransaction) {
      setError("Wallet connection error")
      return false
    }

    try {
      setPlacingOnChain(true)
      
      // Get the program ID from environment variable
      const programIdPubkey = new PublicKey(programId)
      
      // Convert amount from SOL to lamports
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL)
      
      // Create required account keypairs
      // For a real implementation, these should be derived from the bet ID and user wallet
      const betAccountPubkey = new PublicKey(bet.id);
      
      // Create a deterministic escrow account PDA derived from the bet account
      const [escrowAccountPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), betAccountPubkey.toBuffer()],
        programIdPubkey
      );
      
      // Create a deterministic user bet account PDA derived from the user and bet account
      const [userBetAccountPubkey] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), betAccountPubkey.toBuffer()],
        programIdPubkey
      );
      
      // Create the instruction data
      const betOutcome = position === "yes" ? BetOutcome.Yes : BetOutcome.No;
      const instructionData = new PlaceBetInstruction(BigInt(lamports), betOutcome).serialize();
      
      // Create the transaction instruction
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: betAccountPubkey, isSigner: false, isWritable: true },
          { pubkey: escrowAccountPubkey, isSigner: false, isWritable: true },
          { pubkey: userBetAccountPubkey, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: programIdPubkey,
        data: instructionData
      });
      
      // Create the transaction
      const transaction = new Transaction().add(instruction);
      
      // Get a recent blockhash - critical for transaction validity
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Add retry logic for transaction confirmation
      const sendAndConfirmWithRetry = async () => {
        // Send transaction
        const signature = await sendTransaction(transaction, connection);
        console.log("Transaction sent, signature:", signature);
        
        // Use a more robust confirmation strategy with retries
        let retries = 5;
        let confirmed = false;
        
        while (retries > 0 && !confirmed) {
          try {
            const confirmation = await connection.confirmTransaction({
              signature,
              blockhash,
              lastValidBlockHeight
            }, 'confirmed');
            
            if (confirmation.value.err) {
              // Parse and handle specific error types from Solana
              const errorStr = confirmation.value.err.toString();
              
              if (errorStr.includes("insufficient funds")) {
                throw new Error("Insufficient funds for transaction");
              } else if (errorStr.includes("already in use")) {
                throw new Error("You've already placed a bet on this event");
              } else {
                throw new Error(`Transaction error: ${errorStr}`);
              }
            }
            
            confirmed = true;
          } catch (err) {
            retries--;
            if (retries === 0) throw err;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        return signature;
      };
      
      const signature = await sendAndConfirmWithRetry();
      console.log("Bet placed on-chain successfully, signature:", signature);
      return true;
      
    } catch (err) {
      console.error("Error placing bet on-chain:", err);
      setError(`Failed to place bet on-chain: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    } finally {
      setPlacingOnChain(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey) {
      setError("Please connect your wallet first")
      return
    }

    // Check if user has enough balance
    if (balance !== null && balance < amount) {
      setError(`Insufficient balance. You have ${formatSOL(balance)}.`)
      return
    }

    // Reset previous errors
    setError(null)

    try {
      // Step 1: Place the bet on-chain
      const onChainSuccess = await placeBetOnChain()
      
      if (!onChainSuccess) {
        throw new Error("Failed to place bet on-chain")
      }
      
      // Step 2: After on-chain success, record in database
      await placeBetMutation.mutateAsync({
        walletAddress: publicKey.toString(),
        betId: bet.id,
        position,
        amount,
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bet")
      console.error("Error placing bet:", err)
    }
  }

  if (!connected || !publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Place Your Bet</CardTitle>
          <CardDescription>Connect your wallet to place a bet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="mb-4">Please connect your wallet to participate in this bet.</p>
          {/* You can add WalletMultiButton here if needed */}
        </CardContent>
      </Card>
    )
  }

  // Check if bet is still active
  const isBetActive = bet.status === "active" && new Date(bet.endTime) > new Date()
  
  if (!isBetActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Betting Closed</CardTitle>
          <CardDescription>This bet is no longer accepting new positions</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p>
            {bet.status !== "active" 
              ? "This bet has been closed or resolved." 
              : "The betting period for this event has ended."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Your Bet</CardTitle>
        <CardDescription>Choose your position and amount</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Your Position</Label>
            <RadioGroup
              value={position}
              onValueChange={(value) => setPosition(value as "yes" | "no")}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="yes"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                  position === "yes" ? "border-accent-green bg-accent-green/10" : "border-muted"
                }`}
              >
                <RadioGroupItem value="yes" id="yes" className="sr-only" />
                <span className="text-lg font-medium">Yes</span>
                <span className="text-sm text-muted-foreground mt-1">
                  {((bet.yesPool / (totalPool || 1)) * 100).toFixed(1)}% Agree
                </span>
              </Label>
              <Label
                htmlFor="no"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                  position === "no" ? "border-accent-coral bg-accent-coral/10" : "border-muted"
                }`}
              >
                <RadioGroupItem value="no" id="no" className="sr-only" />
                <span className="text-lg font-medium">No</span>
                <span className="text-sm text-muted-foreground mt-1">
                  {((bet.noPool / (totalPool || 1)) * 100).toFixed(1)}% Disagree
                </span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Bet Amount</Label>
              <span className="text-sm text-muted-foreground">
                Balance: {balance !== null ? `${formatSOL(balance)}` : "Fetching..."}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(Number.parseFloat(e.target.value) || bet.minimumBet)}
                min={bet.minimumBet}
                max={bet.maximumBet}
                step={0.1}
                className="font-mono"
              />
              <span className="font-medium">SOL</span>
            </div>

            <Slider
              value={[amount]}
              min={bet.minimumBet}
              max={bet.maximumBet}
              step={0.1}
              onValueChange={handleSliderChange}
              className="py-4"
            />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Min: {formatSOL(bet.minimumBet)}</span>
              <span>Max: {formatSOL(bet.maximumBet)}</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Current Odds</span>
              <span className="font-mono">{odds.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Potential Return</span>
              <span className="font-mono font-medium">{formatSOL(potentialReturn)}</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-accent-green/10 text-accent-green border-accent-green/20">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Bet placed successfully!</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className={`w-full ${
            position === "yes" ? "bg-accent-green hover:bg-accent-green/90" : "bg-accent-coral hover:bg-accent-coral/90"
          } text-white`}
          disabled={
            !publicKey || 
            placingOnChain || 
            placeBetMutation.isPending || 
            success ||
            (balance !== null && balance < amount)
          }
          onClick={handleSubmit}
        >
          {placingOnChain || placeBetMutation.isPending ? (
            <span className="flex items-center">
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              {placingOnChain ? "Confirming on-chain..." : "Saving bet..."}
            </span>
          ) : (
            `Place ${formatSOL(amount)} on ${position.toUpperCase()}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
