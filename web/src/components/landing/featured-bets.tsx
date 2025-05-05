"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import type { Bet, BetCategory } from "@/types/bet"

// Mock data for featured bets
const FEATURED_BETS: Bet[] = [
  {
    id: "bet-1",
    title: "Will BTC reach $100k before July 2024?",
    description: "Bitcoin price to hit $100,000 USD on any major exchange before July 1st, 2024.",
    creator: "0x1a2b3c...",
    category: "crypto",
    yesPool: 1250,
    noPool: 850,
    minimumBet: 0.1,
    maximumBet: 100,
    startTime: new Date("2024-01-01"),
    endTime: new Date("2024-07-01"),
    status: "active",
    participants: [],
  },
  {
    id: "bet-2",
    title: "Will the Lakers win the NBA Championship?",
    description: "Los Angeles Lakers to win the 2024 NBA Championship.",
    creator: "0x4d5e6f...",
    category: "sports",
    yesPool: 2300,
    noPool: 3100,
    minimumBet: 0.5,
    maximumBet: 200,
    startTime: new Date("2023-10-15"),
    endTime: new Date("2024-06-30"),
    status: "active",
    participants: [],
  },
  {
    id: "bet-3",
    title: "Will Solana reach 500 TPS sustained?",
    description: "Solana network to maintain 500+ transactions per second for 7 consecutive days.",
    creator: "0x7g8h9i...",
    category: "crypto",
    yesPool: 4500,
    noPool: 1200,
    minimumBet: 0.2,
    maximumBet: 150,
    startTime: new Date("2024-02-01"),
    endTime: new Date("2024-05-01"),
    status: "active",
    participants: [],
  },
  {
    id: "bet-4",
    title: "Will it rain in Miami on July 4th?",
    description: "Precipitation of at least 0.1 inches recorded at Miami International Airport on July 4th, 2024.",
    creator: "0xj0k1l...",
    category: "weather",
    yesPool: 750,
    noPool: 950,
    minimumBet: 0.1,
    maximumBet: 50,
    startTime: new Date("2024-06-01"),
    endTime: new Date("2024-07-04"),
    status: "active",
    participants: [],
  },
]

const CATEGORIES: BetCategory[] = ["crypto", "sports", "politics", "entertainment", "weather", "other"]

export default function FeaturedBets() {
  const [activeCategory, setActiveCategory] = useState<BetCategory | "all">("all")

  const filteredBets =
    activeCategory === "all" ? FEATURED_BETS : FEATURED_BETS.filter((bet) => bet.category === activeCategory)

  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl uppercase">
            Featured <span className="text-gradient-primary">Bets</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join the most popular bets on the platform or create your own.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-muted/50">
              <TabsTrigger
                value="all"
                onClick={() => setActiveCategory("all")}
                className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
              >
                All
              </TabsTrigger>
              {CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => setActiveCategory(category)}
                  className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum capitalize"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeCategory} className="mt-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredBets.map((bet) => (
                <Card key={bet.id} className="overflow-hidden hover-scale transition-premium">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="capitalize bg-muted/50">
                        {bet.category}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {Math.ceil((bet.endTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 mt-2 text-lg">{bet.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Yes: {((bet.yesPool / (bet.yesPool + bet.noPool)) * 100).toFixed(1)}%</span>
                          <span>No: {((bet.noPool / (bet.yesPool + bet.noPool)) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary-gradient h-2.5 rounded-full"
                            style={{ width: `${(bet.yesPool / (bet.yesPool + bet.noPool)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <TrendingUp className="mr-1 h-4 w-4 text-accent-green" />
                          <span className="font-mono">{bet.yesPool + bet.noPool} SOL</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4 text-accent-blue" />
                          <span>{Math.floor(Math.random() * 100) + 20} participants</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-primary-gradient text-text-plum">
                      <Link href={`/bet/${bet.id}`}>Place Bet</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button asChild variant="outline" size="lg" className="hover-scale">
                <Link href="/browse">View All Bets</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
