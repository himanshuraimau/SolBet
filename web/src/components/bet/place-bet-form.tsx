"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js"
import { formatSOL, calculateOdds } from "@/lib/utils"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useSolanaBet } from "@/hooks/bet/use-solana-bet"
import { queryKeys } from "@/lib/query/config"
import { Bet as TypesBet } from "@/types/bet" // Import with alias
import { Bet as MockBet } from "@/mock/adapters" // Import with alias
import { usePlaceBet } from "@/lib/query/mutations/place-bet";

// Define a union type that accepts either Bet type
type AnyBet = TypesBet | MockBet;

interface PlaceBetFormProps {
  bet: AnyBet;
}

// Mock Solana transaction for development - we'll remove this when connecting to the real blockchain
const simulateSolanaTransaction = async (amount: number): Promise<{signature: string}> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Return a mock transaction signature
  return { signature: Keypair.generate().publicKey.toBase58() };
};

// API function for placing a bet in the database
const placeBetInDb = async (params: {
  walletAddress: string
  betId: string
  position: "yes" | "no"
  amount: number
  onChainTxId?: string
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

// Define the API call for placing a bet
const placeBetAPI = async (params: {
  betId: string;
  position: string;
  amount: number;
  walletAddress: string;
  onChainTxId?: string;
}) => {
  const response = await fetch('/api/bets/place', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to place bet');
  }

  return response.json();
};

export default function PlaceBetForm({ bet }: PlaceBetFormProps) {
  const { publicKey, connected } = useWallet()
  const [position, setPosition] = useState<"yes" | "no">("yes")
  const [amount, setAmount] = useState<number>(bet.minimumBet ?? 0.1)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [isSolanaLoading, setIsSolanaLoading] = useState(false)
  const queryClient = useQueryClient()
  const { makeBet } = useSolanaBet()  // Add Solana Bet hook
  const placeBetMutation = useMutation({
    mutationFn: placeBetAPI,
    onSuccess: () => {
      // Invalidate the specific bet query
      queryClient.invalidateQueries({ queryKey: ["bet", bet.id] });
      
      // Also invalidate the list of bets
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      
      setSuccess(true);
      toast({
        title: "Bet placed successfully!",
        description: `You bet ${formatSOL(amount)} on ${position.toUpperCase()}`,
      });
      
      // Reset form after success
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    },
    onError: (error) => {
      setError(error.message || "Failed to place bet");
      toast({
        title: "Failed to place bet",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  });

  const totalPool = bet.yesPool + bet.noPool
  const odds = calculateOdds(bet.yesPool, bet.noPool, position)
  const potentialReturn = amount * odds

  // Get wallet balance from Solana
  const getBalance = async () => {
    if (!publicKey) return;
    
    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com"
      )
      const bal = await connection.getBalance(publicKey)
      setBalance(bal / LAMPORTS_PER_SOL)
    } catch (err) {
      console.error("Error fetching balance:", err)
    }
  }
  
  // Set up the effect to fetch balance
  useEffect(() => {
    if (publicKey) {
      getBalance();
      const interval = setInterval(getBalance, 10000)
      return () => clearInterval(interval)
    }
  }, [publicKey]);

  const handleAmountChange = (value: number) => {
    // Ensure amount is within min/max range
    const newAmount = Math.max(bet.minimumBet ?? 0.1, Math.min(bet.maximumBet ?? 10, value))
    setAmount(newAmount)
  }

  const handleSliderChange = (value: number[]) => {
    handleAmountChange(value[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to place a bet",
        variant: "destructive",
      });
      return;
    }

    // Check if user has enough balance
    if (balance !== null && balance < amount) {
      toast({
        title: "Insufficient balance",
        description: `You need at least ${formatSOL(amount)} to place this bet`,
        variant: "destructive",
      });
      return;
    }

    try {
      await placeBetMutation.mutateAsync({
        betId: bet.id,
        position,
        amount,
        walletAddress: publicKey.toString(),
        onChainTxId: "simulated-tx-" + Date.now() // For testing
      });
    } catch (error) {
      // Error handling in onError callback
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
          <WalletMultiButton className="wallet-adapter-button-custom mx-auto" />
        </CardContent>
      </Card>
    )
  }

  // Check if bet is still active
  const isBetActive = bet.status.toLowerCase() === "active" && new Date(bet.expiresAt) > new Date()
  
  if (!isBetActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Betting Closed</CardTitle>
          <CardDescription>This bet is no longer accepting new positions</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p>
            {bet.status.toLowerCase() !== "active" 
              ? "This bet has been closed or resolved." 
              : "The betting period for this event has ended."}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Check if user has already placed a bet on this event
  const userParticipation = bet.participants?.find(p => p.walletAddress === publicKey.toString())
  
  if (userParticipation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Bet</CardTitle>
          <CardDescription>You've already placed a bet on this event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between mb-2">
                <span>Your Position</span>
                <span className={`font-medium ${
                  userParticipation.position === "yes" 
                    ? "text-accent-green" 
                    : "text-accent-coral"
                }`}>
                  {userParticipation.position.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Amount</span>
                <span className="font-mono">{formatSOL(userParticipation.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Potential Return</span>
                <span className="font-mono font-medium">
                  {formatSOL(
                    calculateOdds(
                      bet.yesPool, 
                      bet.noPool, 
                      userParticipation.position.toLowerCase() as "yes" | "no"
                    ) * 
                    userParticipation.amount
                  )}
                </span>
              </div>
            </div>
          </div>
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
                onChange={(e) => handleAmountChange(Number.parseFloat(e.target.value) || bet.minimumBet || 0.1)}
                min={bet.minimumBet ?? 0.1}
                max={bet.maximumBet ?? 10}
                step={0.1}
                className="font-mono"
              />
              <span className="font-medium">SOL</span>
            </div>

            <Slider
              value={[amount]}
              min={bet.minimumBet ?? 0.1}
              max={bet.maximumBet ?? 10}
              step={0.1}
              onValueChange={handleSliderChange}
              className="py-4"
            />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Min: {formatSOL(bet.minimumBet ?? 0.1)}</span>
              <span>Max: {formatSOL(bet.maximumBet ?? 10)}</span>
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
            isSolanaLoading || 
            placeBetMutation.isPending || 
            success ||
            (balance !== null && balance < amount)
          }
          onClick={handleSubmit}
        >
          {isSolanaLoading || placeBetMutation.isPending ? (
            <span className="flex items-center">
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              {isSolanaLoading ? "Confirming on-chain..." : "Saving bet..."}
            </span>
          ) : (
            `Place ${formatSOL(amount)} on ${position.toUpperCase()}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
