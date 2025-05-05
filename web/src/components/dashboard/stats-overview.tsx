"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatSOL } from "@/lib/utils"
import type { TimeFrame } from "@/types/common"

export default function StatsOverview() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("7d")

  // Mock data for different time frames
  const data = {
    "1d": {
      winnings: 12.5,
      losses: 5.2,
      netProfit: 7.3,
      winRate: 65,
      betsPlaced: 4,
      avgBetSize: 4.4,
    },
    "7d": {
      winnings: 87.3,
      losses: 42.8,
      netProfit: 44.5,
      winRate: 58,
      betsPlaced: 15,
      avgBetSize: 8.7,
    },
    "30d": {
      winnings: 342.5,
      losses: 198.2,
      netProfit: 144.3,
      winRate: 64,
      betsPlaced: 28,
      avgBetSize: 19.3,
    },
    all: {
      winnings: 1245.8,
      losses: 903.3,
      netProfit: 342.5,
      winRate: 57,
      betsPlaced: 112,
      avgBetSize: 19.2,
    },
  }

  const currentData = data[timeFrame]

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Track your betting performance</CardDescription>
          </div>
          <Tabs value={timeFrame} onValueChange={(v) => setTimeFrame(v as TimeFrame)}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="1d" className="text-xs">
                1D
              </TabsTrigger>
              <TabsTrigger value="7d" className="text-xs">
                7D
              </TabsTrigger>
              <TabsTrigger value="30d" className="text-xs">
                30D
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Net Profit</p>
            <p
              className={`text-2xl font-medium ${currentData.netProfit >= 0 ? "text-accent-green" : "text-accent-coral"}`}
            >
              {currentData.netProfit >= 0 ? "+" : ""}
              {formatSOL(currentData.netProfit)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-medium">{currentData.winRate}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Bets Placed</p>
            <p className="text-2xl font-medium">{currentData.betsPlaced}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Winnings</p>
            <p className="text-2xl font-medium text-accent-green">+{formatSOL(currentData.winnings)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Losses</p>
            <p className="text-2xl font-medium text-accent-coral">-{formatSOL(currentData.losses)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Bet Size</p>
            <p className="text-2xl font-medium">{formatSOL(currentData.avgBetSize)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
