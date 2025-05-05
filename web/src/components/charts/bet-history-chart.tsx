"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatSOL } from "@/lib/utils"
import type { TimeFrame } from "@/types/common"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import { format } from "date-fns"

// Mock data
const generateMockData = (timeFrame: TimeFrame) => {
  const now = new Date()
  const data = []

  let days = 0
  switch (timeFrame) {
    case "1d":
      days = 1
      break
    case "7d":
      days = 7
      break
    case "30d":
      days = 30
      break
    case "all":
      days = 90
      break
  }

  const points = timeFrame === "1d" ? 24 : days // Hourly for 1d, daily for others
  const interval = timeFrame === "1d" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // Milliseconds

  let cumulativeWinnings = 0
  let previousValue = 100 // Starting balance

  for (let i = 0; i < points; i++) {
    const date = new Date(now.getTime() - (points - i) * interval)

    // Generate some random movement
    const change = Math.random() * 20 - 10 // Random value between -10 and 10
    const newValue = Math.max(0, previousValue + change)
    previousValue = newValue

    cumulativeWinnings += change

    data.push({
      date,
      balance: newValue,
      winnings: cumulativeWinnings,
    })
  }

  return data
}

interface BetHistoryChartProps {
  className?: string
}

export default function BetHistoryChart({ className }: BetHistoryChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("7d")
  const data = generateMockData(timeFrame)

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Betting Performance</CardTitle>
            <CardDescription>Track your betting history over time</CardDescription>
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
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => {
                  if (timeFrame === "1d") {
                    return format(new Date(date), "HH:mm")
                  }
                  return format(new Date(date), "MMM dd")
                }}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis tickFormatter={(value) => `${value} SOL`} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="var(--primary-yellow)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "var(--primary-yellow)" }}
              />
              <Line
                type="monotone"
                dataKey="winnings"
                stroke="var(--secondary-violet)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "var(--secondary-violet)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary-yellow mr-2" />
            <span className="text-sm text-muted-foreground">Balance</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-secondary-violet mr-2" />
            <span className="text-sm text-muted-foreground">Cumulative Winnings</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="text-sm font-medium">{format(new Date(label), "MMM dd, yyyy HH:mm")}</p>
        <p className="text-sm text-muted-foreground">
          Balance: <span className="font-mono text-primary-yellow">{formatSOL(payload[0].value as number)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Winnings: <span className="font-mono text-secondary-violet">{formatSOL(payload[1].value as number)}</span>
        </p>
      </div>
    )
  }

  return null
}
