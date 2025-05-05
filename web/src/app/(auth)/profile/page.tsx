"use client"

import { useWallet } from "@/providers/wallet-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatSOL, shortenAddress } from "@/lib/utils"
import { Copy, Check, ExternalLink, Edit, LogOut } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function ProfilePage() {
  const { wallet, disconnect } = useWallet()
  const [copied, setCopied] = useState(false)

  if (!wallet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="mb-4">Connect your wallet to view your profile</p>
              <Button asChild className="bg-primary-gradient text-text-plum">
                <Link href="/wallet-connect">Connect Wallet</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Mock user profile data
  const profile = {
    displayName: "Solana Enthusiast",
    stats: {
      betsCreated: 12,
      betsJoined: 28,
      winRate: 64,
      totalWinnings: 342.5,
    },
    preferences: {
      theme: "dark" as const,
      notifications: true,
    },
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-primary-gradient text-text-plum text-2xl">
                    {wallet.address.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xl font-medium">{profile.displayName}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm">{shortenAddress(wallet.address)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyAddress}
                    aria-label="Copy address"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                    <a
                      href={`https://explorer.solana.com/address/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Connected with {wallet.provider}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="text-lg font-mono font-medium mt-1">{formatSOL(wallet.balance)}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                  <div className="text-lg font-medium mt-1">{profile.stats.winRate}%</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/settings">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start text-accent-coral" onClick={disconnect}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Betting History</CardTitle>
              <CardDescription>Your betting activity and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="bg-muted/50 mb-4">
                  <TabsTrigger value="all">All Bets</TabsTrigger>
                  <TabsTrigger value="created">Created</TabsTrigger>
                  <TabsTrigger value="won">Won</TabsTrigger>
                  <TabsTrigger value="lost">Lost</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You don't have any betting history yet</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/browse">Browse Bets</Link>
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="created" className="mt-0">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't created any bets yet</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/create-bet">Create a Bet</Link>
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="won" className="mt-0">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't won any bets yet</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/browse">Place a Bet</Link>
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="lost" className="mt-0">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't lost any bets yet</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/browse">Place a Bet</Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
