"use client"

import { useEffect, useState } from "react"
import { formatSOL } from "@/lib/utils"
import { formatWalletAddress, getWalletInitial } from "@/lib/wallet"
import { useWalletData } from "@/store/wallet-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import WalletBadge from "@/components/wallet/wallet-badge"
import { useBettingHistory } from "@/lib/query/hooks/use-user-data"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useWallet } from "@solana/wallet-adapter-react"

export default function ProfilePage() {
  const { publicKey, connected, disconnect } = useWallet();
  const { 
    balance, 
    refreshBalance, 
    userProfile, 
    isProfileLoading, 
    updateUserProfile 
  } = useWalletData();
  const [copied, setCopied] = useState(false);
  const [timeFrame, setTimeFrame] = useState("all");
  const { data: bettingHistory, isLoading: isHistoryLoading } = useBettingHistory(timeFrame as any);

  // Load wallet data when component mounts or wallet changes
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
      updateUserProfile();
    }
  }, [connected, publicKey, refreshBalance, updateUserProfile]);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!connected || !publicKey) {
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

  // Show loading state while profile is loading
  if (isProfileLoading) {
    return (
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4 mx-auto" />
              <Skeleton className="h-6 w-32 mb-2 mx-auto" />
              <Skeleton className="h-4 w-48 mb-6 mx-auto" />
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3 text-center">
                    <Skeleton className="h-4 w-16 mb-1 mx-auto" />
                    <Skeleton className="h-6 w-10 mx-auto" />
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mb-4" />
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Determine join date based on createdAt if available, otherwise use current
  const joinedDate = userProfile?.createdAt 
    ? formatDistanceToNow(new Date(userProfile.createdAt), { addSuffix: true })
    : "Recently";

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
            <div className="text-xl font-medium">
              {userProfile?.displayName || "Solana User"}
            </div>
            <div className="text-sm text-muted-foreground mb-6">
              <button 
                onClick={copyAddress} 
                className="hover:underline focus:outline-none"
                aria-label="Copy wallet address"
              >
                {copied ? "Copied!" : formatWalletAddress(publicKey)}
              </button>
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Joined</div>
                <div className="text-lg font-medium mt-1">{joinedDate}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Balance</div>
                <div className="text-lg font-mono font-medium mt-1">{formatSOL(balance)}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Win Rate</div>
                <div className="text-lg font-medium mt-1">
                  {userProfile?.stats?.winRate ? `${userProfile.stats.winRate.toFixed(0)}%` : "0%"}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Total Bets</div>
                <div className="text-lg font-medium mt-1">
                  {(userProfile?.stats?.betsCreated || 0) + (userProfile?.stats?.betsJoined || 0)}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/settings">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-accent-coral" 
                onClick={() => {
                  if (disconnect) disconnect();
                }}>
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
              <Tabs defaultValue="all" value={timeFrame} onValueChange={setTimeFrame}>
                <TabsList className="bg-muted/50 mb-4">
                  <TabsTrigger value="all">All Bets</TabsTrigger>
                  <TabsTrigger value="created">Created</TabsTrigger>
                  <TabsTrigger value="won">Won</TabsTrigger>
                  <TabsTrigger value="lost">Lost</TabsTrigger>
                </TabsList>
                
                {isHistoryLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <TabsContent value="all" className="mt-0">
                      {!bettingHistory || bettingHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>You don't have any betting history yet</p>
                          <Button asChild variant="outline" className="mt-4">
                            <Link href="/browse">Browse Bets</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bettingHistory.map((bet: any, index: number) => (
                            <div key={`all-${bet.id || index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <div>
                                <div className="font-medium">{bet.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(bet.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-medium ${bet.type === 'WIN' ? 'text-green-500' : ''}`}>
                                  {bet.type === 'WIN' ? '+' : ''}{bet.amount} SOL
                                </div>
                                <div className="text-sm text-muted-foreground">{bet.type}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="created" className="mt-0">
                      {!bettingHistory || !bettingHistory.filter((bet: any) => bet.type === 'created_bet').length ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>You haven't created any bets yet</p>
                          <Button asChild variant="outline" className="mt-4">
                            <Link href="/create-bet">Create a Bet</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bettingHistory
                            .filter((bet: any) => bet.type === 'created_bet')
                            .map((bet: any, index: number) => (
                              <div key={`created-${bet.id || index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <div>
                                  <div className="font-medium">{bet.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(bet.timestamp).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{bet.amount} SOL</div>
                                  <div className="text-sm text-muted-foreground">Created</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="won" className="mt-0">
                      {!bettingHistory || !bettingHistory.filter((bet: any) => bet.type === 'WIN').length ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>You haven't won any bets yet</p>
                          <Button asChild variant="outline" className="mt-4">
                            <Link href="/browse">Place a Bet</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bettingHistory
                            .filter((bet: any) => bet.type === 'WIN')
                            .map((bet: any, index: number) => (
                              <div key={`win-${bet.id || index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <div>
                                  <div className="font-medium">{bet.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(bet.timestamp).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-green-500">+{bet.amount} SOL</div>
                                  <div className="text-sm text-muted-foreground">Won</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="lost" className="mt-0">
                      {!bettingHistory || !bettingHistory.filter((bet: any) => bet.type === 'LOSS').length ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>You haven't lost any bets yet</p>
                          <Button asChild variant="outline" className="mt-4">
                            <Link href="/browse">Place a Bet</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bettingHistory
                            .filter((bet: any) => bet.type === 'LOSS')
                            .map((bet: any, index: number) => (
                              <div key={`loss-${bet.id || index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <div>
                                  <div className="font-medium">{bet.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(bet.timestamp).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-red-500">-{bet.amount} SOL</div>
                                  <div className="text-sm text-muted-foreground">Lost</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
