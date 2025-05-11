"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {BetHistoryChart} from "@/components/charts/bet-history-chart"
import PortfolioPerformance from "@/components/charts/portfolio-performance"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { formatSOL } from "@/lib/utils"
import type { TimeFrame } from "@/types/common"
import FadeIn from "@/components/motion/fade-in"
import AnimatedNumber from "@/components/motion/animated-number"
import { useUserStats } from "@/lib/query/hooks/use-user-data"

export default function AnalyticsPage() {
  const { connected } = useWallet()
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("7d")
  
  // Use the real data from our API
  const { data, isLoading, error } = useUserStats(timeFrame)
  
  // Extract stats from the API response
  const stats = data?.stats || {
    winnings: 0,
    losses: 0,
    netProfit: 0,
    winRate: 0,
    betsPlaced: 0,
    avgBetSize: 0,
    betsWon: 0,
    betsLost: 0,
    activeBets: 0
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="mb-4">Connect your wallet to view your analytics</p>
              <WalletMultiButton className="wallet-adapter-button-custom bg-primary-gradient text-text-plum" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-3 w-16 bg-muted animate-pulse rounded mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 text-center">
          <p className="text-accent-coral">Error loading analytics data. Please try again later.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FadeIn delay={0.1} direction="up">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-medium ${
                      stats.netProfit >= 0 ? "text-accent-green" : "text-accent-coral"
                    }`}
                  >
                    {stats.netProfit >= 0 ? "+" : ""}
                    <AnimatedNumber value={stats.netProfit} formatValue={(v) => formatSOL(v)} />
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
                    <AnimatedNumber value={stats.winRate} formatValue={(v) => `${v.toFixed(0)}%`} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.betsPlaced} bets placed</p>
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
                    +<AnimatedNumber value={stats.winnings} formatValue={(v) => formatSOL(v)} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.betsWon} bets won
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
                    -<AnimatedNumber value={stats.losses} formatValue={(v) => formatSOL(v)} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.betsLost} bets lost
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeIn delay={0.5} direction="up">
              <BetHistoryChart timeFrame={timeFrame} />
            </FadeIn>
            <FadeIn delay={0.6} direction="up">
              <PortfolioPerformance timeFrame={timeFrame} />
            </FadeIn>
          </div>

          <FadeIn delay={0.7} direction="up">
            <Card>
              <CardHeader>
                <CardTitle>Betting Activity</CardTitle>
                <CardDescription>Your recent betting performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Active Bets</div>
                    <div className="text-2xl font-medium mt-1">{stats.activeBets}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Average Bet</div>
                    <div className="text-2xl font-medium mt-1">{formatSOL(stats.avgBetSize)}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Win/Loss Ratio</div>
                    <div className="text-2xl font-medium mt-1">
                      {stats.betsLost > 0 ? (stats.betsWon / stats.betsLost).toFixed(2) : stats.betsWon > 0 ? "∞" : "0"}
                    </div>
                  </div>
                </div>

                {/* More detailed betting activity will be added in future updates */}
                {data?.betHistory && data.betHistory.length > 0 ? (
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted/50">
                        <tr>
                          <th scope="col" className="px-6 py-3">Date</th>
                          <th scope="col" className="px-6 py-3">Type</th>
                          <th scope="col" className="px-6 py-3">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.betHistory.slice(0, 5).map((tx: any, i: number) => (
                          <tr key={i} className="border-b border-muted/30">
                            <td className="px-6 py-4">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 capitalize">{tx.type}</td>
                            <td className={`px-6 py-4 ${
                              tx.type === 'winnings' ? 'text-accent-green' : 'text-accent-coral'
                            }`}>
                              {tx.type === 'winnings' ? '+' : '-'}{formatSOL(tx.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No betting activity found for this time period
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </>
      )}
    </div>
  )
}
