import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Ticket, Trophy, TrendingDown, Coins, ArrowUpRight } from "lucide-react"

// Mock activity data
const activities = [
  {
    id: "act1",
    type: "bet_placed",
    title: "Placed a bet on 'Will BTC reach $100k before July 2024?'",
    amount: 5.2,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "act2",
    type: "bet_won",
    title: "Won bet on 'Will the Lakers win against the Celtics?'",
    amount: 12.8,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: "act3",
    type: "bet_lost",
    title: "Lost bet on 'Will it rain in Miami on May 15th?'",
    amount: 2.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: "act4",
    type: "withdrawal",
    title: "Withdrew funds to wallet",
    amount: 20.0,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: "act5",
    type: "payout",
    title: "Received payout from 'Will ETH merge happen in September?'",
    amount: 15.3,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
]

export default function ActivityFeed() {
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
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
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
