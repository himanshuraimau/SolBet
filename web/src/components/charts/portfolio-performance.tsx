"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatSOL } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type TooltipProps,
} from "recharts"
import { usePortfolioPerformance } from "@/lib/query/hooks/use-user-data"
import type { TimeFrame } from "@/types/common"

interface PortfolioPerformanceProps {
  timeFrame: TimeFrame
  className?: string
}

export default function PortfolioPerformance({ timeFrame, className }: PortfolioPerformanceProps) {
  // Fetch real data from API
  const { data, isLoading } = usePortfolioPerformance(timeFrame)
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Track your betting ROI over time</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading performance data...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">No performance data available</div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="colorWins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLosses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-coral)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--accent-coral)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-purple)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--primary-purple)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--muted-foreground)" 
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (timeFrame === "all" || timeFrame === "30d") {
                      // For longer timeframes, format date more concisely
                      return value.split('-').slice(1).join('/');
                    }
                    // For 1d and 7d, keep date as is
                    return value;
                  }}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(value) => `${value} SOL`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="wins"
                  name="Wins"
                  stroke="var(--accent-green)"
                  fillOpacity={1}
                  fill="url(#colorWins)"
                />
                <Area
                  type="monotone"
                  dataKey="losses"
                  name="Losses"
                  stroke="var(--accent-coral)"
                  fillOpacity={1}
                  fill="url(#colorLosses)"
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  name="Net Profit"
                  stroke="var(--primary-purple)"
                  fillOpacity={1}
                  fill="url(#colorNet)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-accent-green">
          Wins: <span className="font-mono">{formatSOL(payload[0].value as number)}</span>
        </p>
        <p className="text-sm text-accent-coral">
          Losses: <span className="font-mono">{formatSOL(payload[1].value as number)}</span>
        </p>
        <p className="text-sm text-primary-purple">
          Net Profit: <span className="font-mono">{formatSOL(payload[2].value as number)}</span>
        </p>
      </div>
    )
  }

  return null
}
