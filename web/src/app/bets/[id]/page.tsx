"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useBetById } from "@/hooks/bet/use-bet-by-id" // Use the new hook
import { useWallet } from "@solana/wallet-adapter-react"
import ResolveBetForm from "@/components/bet/resolve-bet-form"
import PlaceBetForm from "@/components/bet/place-bet-form"
import WithdrawFundsForm from "@/components/bet/withdraw-funds-form"
import BetDetails from "@/components/bet/bet-details"
import ParticipantsList from "@/components/bet/participants-list"
import OddsProgress from "@/components/charts/odds-progress"

import { CardHeader, CardTitle, CardDescription, CardContent, Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatSOL } from "@/lib/utils"
import { calculateTimeLeft, formatDateTime } from "@/lib/date-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import FadeIn from "@/components/motion/fade-in"

export default function BetPage() {
  const params = useParams()
  const { publicKey } = useWallet()
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const betId = params?.id as string

  // Use the new hook that properly invalidates the cache
  const { data: bet, isLoading, error } = useBetById(betId)

  // Check if the current user is the creator of the bet
  const isCreator = bet?.creatorAddress === publicKey?.toString()
  
  // Check if user has participated in this bet
  const hasUserParticipated = bet?.participants?.some(p => 
    p.walletAddress === publicKey?.toString()
  ) || false
  
  // Find user's bet details if they've participated
  const userBet = bet?.participants?.find(p => 
    p.walletAddress === publicKey?.toString()
  )
  
  // Determine if user can withdraw funds:
  // - If bet is resolved
  // - If bet has expired
  // - If user has participated
  const canWithdraw = hasUserParticipated && (
    bet?.status === 'resolved' || 
    (bet?.status === 'active' && new Date(bet?.endTime) <= new Date())
  )

  // Update time left every second
  useEffect(() => {
    if (!bet) return
    
    const updateTimeLeft = () => {
      const timeLeftStr = calculateTimeLeft(new Date(bet.endTime))
      setTimeLeft(timeLeftStr)
    }
    
    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)
    
    return () => clearInterval(interval)
  }, [bet])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !bet) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">Bet not found</h2>
        <p className="text-muted-foreground mt-2">The bet you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  const hasExpired = new Date(bet.endTime) <= new Date()
  const totalPool = bet.yesPool + bet.noPool
  const yesPercentage = totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50
  const noPercentage = totalPool > 0 ? (bet.noPool / totalPool) * 100 : 50

  return (
    <div className="container mx-auto py-10 space-y-10">
      {/* Bet details section */}
      <FadeIn>
        <Card className="p-2">
          <BetDetails bet={bet} timeLeft={timeLeft} />
        </Card>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-10">
          <FadeIn delay={0.1}>
            <Card className="p-6">
              <ParticipantsList participants={bet.participants} />
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Bet Odds</CardTitle>
                <CardDescription>Current distribution of the betting pool</CardDescription>
              </CardHeader>
              <CardContent>
                <OddsProgress yesPool={bet.yesPool} noPool={bet.noPool} />
              </CardContent>
            </Card>
          </FadeIn>
        </div>
        
        <div className="space-y-8">
          <FadeIn delay={0.4} direction="left">
            {/* Place bet form */}
            {bet.status === "active" && !hasExpired && (
              <Card className="p-4">
                <PlaceBetForm bet={bet} />
              </Card>
            )}

            {/* Resolve bet form - only shown to the creator */}
            {isCreator && bet.status === "active" && (
              <Card className="p-4 mt-6">
                <ResolveBetForm bet={bet} isCreator={isCreator} />
              </Card>
            )}

            {/* Withdraw funds form - shown to participants */}
            {publicKey && (
              <Card className="p-4 mt-6">
                <WithdrawFundsForm 
                  bet={bet} 
                  userBetAccount={userBet?.onChainUserBetAccount} 
                  canWithdraw={canWithdraw}
                  hasUserParticipated={hasUserParticipated}
                />
              </Card>
            )}
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
