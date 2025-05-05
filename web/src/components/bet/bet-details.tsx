import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatSOL, shortenAddress, calculateTimeLeft } from "@/lib/utils"
import { Clock, Users, TrendingUp } from "lucide-react"
import type { Bet } from "@/types/bet"
import { formatDistanceToNow } from "date-fns"

interface BetDetailsProps {
  bet: Bet
}

export default function BetDetails({ bet }: BetDetailsProps) {
  const timeLeft = calculateTimeLeft(bet.endTime)
  const totalPool = bet.yesPool + bet.noPool
  const yesPercentage = totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50
  const noPercentage = totalPool > 0 ? (bet.noPool / totalPool) * 100 : 50

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="capitalize bg-muted/50">
                {bet.category}
              </Badge>
              <Badge variant="outline" className={getBetStatusClass(bet.status)}>
                {getBetStatusLabel(bet.status)}
              </Badge>
            </div>
            <CardTitle className="text-2xl">{bet.title}</CardTitle>
            <CardDescription className="mt-2">
              Created by <span className="font-mono">{shortenAddress(bet.creator)}</span> •{" "}
              {formatDistanceToNow(bet.startTime, { addSuffix: true })}
            </CardDescription>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {timeLeft.days > 0 ? (
                <span>
                  {timeLeft.days}d {timeLeft.hours}h remaining
                </span>
              ) : timeLeft.hours > 0 ? (
                <span>
                  {timeLeft.hours}h {timeLeft.minutes}m remaining
                </span>
              ) : (
                <span>
                  {timeLeft.minutes}m {timeLeft.seconds}s remaining
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <Users className="mr-1 h-4 w-4" />
              <span>{bet.participants.length} participants</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>{bet.description}</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Odds</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Yes</span>
                <span className="text-sm text-muted-foreground">
                  {yesPercentage.toFixed(1)}% • {formatSOL(bet.yesPool)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-accent-green h-3 rounded-full" style={{ width: `${yesPercentage}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">No</span>
                <span className="text-sm text-muted-foreground">
                  {noPercentage.toFixed(1)}% • {formatSOL(bet.noPool)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-accent-coral h-3 rounded-full" style={{ width: `${noPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Pool</div>
            <div className="text-xl font-mono font-medium mt-1 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-accent-green" />
              {formatSOL(totalPool)}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Min Bet</div>
            <div className="text-xl font-mono font-medium mt-1">{formatSOL(bet.minimumBet)}</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Max Bet</div>
            <div className="text-xl font-mono font-medium mt-1">{formatSOL(bet.maximumBet)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getBetStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Active"
    case "closed":
      return "Closed"
    case "resolved_yes":
      return "Resolved (Yes)"
    case "resolved_no":
      return "Resolved (No)"
    case "disputed":
      return "Disputed"
    default:
      return status
  }
}

function getBetStatusClass(status: string) {
  switch (status) {
    case "active":
      return "bg-accent-green/10 text-accent-green border-accent-green/20"
    case "closed":
      return "bg-muted text-muted-foreground"
    case "resolved_yes":
      return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20"
    case "resolved_no":
      return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20"
    case "disputed":
      return "bg-accent-coral/10 text-accent-coral border-accent-coral/20"
    default:
      return ""
  }
}
