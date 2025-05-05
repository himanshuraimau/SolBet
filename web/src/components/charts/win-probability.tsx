"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, type TooltipProps, Legend } from "recharts"

interface WinProbabilityProps {
  yesPercentage: number
  noPercentage: number
  className?: string
}

export default function WinProbability({ yesPercentage, noPercentage, className }: WinProbabilityProps) {
  const data = [
    {
      name: "No",
      value: noPercentage,
      fill: "var(--accent-coral)",
    },
    {
      name: "Yes",
      value: yesPercentage,
      fill: "var(--accent-green)",
    },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Win Probability</CardTitle>
        <CardDescription>Current odds for Yes and No positions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="80%"
              barSize={20}
              data={data}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar label={{ fill: "var(--foreground)", position: "insideStart" }} background dataKey="value" />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ paddingLeft: "10px" }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-accent-green/10 rounded-lg p-3 text-center">
            <div className="text-sm text-accent-green">Yes Probability</div>
            <div className="text-lg font-medium mt-1">{yesPercentage.toFixed(1)}%</div>
          </div>
          <div className="bg-accent-coral/10 rounded-lg p-3 text-center">
            <div className="text-sm text-accent-coral">No Probability</div>
            <div className="text-lg font-medium mt-1">{noPercentage.toFixed(1)}%</div>
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
          Probability: <span className="font-mono">{data.value.toFixed(1)}%</span>
        </p>
      </div>
    )
  }

  return null
}
