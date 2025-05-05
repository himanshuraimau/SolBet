"use client"
import { useParams } from "next/navigation"
import BetDetails from "@/components/bet/bet-details"
import PlaceBetForm from "@/components/bet/place-bet-form"
import ParticipantsList from "@/components/bet/participants-list"
import OddsProgress from "@/components/charts/odds-progress"
import WinProbability from "@/components/charts/win-probability"
import { useBet } from "@/lib/query/hooks/use-bets"
import { Skeleton } from "@/components/ui/skeleton"
import FadeIn from "@/components/motion/fade-in"

export default function BetPage() {
  const params = useParams()
  const betId = params?.id as string
  const { data: bet, isLoading, error } = useBet(betId)

  if (isLoading) {
    return (
      <div className="space-y-8">
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

  const totalPool = bet.yesPool + bet.noPool
  const yesPercentage = totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50
  const noPercentage = totalPool > 0 ? (bet.noPool / totalPool) * 100 : 50

  return (
    <div className="space-y-8">
      <FadeIn>
        <BetDetails bet={bet} />
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="space-y-8">
            <FadeIn delay={0.1}>
              <ParticipantsList participants={bet.participants} />
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FadeIn delay={0.2}>
                <OddsProgress yesPool={bet.yesPool} noPool={bet.noPool} />
              </FadeIn>
              <FadeIn delay={0.3}>
                <WinProbability yesPercentage={yesPercentage} noPercentage={noPercentage} />
              </FadeIn>
            </div>
          </div>
        </div>
        <div>
          <FadeIn delay={0.4} direction="left">
            <PlaceBetForm bet={bet} />
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
