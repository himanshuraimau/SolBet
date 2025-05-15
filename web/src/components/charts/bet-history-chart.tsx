"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Skeleton } from "../ui/skeleton"
import type { TimeFrame } from "@/types/common"
import { useBettingHistory } from "@/lib/query/hooks/use-user-data"

interface BetHistoryChartProps {
  timeFrame?: TimeFrame;
}

export function BetHistoryChart({ timeFrame: externalTimeFrame }: BetHistoryChartProps) {
  const [internalTimeFrame, setInternalTimeFrame] = useState<TimeFrame>("7d")
  // Use the external timeFrame if provided, otherwise use the internal state
  const timeFrame = externalTimeFrame || internalTimeFrame
  const { data, isLoading } = useBettingHistory(timeFrame)

  const handleTimeFrameChange = (value: string) => {
    setInternalTimeFrame(value as TimeFrame)
  }

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Betting Activity</CardTitle>
          <CardDescription>Your betting activity over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  // Group bets by date and count them
  const aggregatedData = data ? data.reduce((acc, bet) => {
    const date = new Date(bet.timestamp)
    let dateKey: string
    
    if (timeFrame === "1d") {
      // Group by hour for 1d
      dateKey = `${date.getHours()}:00`
    } else if (timeFrame === "7d") {
      // Group by day for 7d
      dateKey = date.toLocaleDateString('en-US', { weekday: 'short' })
    } else if (timeFrame === "30d") {
      // Group by week for 30d
      const day = date.getDate()
      const weekNumber = Math.floor((day - 1) / 7) + 1
      dateKey = `Week ${weekNumber}`
    } else {
      // Group by month for all
      dateKey = date.toLocaleDateString('en-US', { month: 'short' })
    }
    
    if (!acc[dateKey]) {
      acc[dateKey] = { name: dateKey, wins: 0, losses: 0 }
    }
    
    if (bet.type === "WIN") {
      acc[dateKey].wins++
    } else if (bet.type === "LOSS") {
      acc[dateKey].losses++
    }
    
    return acc
  }, {} as Record<string, { name: string; wins: number; losses: number }>) : {};

  const chartData = Object.values(aggregatedData)

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Betting Activity</CardTitle>
          <CardDescription>Your betting activity over time</CardDescription>
        </div>
        {/* Only show tabs if external timeFrame is not provided */}
        {!externalTimeFrame && (
          <Tabs value={timeFrame} onValueChange={handleTimeFrameChange}>
            <TabsList>
              <TabsTrigger value="1d">Day</TabsTrigger>
              <TabsTrigger value="7d">Week</TabsTrigger>
              <TabsTrigger value="30d">Month</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="wins" stackId="a" fill="#10b981" name="Wins" />
              <Bar dataKey="losses" stackId="a" fill="#ef4444" name="Losses" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No betting activity during this period</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
