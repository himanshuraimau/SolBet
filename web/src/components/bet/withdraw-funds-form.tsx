"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@solana/wallet-adapter-react"
import { useSolanaBet } from "@/hooks/bet/use-solana-bet"
import { toast } from "@/hooks/use-toast"
import type { Bet, WithdrawFundsFormProps } from "@/types/bet"

export default function WithdrawFundsForm({ 
  bet, 
  userBetAccount, 
  canWithdraw, 
  hasUserParticipated 
}: WithdrawFundsFormProps) {
  const { publicKey } = useWallet()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Get the withdrawBet mutation directly
  const { withdrawBet } = useSolanaBet()
  
  const handleWithdraw = async () => {
    if (!publicKey || !userBetAccount || !withdrawBet) {
      setError("Wallet not connected or bet account not found")
      return
    }
    
    try {
      setError(null)
      setIsLoading(true)
      
      // Call the withdrawBet function from the hook with proper params
      const result = await withdrawBet.mutateAsync({
        betAccount: bet.id,
        userBetAccount
      });
      
      console.log("Withdrawal transaction:", result.signature);
      
      setSuccess(true)
      toast({
        title: "Withdrawal successful",
        description: "Your funds have been sent to your wallet",
      })
    } catch (err: any) {
      console.error("Error withdrawing funds:", err)
      setError(err.message || "Failed to withdraw funds")
      toast({
        title: "Withdrawal failed",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!hasUserParticipated) {
    return null // Don't show this component if user hasn't participated
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <CardDescription>
          {canWithdraw 
            ? "Withdraw your winnings or get your funds back" 
            : "This bet is still active"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canWithdraw ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between mb-2">
                <span>Status</span>
                <span className="font-medium">
                  {bet.status.startsWith('resolved') ? "Resolved" : "Expired"}
                </span>
              </div>
              {bet.status === 'resolved_yes' && (
                <div className="flex justify-between">
                  <span>Outcome</span>
                  <span className="font-medium text-accent-green">YES</span>
                </div>
              )}
              {bet.status === 'resolved_no' && (
                <div className="flex justify-between">
                  <span>Outcome</span>
                  <span className="font-medium text-accent-coral">NO</span>
                </div>
              )}
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
                <AlertDescription>Funds successfully withdrawn!</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">
            You can withdraw your funds once the bet is resolved or expired.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleWithdraw}
          disabled={!canWithdraw || !publicKey || isLoading || success || !withdrawBet}
          className="w-full"
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            "Withdraw Funds"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
