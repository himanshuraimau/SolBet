"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BetHistoryChart from "@/components/charts/bet-history-chart"
import PortfolioPerformance from "@/components/charts/portfolio-performance"
import { useWallet } from "@/providers/wallet-provider"
import { formatSOL } from "@/lib/utils"
import type { TimeFrame } from "@/types/common"
import FadeIn from "@/components/motion/fade-in"
import AnimatedNumber from "@/components/motion/animated-number"

export default function AnalyticsPage() {
  const { wallet } = useWallet()
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

  if (!wallet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="mb-4">Connect your wallet to view your analytics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <Tabs value={timeFrame} onValueChange={(v) => setTimeFrame(v as TimeFrame)}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="1d">1D</TabsTrigger>
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="30d">30D</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={0.1} direction="up">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-medium ${
                  currentData.netProfit >= 0 ? "text-accent-green" : "text-accent-coral"
                }`}
              >
                {currentData.netProfit >= 0 ? "+" : ""}
                <AnimatedNumber value={currentData.netProfit} formatValue={(v) => formatSOL(v)} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {timeFrame === "1d"
                  ? "Today"
                  : timeFrame === "7d"
                    ? "This week"
                    : timeFrame === "30d"
                      ? "This month"
                      : "All time"}
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2} direction="up">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">
                <AnimatedNumber value={currentData.winRate} formatValue={(v) => `${v.toFixed(0)}%`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{currentData.betsPlaced} bets placed</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3} direction="up">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Winnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium text-accent-green">
                +<AnimatedNumber value={currentData.winnings} formatValue={(v) => formatSOL(v)} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {timeFrame === "1d"
                  ? "Today"
                  : timeFrame === "7d"
                    ? "This week"
                    : timeFrame === "30d"
                      ? "This month"
                      : "All time"}
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4} direction="up">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Losses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium text-accent-coral">
                -<AnimatedNumber value={currentData.losses} formatValue={(v) => formatSOL(v)} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {timeFrame === "1d"
                  ? "Today"
                  : timeFrame === "7d"
                    ? "This week"
                    : timeFrame === "30d"
                      ? "This month"
                      : "All time"}
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FadeIn delay={0.5} direction="up">
          <BetHistoryChart />
        </FadeIn>
        <FadeIn delay={0.6} direction="up">
          <PortfolioPerformance />
        </FadeIn>
      </div>

      <FadeIn delay={0.7} direction="up">
        <Card>
          <CardHeader>
            <CardTitle>Betting Activity</CardTitle>
            <CardDescription>Your recent betting performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Coming soon: Detailed betting activity analysis
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
