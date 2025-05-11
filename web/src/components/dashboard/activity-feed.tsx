import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Ticket, Trophy, TrendingDown, Coins, ArrowUpRight, Loader2 } from "lucide-react"
import { useUserActivity } from "@/lib/query/hooks/use-user-activity"
import { Button } from "../ui/button"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"

export default function ActivityFeed() {
  const { publicKey, connected } = useWallet()
  const { data: activities, isLoading, error } = useUserActivity(5)

  if (!connected || !publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest betting activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Connect your wallet to view your activity</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/wallet-connect">Connect Wallet</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Loading your activity...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>There was an error loading your activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Failed to load your betting activity</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no activities are found
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest betting activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No activity found</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/browse">Browse Bets</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest betting activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative pl-6">
              {/* Timeline connector */}
              {index < activities.length - 1 && <div className="absolute left-2.5 top-6 h-full w-px bg-border" />}

              {/* Activity icon */}
              <div
                className={`absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full ${getActivityIconClass(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
              </div>

              {/* Activity content */}
              <div>
                <div className="font-medium">{activity.title}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                  <div className={`text-sm font-mono font-medium ${getActivityAmountClass(activity.type)}`}>
                    {getActivityAmountPrefix(activity.type)}
                    {activity.amount} SOL
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getActivityIcon(type: string) {
  switch (type) {
    case "bet_placed":
      return <Ticket className="h-3 w-3" />
    case "bet_won":
      return <Trophy className="h-3 w-3" />
    case "bet_lost":
      return <TrendingDown className="h-3 w-3" />
    case "withdrawal":
      return <ArrowUpRight className="h-3 w-3" />
    case "payout":
      return <Coins className="h-3 w-3" />
    default:
      return <Ticket className="h-3 w-3" />
  }
}

function getActivityIconClass(type: string) {
  switch (type) {
    case "bet_placed":
      return "bg-secondary-violet/10 text-secondary-violet"
    case "bet_won":
      return "bg-accent-green/10 text-accent-green"
    case "bet_lost":
      return "bg-accent-coral/10 text-accent-coral"
    case "withdrawal":
      return "bg-accent-coral/10 text-accent-coral"
    case "payout":
      return "bg-primary-yellow/10 text-primary-yellow"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getActivityAmountClass(type: string) {
  switch (type) {
    case "bet_won":
    case "payout":
      return "text-accent-green"
    case "bet_lost":
    case "withdrawal":
    case "bet_placed":
      return "text-accent-coral"
    default:
      return ""
  }
}

function getActivityAmountPrefix(type: string) {
  switch (type) {
    case "bet_won":
    case "payout":
      return "+"
    case "bet_lost":
    case "withdrawal":
    case "bet_placed":
      return "-"
    default:
      return ""
  }
}
