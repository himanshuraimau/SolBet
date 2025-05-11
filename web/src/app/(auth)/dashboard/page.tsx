"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletData } from "@/store/wallet-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import UserHeader from "@/components/dashboard/user-header"
import ActivityFeed from "@/components/dashboard/activity-feed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { BetHistoryChart } from "@/components/charts/bet-history-chart" 
import FadeIn from "@/components/motion/fade-in"
import { useUserBets } from "@/lib/query/hooks/use-user-bets"
import { BetCard } from "@/components/dashboard/bet-card"
import { TransactionHistory } from "@/components/dashboard/transaction-history"

export default function DashboardPage() {
  const { publicKey, connected } = useWallet()
  const [activeTab, setActiveTab] = useState("active")
  const { data: userBets, isLoading: isLoadingBets } = useUserBets()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild className="bg-primary-gradient text-text-plum hover-scale">
          <Link href="/create-bet" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Bet
          </Link>
        </Button>
      </div>

      <FadeIn>
        <UserHeader />
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <FadeIn delay={0.1}>
            <BetHistoryChart />
          </FadeIn>
        </div>
        <div>
          <FadeIn delay={0.2} direction="left">
            <ActivityFeed />
          </FadeIn>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <FadeIn delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle>My Bets</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-muted/50 mb-4">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="created">Created</TabsTrigger>
                    <TabsTrigger value="participated">Participated</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  </TabsList>

                  {isLoadingBets ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <TabsContent value="active">
                        {userBets?.active && userBets.active.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {userBets.active.map(bet => (
                              <BetCard key={bet.id} bet={bet} type="active" />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>You don&apos;t have any active bets</p>
                            <Button asChild variant="outline" className="mt-4">
                              <Link href="/browse">Browse Bets</Link>
                            </Button>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="created">
                        {userBets?.created && userBets.created.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {userBets.created.map(bet => (
                              <BetCard key={bet.id} bet={bet} type="created" />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>You haven&apos;t created any bets yet</p>
                            <Button asChild variant="outline" className="mt-4">
                              <Link href="/create-bet">Create a Bet</Link>
                            </Button>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="participated">
                        {userBets?.participated && userBets.participated.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {userBets.participated.map(bet => (
                              <BetCard key={bet.id} bet={bet} type="participated" />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>You haven&apos;t participated in any bets yet</p>
                            <Button asChild variant="outline" className="mt-4">
                              <Link href="/browse">Browse Bets</Link>
                            </Button>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="resolved">
                        {userBets?.resolved && userBets.resolved.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {userBets.resolved.map(bet => (
                              <BetCard key={bet.id} bet={bet} type="resolved" />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>You don&apos;t have any resolved bets</p>
                            <Button asChild variant="outline" className="mt-4">
                              <Link href="/browse">Browse Bets</Link>
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
        <div>
          <FadeIn delay={0.4} direction="left">
            <TransactionHistory />
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
