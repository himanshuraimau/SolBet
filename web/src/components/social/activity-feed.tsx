"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatSOL, shortenAddress } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Ticket, Trophy, TrendingDown, Coins, ArrowUpRight } from "lucide-react"
import FadeIn from "@/components/motion/fade-in"
import { useQuery } from "@tanstack/react-query"

// Updated API function
const fetchCommunityActivityFromApi = async () => {
  const response = await fetch("/api/community/activity")
  if (!response.ok) {
    throw new Error("Failed to fetch community activity")
  }
  return response.json()
}

export default function SocialActivityFeed() {
  const { data: activities = [] } = useQuery({
    queryKey: ["communityActivity"],
    queryFn: fetchCommunityActivityFromApi,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Activity</CardTitle>
        <CardDescription>Recent activity from the SolBet community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <FadeIn key={activity.id} delay={index * 0.1} direction="up">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{activity.user.address.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-medium">{shortenAddress(activity.user.address)}</span>
                        <span className="text-muted-foreground">{activity.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                    <div className={`flex items-center ${getActivityAmountClass(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                      <span className="font-mono ml-1">
                        {getActivityAmountPrefix(activity.type)}
                        {formatSOL(activity.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getActivityIcon(type: string) {
  switch (type) {
    case "bet_placed":
      return <Ticket className="h-4 w-4" />
    case "bet_won":
      return <Trophy className="h-4 w-4" />
    case "bet_lost":
      return <TrendingDown className="h-4 w-4" />
    case "withdrawal":
      return <ArrowUpRight className="h-4 w-4" />
    case "payout":
      return <Coins className="h-4 w-4" />
    default:
      return <Ticket className="h-4 w-4" />
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
