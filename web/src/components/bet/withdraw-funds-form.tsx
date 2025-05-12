"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Bet } from "@/types/bet"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useSolanaBet } from "@/hooks/bet/use-solana-bet"
import { queryKeys } from "@/lib/query/config"

interface WithdrawFundsFormProps {
  bet: Bet
  userBetAccount?: string
  canWithdraw: boolean
  hasUserParticipated: boolean
}

export default function WithdrawFundsForm({ 
  bet, 
  userBetAccount, 
  canWithdraw, 
  hasUserParticipated 
}: WithdrawFundsFormProps) {
  const { publicKey, connected } = useWallet()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { withdraw, isLoading } = useSolanaBet()

  // Set up the mutation for withdrawing funds
  const withdrawFundsMutation = useMutation({
    mutationFn: async () => {
      if (!publicKey) {
        throw new Error("Please connect your wallet first")
      }

      if (!userBetAccount) {
        throw new Error("User bet account not found")
      }

      if (!hasUserParticipated) {
        throw new Error("You have not participated in this bet")
      }

      if (!canWithdraw) {
        throw new Error("You cannot withdraw funds from this bet at this time")
      }
      
      // Step 1: Fetch the Solana accounts for this bet
      const accountsResponse = await fetch(`/api/bets/${bet.id}/solana-address`)
      
      if (!accountsResponse.ok) {
        const errorData = await accountsResponse.json()
        throw new Error(errorData.error || "Failed to fetch Solana addresses")
      }
      
      const { betAccount, escrowAccount } = await accountsResponse.json()

      // Step 2: Process the withdrawal on Solana blockchain
      const onChainResult = await withdraw.mutateAsync({
        betAccount: betAccount,
        escrowAccount: escrowAccount,
        userBetAccount: userBetAccount
      })
      
      if (!onChainResult) {
        throw new Error("Failed to withdraw funds from blockchain")
      }
      
      // Step 3: Update the database through our API
      const response = await fetch(`/api/bets/${bet.id}/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          onChainTxId: onChainResult.signature
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update withdrawal status in database")
      }

      return await response.json()
    },
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.bets.detail(bet.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.bets() })
      setSuccess(true)
      
      toast({
        title: "Funds withdrawn successfully!",
        description: "Your funds have been sent to your wallet",
      })
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    },
    onError: (error) => {
      setError(error.message || "Failed to withdraw funds")
      toast({
        title: "Failed to withdraw funds",
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
      await withdrawFundsMutation.mutateAsync()
    } catch (err) {
      // Error handling is done in the mutation callbacks
      console.error("Error withdrawing funds:", err)
    }
  }

  if (!hasUserParticipated) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
          <CardDescription>You have not participated in this bet</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to place a bet before you can withdraw any funds.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // If user can't withdraw (bet is still active and not resolved)
  if (!canWithdraw) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
          <CardDescription>Not available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {bet.status === "active" 
                ? "You can withdraw your funds after the bet is resolved or expires." 
                : "This bet is being resolved. Check back soon to withdraw your funds."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <CardDescription>
          {bet.status.startsWith("resolved") 
            ? "Claim your winnings from this bet" 
            : "Withdraw your funds from this expired bet"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!connected ? (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-4">
              Please connect your wallet to withdraw funds
            </p>
            <WalletMultiButton className="w-full" />
          </div>
        ) : success ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Funds withdrawn successfully!
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-primary-gradient text-text-plum"
          disabled={!connected || isLoading || success}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Processing Withdrawal...
            </span>
          ) : (
            "Withdraw Funds"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
