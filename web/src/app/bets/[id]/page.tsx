"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useBet } from "@/lib/query/hooks/use-bets"
import { useWallet } from "@solana/wallet-adapter-react"
import ResolveBetForm from "@/components/bet/resolve-bet-form"
import PlaceBetForm from "@/components/bet/place-bet-form"
import WithdrawFundsForm from "@/components/bet/withdraw-funds-form"
import { CardHeader, CardTitle, CardDescription, CardContent, Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatSOL } from "@/lib/utils"
import { calculateTimeLeft, formatDateTime } from "@/lib/date-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function BetPage() {
  const params = useParams()
  const { publicKey } = useWallet()
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const betId = params?.id as string

  // Use the custom hook to get bet data
  const { data: bet, isLoading, error, solanaBetData } = useBet(betId)

  // Check if the current user is the creator of the bet
  const isCreator = bet?.creator === publicKey?.toString()
  
  // Check if user has participated in this bet
  const hasUserParticipated = bet?.participants?.some((p: { walletAddress: string | undefined }) => 
    p.walletAddress === publicKey?.toString()
  ) || false
  
  // Find user's bet details if they've participated
  const userBet = bet?.participants?.find((p: { walletAddress: string | undefined }) => 
    p.walletAddress === publicKey?.toString()
  )
  
  // Determine if user can withdraw funds:
  // - If bet is resolved (resolved_yes or resolved_no)
  // - If bet has expired
  // - If user has participated
  const canWithdraw = hasUserParticipated && (
    bet?.status.startsWith('resolved_') || 
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
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !bet) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Failed to load bet details"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const hasExpired = new Date(bet.endTime) <= new Date()

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Bet details card */}
      <Card>
        <CardHeader>
          <CardTitle>{bet.title}</CardTitle>
          <CardDescription>
            Created by {bet.creator.slice(0, 6)}...{bet.creator.slice(-4)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{bet.description}</p>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Total Pool</p>
                <p className="font-medium">{formatSOL(bet.yesPool + bet.noPool)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Yes Pool</p>
                <p className="font-medium">{formatSOL(bet.yesPool)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">No Pool</p>
                <p className="font-medium">{formatSOL(bet.noPool)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{bet.status}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Min Bet</p>
                <p className="font-medium">{formatSOL(bet.minimumBet)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Bet</p>
                <p className="font-medium">{formatSOL(bet.maximumBet)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expires</p>
                <p className="font-medium">
                  {formatDateTime(bet.endTime)}
                  {!hasExpired && timeLeft && (
                    <span className="ml-2 text-xs text-gray-500">({timeLeft})</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Place bet form */}
      {bet.status === "active" && !hasExpired && (
        <PlaceBetForm bet={bet} />
      )}

      {/* Resolve bet form - only shown to the creator */}
      {isCreator && (
        <ResolveBetForm bet={bet} isCreator={isCreator} />
      )}

      {/* Withdraw funds form - shown to participants */}
      {publicKey && (
        <WithdrawFundsForm 
          bet={bet} 
          userBetAccount={userBet?.onChainUserBetAccount} 
          canWithdraw={canWithdraw}
          hasUserParticipated={hasUserParticipated}
        />
      )}
    </div>
  )
}
