"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
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

const categories: { value: BetCategory; label: string }[] = [
  { value: "crypto", label: "Cryptocurrency" },
  { value: "sports", label: "Sports" },
  { value: "politics", label: "Politics" },
  { value: "entertainment", label: "Entertainment" },
  { value: "weather", label: "Weather" },
  { value: "other", label: "Other" },
]

export default function CreateBetPage() {
  const { publicKey, connected } = useWallet()
  const { balance } = useWalletData()
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

  // Redirect if wallet not connected
  if (!connected || !publicKey) {
    return (
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card p-8 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-4">Connect your wallet to create a bet</h2>
            {/* You can add WalletMultiButton here if needed */}
            <button 
              className="btn-primary mt-4"
              onClick={() => router.push("/")}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
    } catch (err) {
      setError("Failed to create bet. Please try again.")
    }
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
                  placeholder="Will BTC reach $100k before July 2024?"
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
              disabled={createBetMutation.isPending || success}
              onClick={handleSubmit}
            >
              {createBetMutation.isPending ? (
                <span className="flex items-center">
                  <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Creating Bet...
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
