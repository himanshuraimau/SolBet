"use client"

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import type { Bet, BetCategory } from "@/types/bet"
import { useBets } from "@/lib/query/hooks";
import { Skeleton } from "@/components/ui/skeleton"

// Only keep the categories definition
const CATEGORIES: BetCategory[] = ["crypto", "sports", "politics", "entertainment", "other"]

// Utility function to calculate time remaining
const getTimeRemaining = (endTime: Date) => {
  const diff = endTime.getTime() - new Date().getTime();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return days === 1 ? "1 day left" : `${days} days left`;
}

// Utility function for formatting participants count
const formatParticipantsCount = (count: number) => {
  return count === 1 ? "1 participant" : `${count} participants`;
}

export default function FeaturedBets() {
  const [activeCategory, setActiveCategory] = useState<BetCategory | "all">("all")
  
  // Use the useBets hook to fetch real data
  const { data, isLoading, error } = useBets(
    activeCategory === "all" ? undefined : activeCategory,
    "active" // Only show active bets
  )

  // Handle the filtered bets based on category
  const filteredBets = data?.bets || [];
  
  // Take only up to 8 bets for the featured section
  const displayBets = filteredBets.slice(0, 8);

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
            {isLoading ? (
              // Loading state
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-6 w-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : error ? (
              // Error state
              <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load bets. Please try again later.</p>
              </div>
            ) : displayBets.length === 0 ? (
              // Empty state
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bets available in this category.</p>
              </div>
            ) : (
              // Display bets
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayBets.map((bet: { id: Key | null | undefined; category: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; endTime: string | number | Date; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; yesPool: number; noPool: number; participants: string | any[] }) => (
                  <Card key={bet.id} className="overflow-hidden hover-scale transition-premium">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="capitalize bg-muted/50">
                          {bet.category}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {getTimeRemaining(new Date(bet.endTime))}
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2 mt-2 text-lg">{bet.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Yes: {((bet.yesPool / (bet.yesPool + bet.noPool || 1)) * 100).toFixed(1)}%</span>
                            <span>No: {((bet.noPool / (bet.yesPool + bet.noPool || 1)) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="bg-primary-gradient h-2.5 rounded-full"
                              style={{ width: `${(bet.yesPool / (bet.yesPool + bet.noPool || 1)) * 100}%` }}
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
                            <span>{formatParticipantsCount(bet.participants ? bet.participants.length : 0)}</span>
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
            )}
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
