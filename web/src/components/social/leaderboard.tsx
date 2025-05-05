"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatSOL, shortenAddress } from "@/lib/utils"
import { Trophy, TrendingUp, Medal } from "lucide-react"
import FadeIn from "@/components/motion/fade-in"
import { useQuery } from "@tanstack/react-query"

type LeaderboardPeriod = "weekly" | "monthly" | "allTime"

// Updated API function
const fetchLeaderboardFromApi = async (period: LeaderboardPeriod) => {
  const response = await fetch(`/api/community/leaderboard?period=${period}`)
  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard")
  }
  return response.json()
}

export default function Leaderboard() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly")

  const { data: leaderboardData = [] } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => fetchLeaderboardFromApi(period),
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary-yellow" />
              Leaderboard
            </CardTitle>
            <CardDescription>Top performers on SolBet</CardDescription>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="allTime">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboardData.map((user, index) => (
            <FadeIn key={user.address} delay={index * 0.1} direction="up">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-mono font-bold">
                    {user.rank}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={getRankClass(user.rank)}>{user.address.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {shortenAddress(user.address)}
                      {user.rank <= 3 && (
                        <Badge variant="outline" className={getRankBadgeClass(user.rank)}>
                          <Medal className="h-3 w-3 mr-1" />
                          {getRankLabel(user.rank)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>Win Rate: {user.winRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium text-accent-green flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {formatSOL(user.winnings)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Winnings</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getRankClass(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-primary-gradient text-text-plum"
    case 2:
      return "bg-linear-to-r from-gray-300 to-gray-400 text-text-plum"
    case 3:
      return "bg-linear-to-r from-amber-600 to-amber-700 text-text-pearl"
    default:
      return "bg-muted"
  }
}

function getRankBadgeClass(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20"
    case 2:
      return "bg-gray-300/10 text-gray-300 border-gray-300/20"
    case 3:
      return "bg-amber-600/10 text-amber-600 border-amber-600/20"
    default:
      return ""
  }
}

function getRankLabel(rank: number): string {
  switch (rank) {
    case 1:
      return "Gold"
    case 2:
      return "Silver"
    case 3:
      return "Bronze"
    default:
      return ""
  }
}
