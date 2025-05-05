"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatSOL } from "@/lib/utils"
import type { TimeFrame } from "@/types/common"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
  Legend,
} from "recharts"

// Mock data
const generateMockData = (timeFrame: TimeFrame) => {
  const data = []

  let categories: string[]

  switch (timeFrame) {
    case "1d":
      categories = ["Morning", "Afternoon", "Evening", "Night"]
      break
    case "7d":
      categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      break
    case "30d":
      categories = ["Week 1", "Week 2", "Week 3", "Week 4"]
      break
    case "all":
      categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      break
    default:
      categories = ["Week 1", "Week 2", "Week 3", "Week 4"]
  }

  for (const category of categories) {
    const wins = Math.random() * 20 + 5
    const losses = Math.random() * 15 + 2

    data.push({
      name: category,
      wins,
      losses,
      net: wins - losses,
    })
  }

  return data
}

interface PortfolioPerformanceProps {
  className?: string
}

export default function PortfolioPerformance({ className }: PortfolioPerformanceProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("7d")
  const data = generateMockData(timeFrame)

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Wins and losses over time</CardDescription>
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
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis tickFormatter={(value) => `${value} SOL`} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="wins" name="Wins" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="losses" name="Losses" fill="var(--accent-coral)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name="Net Profit" fill="var(--primary-yellow)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          Wins: <span className="font-mono text-accent-green">{formatSOL(payload[0].value as number)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Losses: <span className="font-mono text-accent-coral">{formatSOL(payload[1].value as number)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Net Profit: <span className="font-mono text-primary-yellow">{formatSOL(payload[2].value as number)}</span>
        </p>
      </div>
    )
  }

  return null
}
