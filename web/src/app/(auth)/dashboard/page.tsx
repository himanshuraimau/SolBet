"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletData } from "@/store/wallet-store"
import { useAuth } from "@/providers/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import UserHeader from "@/components/dashboard/user-header"
import ActivityFeed from "@/components/dashboard/activity-feed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { BetHistoryChart } from "@/components/charts/bet-history-chart" // Changed from default to named import
import FadeIn from "@/components/motion/fade-in"

export default function DashboardPage() {
  const { publicKey, connected } = useWallet()
  const { balance } = useWalletData()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("active")

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

                  <TabsContent value="active">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>You don't have any active bets</p>
                      <Button asChild variant="outline" className="mt-4">
                        <Link href="/browse">Browse Bets</Link>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="created">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>You haven't created any bets yet</p>
                      <Button asChild variant="outline" className="mt-4">
                        <Link href="/create-bet">Create a Bet</Link>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="participated">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>You haven't participated in any bets yet</p>
                      <Button asChild variant="outline" className="mt-4">
                        <Link href="/browse">Browse Bets</Link>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="resolved">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>You don't have any resolved bets</p>
                      <Button asChild variant="outline" className="mt-4">
                        <Link href="/browse">Browse Bets</Link>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
        <div>
          <FadeIn delay={0.4} direction="left">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {!connected || !publicKey ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent transactions</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/wallet-connect">Connect Wallet</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent transactions for this wallet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
