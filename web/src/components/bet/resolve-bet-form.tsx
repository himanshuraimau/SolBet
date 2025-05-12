"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useWallet } from "@solana/wallet-adapter-react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Bet } from "@/types/bet"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useSolanaBet } from "@/hooks/bet/use-solana-bet"
import { queryKeys } from "@/lib/query/config"

interface ResolveBetFormProps {
  bet: Bet
  isCreator: boolean
}

export default function ResolveBetForm({ bet, isCreator }: ResolveBetFormProps) {
  const { publicKey, connected } = useWallet()
  const [outcome, setOutcome] = useState<"yes" | "no">("yes")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { settleBet, isLoading } = useSolanaBet()

  // Check if the bet can be resolved
  const canBeResolved = isCreator && bet.status === "active" && new Date(bet.endTime) <= new Date()

  // Set up the mutation for resolving a bet
  const resolveBetMutation = useMutation({
    mutationFn: async () => {
      if (!publicKey) {
        throw new Error("Please connect your wallet first")
      }

      if (!isCreator) {
        throw new Error("Only the creator can resolve this bet")
      }

      if (bet.status !== "active") {
        throw new Error("This bet cannot be resolved because it's not active")
      }
      
      // Step 1: Fetch the Solana accounts for this bet
      const accountsResponse = await fetch(`/api/bets/${bet.id}/solana-address`)
      
      if (!accountsResponse.ok) {
        const errorData = await accountsResponse.json()
        throw new Error(errorData.error || "Failed to fetch Solana addresses")
      }
      
      const { betAccount, escrowAccount } = await accountsResponse.json()

      // Step 2: Process the bet on Solana blockchain
      const onChainResult = await settleBet.mutateAsync({
        betAccount: betAccount,
        escrowAccount: escrowAccount,
        outcome: outcome
      })
      
      if (!onChainResult) {
        throw new Error("Failed to resolve bet on blockchain")
      }
      
      // Step 3: Update the database through our API
      const response = await fetch(`/api/bets/resolve/${bet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          outcome: outcome,
          onChainTxId: onChainResult.signature
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update bet status in database")
      }

      return await response.json()
    },
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(bet.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.lists() })
      setSuccess(true)
      
      toast({
        title: "Bet resolved successfully!",
        description: `You resolved the bet with outcome: ${outcome.toUpperCase()}`,
      })
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    },
    onError: (error) => {
      setError(error.message || "Failed to resolve bet")
      toast({
        title: "Failed to resolve bet",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey) {
      setError("Please connect your wallet first")
      return
    }

    // Reset previous errors
    setError(null)
    
    try {
      setSuccess(false)
      await resolveBetMutation.mutateAsync()
    } catch (err) {
      // Error handling is done in the mutation callbacks
      console.error("Error resolving bet:", err)
    }
  }

  // If bet is already resolved, show outcome
  if (bet.status === "resolved_yes" || bet.status === "resolved_no") {
    const finalOutcome = bet.status === "resolved_yes" ? "yes" : "no";
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Bet Resolution</CardTitle>
          <CardDescription>This bet has been resolved</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              The outcome was: <strong>{finalOutcome.toUpperCase()}</strong>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // If user is not the creator, don't show the form
  if (!isCreator) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resolve Bet</CardTitle>
        <CardDescription>
          As the creator of this bet, you can determine the outcome
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!connected ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <p className="text-center text-sm text-gray-500">
              Connect your wallet to resolve this bet
            </p>
            <WalletMultiButton />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select the outcome</Label>
                <RadioGroup 
                  value={outcome} 
                  onValueChange={(value) => setOutcome(value as "yes" | "no")}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="font-normal">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="font-normal">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Bet resolved successfully with outcome: {outcome.toUpperCase()}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <CardFooter className="flex justify-end pt-4 px-0">
              <Button 
                type="submit" 
                disabled={isLoading || success || !canBeResolved}
              >
                {isLoading ? "Processing..." : "Resolve Bet"}
              </Button>
            </CardFooter>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
