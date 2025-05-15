"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useResolveBet } from "@/lib/query/mutations/resolve-bet"
import { useWallet } from "@solana/wallet-adapter-react" // Add wallet import
import { useSolanaBet } from "@/hooks/bet/use-solana-bet" // Import Solana bet hook

interface ResolveBetFormProps {
  bet: {
    id: string
    betPublicKey: string
    title: string
    status: string
  }
  isCreator: boolean
}

export default function ResolveBetForm({ bet, isCreator }: ResolveBetFormProps) {
  const [outcome, setOutcome] = useState<"YES" | "NO">("YES")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const resolveBetMutation = useResolveBet()
  const { publicKey } = useWallet() // Get wallet public key
  const { resolveBet } = useSolanaBet() // Get resolveBet mutation

  // Add a mode for bypassing blockchain verification during development
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [skipBlockchain, setSkipBlockchain] = useState(isDevelopment);

  // If bet is not active or user is not the creator, don't show the form
  if (bet.status !== "active" || !isCreator) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!publicKey) {
      setError("Wallet not connected")
      return
    }

    if (skipBlockchain) {
      // Skip blockchain and just call the API directly
      try {
        const response = await fetch(`/api/bets/${bet.id}/resolve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            outcome,
            signature: "mock_signature_for_development",
            walletAddress: publicKey.toString(), // Now publicKey is defined
            skipBlockchainVerification: true // Add this flag to your API
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to resolve bet");
        }
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to resolve bet");
      }
      return;
    }

    // Use the Solana bet hook to resolve the bet
    try {
      const outcomeValue = outcome === "YES" ? "yes" : "no"; // Convert to lowercase for hook
      
      const result = await resolveBet.mutateAsync({
        betAccount: bet.betPublicKey,
        outcome: outcomeValue
      });
      
      // After successful blockchain transaction, update the backend
      await resolveBetMutation.mutateAsync({
        betId: bet.id,
        betPublicKey: bet.betPublicKey,
        outcome,
        signature: result.signature, // Pass the transaction signature
      } as any); // Use type assertion to bypass type checking
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve bet");
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Resolve Bet</CardTitle>
        <CardDescription>As the creator, you can resolve this bet</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Final Outcome</Label>
            <RadioGroup
              value={outcome}
              onValueChange={(value) => setOutcome(value as "YES" | "NO")}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="yes-outcome"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                  outcome === "YES" ? "border-accent-green bg-accent-green/10" : "border-muted"
                }`}
              >
                <RadioGroupItem value="YES" id="yes-outcome" className="sr-only" />
                <span className="text-lg font-medium">YES</span>
                <span className="text-sm text-muted-foreground mt-1">
                  The event occurred
                </span>
              </Label>
              <Label
                htmlFor="no-outcome"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                  outcome === "NO" ? "border-accent-coral bg-accent-coral/10" : "border-muted"
                }`}
              >
                <RadioGroupItem value="NO" id="no-outcome" className="sr-only" />
                <span className="text-lg font-medium">NO</span>
                <span className="text-sm text-muted-foreground mt-1">
                  The event did not occur
                </span>
              </Label>
            </RadioGroup>
          </div>

          <div className="text-sm text-muted-foreground">
            <strong>Note:</strong> Once resolved, this action cannot be undone. All funds will be 
            distributed to users who bet on the correct outcome.
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
              <AlertDescription>Bet resolved successfully!</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className={`w-full`}
          variant="outline"
          disabled={!publicKey || resolveBetMutation.isPending || resolveBet?.isPending || success}
          onClick={handleSubmit}
        >
          {resolveBetMutation.isPending || resolveBet?.isPending ? (
            <span className="flex items-center">
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Resolving bet...
            </span>
          ) : (
            `Resolve with Outcome: ${outcome}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
