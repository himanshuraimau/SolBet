"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWalletData } from "@/store/wallet-store"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatSOL } from "@/lib/utils"
import { useCreateBet } from "@/lib/query/mutations/create-bet"
import type { BetCategory } from "@/types/bet"
import FadeIn from "@/components/motion/fade-in"
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from "@solana/web3.js"

const categories: { value: BetCategory; label: string }[] = [
  { value: "crypto", label: "Cryptocurrency" },
  { value: "sports", label: "Sports" },
  { value: "politics", label: "Politics" },
  { value: "entertainment", label: "Entertainment" },
  { value: "weather", label: "Weather" },
  { value: "other", label: "Other" },
]

export default function CreateBetPage() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { balance, refreshBalance } = useWalletData()
  const router = useRouter()
  const createBetMutation = useCreateBet()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<BetCategory>("crypto")
  const [minimumBet, setMinimumBet] = useState(0.1)
  const [maximumBet, setMaximumBet] = useState(10)
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [creatingOnChain, setCreatingOnChain] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting to prevent hydration mismatch
  useState(() => {
    setMounted(true)
  })

  // Generate a placeholder transaction for testing/development
  const createPlaceholderTransaction = async () => {
    if (!publicKey) {
      throw new Error("Wallet not connected")
    }

    // Create a connection to the Solana network
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com'
    )
    
    // Create a simple SOL transfer to self (placeholder)
    // In production, this would be replaced with actual program instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey, // Transfer to self (creates a valid transaction with minimal SOL movement)
        lamports: 1000, // 0.000001 SOL - minimal amount
      })
    )
    
    // Get a recent blockhash to include in the transaction
    const { blockhash } = await connection.getLatestBlockhash('finalized')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = publicKey
    
    return { transaction, connection }
  }

  // Function to initialize bet on-chain
  const initializeBetOnChain = async () => {
    if (!publicKey || !endDate || !sendTransaction) {
      setError("Wallet not connected")
      return false
    }

    try {
      setCreatingOnChain(true)
      
      const { transaction, connection } = await createPlaceholderTransaction()
      
      // Send the transaction using the wallet adapter
      const signature = await sendTransaction(transaction, connection)
      console.log("Transaction sent with signature:", signature)
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed')
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`)
      }
      
      console.log("Transaction confirmed:", signature)
      
      // Refresh the user's balance after the transaction
      await refreshBalance()
      
      return true
      
    } catch (err: any) {
      console.error("Error creating bet on chain:", err)
      setError(`Failed to create bet: ${err.message || "Unknown error"}`)
      return false
    } finally {
      setCreatingOnChain(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey) {
      setError("Please connect your wallet first")
      return
    }

    if (!title) {
      setError("Please enter a title for your bet")
      return
    }

    if (!description) {
      setError("Please enter a description for your bet")
      return
    }

    if (!endDate) {
      setError("Please select an end date for your bet")
      return
    }

    if (endDate < new Date()) {
      setError("End date must be in the future")
      return
    }

    setError(null)

    try {
      // Step 1: Create on-chain transaction
      const onChainSuccess = await initializeBetOnChain()
      
      if (!onChainSuccess) {
        return // Error is already set in initializeBetOnChain
      }
      
      // Step 2: After on-chain success, persist in the database
      await createBetMutation.mutateAsync({
        title,
        description,
        category,
        minimumBet,
        maximumBet,
        endTime: endDate,
        creator: publicKey.toString(),
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      setError(`Failed to create bet: ${err.message || "Please try again"}`)
      console.error("Error creating bet:", err)
    }
  }

  // If not mounted yet, show a loading placeholder to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Create a New Bet</h1>
        <Card>
          <CardContent className="flex justify-center py-10">
            <div className="animate-pulse">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect if wallet not connected
  if (!connected || !publicKey) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Create a New Bet</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl font-semibold mb-6">Connect your wallet to create a bet</h2>
            <WalletMultiButton className="wallet-adapter-button-custom bg-primary-gradient text-text-plum mb-4" />
            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="mt-4"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create a New Bet</h1>

      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Bet Details</CardTitle>
            <CardDescription>Set up your bet parameters and conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Will BTC reach $100k before July 2025?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about the bet conditions, resolution criteria, and any other important information..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as BetCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Bet Amount Range</Label>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Min: {formatSOL(minimumBet)}</span>
                    <span>Max: {formatSOL(maximumBet)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      type="number"
                      value={minimumBet}
                      onChange={(e) => setMinimumBet(Number(e.target.value))}
                      min={0.01}
                      max={maximumBet}
                      step={0.1}
                      className="w-24 font-mono"
                    />
                    <Slider
                      value={[minimumBet, maximumBet]}
                      min={0.01}
                      max={100}
                      step={0.1}
                      onValueChange={([min, max]) => {
                        setMinimumBet(min)
                        setMaximumBet(max)
                      }}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={maximumBet}
                      onChange={(e) => setMaximumBet(Number(e.target.value))}
                      min={minimumBet}
                      max={1000}
                      step={0.1}
                      className="w-24 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="end-date">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" sideOffset={4}>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="min-w-[320px]"
                    />
                  </PopoverContent>
                </Popover>
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
                  <AlertDescription>Bet created successfully! Redirecting to dashboard...</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-primary-gradient text-text-plum"
              disabled={createBetMutation.isPending || creatingOnChain || success}
              onClick={handleSubmit}
            >
              {createBetMutation.isPending || creatingOnChain ? (
                <span className="flex items-center">
                  <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  {creatingOnChain ? "Creating On-Chain..." : "Saving Bet..."}
                </span>
              ) : (
                "Create Bet"
              )}
            </Button>
          </CardFooter>
        </Card>
      </FadeIn>
    </div>
  )
}
