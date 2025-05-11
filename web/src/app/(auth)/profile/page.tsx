"use client"

import { useEffect, useState } from "react"
import { formatSOL } from "@/lib/utils"
import { formatWalletAddress, getWalletInitial } from "@/lib/wallet"
import { useWalletData } from "@/store/wallet-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit, LogOut } from "lucide-react"
import Link from "next/link"
// Import the WalletBadge component instead of WalletMultiButton
import WalletBadge from "@/components/wallet/wallet-badge"

export default function ProfilePage() {
  const { publicKey, connected, balance, refreshBalance, disconnect } = useWalletData();
  const [copied, setCopied] = useState(false)

  // Load wallet data when component mounts or wallet changes
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
    }
  }, [connected, publicKey, refreshBalance]);

  // Mock profile data for demonstration
  const profile = {
    displayName: "Crypto Wizard",
    joinedDate: "January 2023",
    totalBets: 34,
    activeBets: 5,
    winRate: "62%",
  };

  if (!connected || !publicKey) {
    // Show connect wallet UI using our custom WalletBadge component
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Connect your wallet to view your profile</h2>
            <div className="flex justify-center">
              <WalletBadge />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile sidebar */}
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="h-24 w-24 mb-4 mx-auto">
              <AvatarFallback className="bg-primary-gradient text-text-plum text-2xl">
                {getWalletInitial(publicKey)}
              </AvatarFallback>
            </Avatar>
            <div className="text-xl font-medium">{profile.displayName}</div>
            <div className="text-sm text-muted-foreground mb-6">
              {formatWalletAddress(publicKey)}
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Joined</div>
                <div className="text-lg font-medium mt-1">{profile.joinedDate}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Balance</div>
                <div className="text-lg font-mono font-medium mt-1">{formatSOL(balance)}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Win Rate</div>
                <div className="text-lg font-medium mt-1">{profile.winRate}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Total Bets</div>
                <div className="text-lg font-medium mt-1">{profile.totalBets}</div>
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
        
        {/* Main content area */}
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
  );
}
