"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/providers/wallet-provider"
import { formatSOL, calculateOdds } from "@/lib/utils"
import type { Bet } from "@/types/bet"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PlaceBetFormProps {
  bet: Bet
}

export default function PlaceBetForm({ bet }: PlaceBetFormProps) {
  const { wallet } = useWallet()
  const [position, setPosition] = useState<"yes" | "no">("yes")
  const [amount, setAmount] = useState<number>(bet.minimumBet)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPool = bet.yesPool + bet.noPool
  const odds = calculateOdds(bet.yesPool, bet.noPool, position)
  const potentialReturn = amount * odds

  const handleAmountChange = (value: number) => {
    // Ensure amount is within min/max range
    const newAmount = Math.max(bet.minimumBet, Math.min(bet.maximumBet, value))
    setAmount(newAmount)
  }

  const handleSliderChange = (value: number[]) => {
    handleAmountChange(value[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet) {
      setError("Please connect your wallet first")
      return
    }

    if (amount > wallet.balance) {
      setError("Insufficient balance")
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate success
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError("Failed to place bet. Please try again.")
    } finally {
      setSubmitting(false)
    }
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
                Balance: {wallet ? formatSOL(wallet.balance) : "0 SOL"}
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
          disabled={!wallet || submitting || success}
          onClick={handleSubmit}
        >
          {submitting ? (
            <span className="flex items-center">
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Processing...
            </span>
          ) : (
            `Place ${formatSOL(amount)} on ${position.toUpperCase()}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
