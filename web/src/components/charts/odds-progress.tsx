"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatSOL } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, type TooltipProps, Legend } from "recharts"

interface OddsProgressProps {
  yesPool: number
  noPool: number
  className?: string
}

export default function OddsProgress({ yesPool, noPool, className }: OddsProgressProps) {
  const totalPool = yesPool + noPool
  const yesPercentage = totalPool > 0 ? (yesPool / totalPool) * 100 : 50
  const noPercentage = totalPool > 0 ? (noPool / totalPool) * 100 : 50

  const data = [
    { name: "Yes", value: yesPool, percentage: yesPercentage },
    { name: "No", value: noPool, percentage: noPercentage },
  ]

  const COLORS = ["var(--accent-green)", "var(--accent-coral)"]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Current Odds</CardTitle>
        <CardDescription>Distribution of bets between Yes and No positions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-sm text-muted-foreground">Total Pool</div>
            <div className="text-lg font-mono font-medium mt-1">{formatSOL(totalPool)}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-sm text-muted-foreground">Participants</div>
            <div className="text-lg font-medium mt-1">{Math.floor(Math.random() * 50) + 10}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="text-sm font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Amount: <span className="font-mono">{formatSOL(data.value)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Percentage: <span className="font-mono">{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    )
  }

  return null
}
