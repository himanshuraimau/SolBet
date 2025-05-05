"use client"

import { useWallet } from "@/providers/wallet-provider"
import { formatSOL, shortenAddress } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check, RefreshCw, ExternalLink } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function UserHeader() {
  const { wallet, refreshBalance } = useWallet()
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  if (!wallet) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="mb-4">Connect your wallet to view your dashboard</p>
            <Button asChild className="bg-primary-gradient text-text-plum">
              <Link href="/wallet-connect">Connect Wallet</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRefreshBalance = async () => {
    setRefreshing(true)
    await refreshBalance()
    setTimeout(() => setRefreshing(false), 1000)
  }

  // Mock user stats
  const stats = {
    betsCreated: 12,
    betsJoined: 28,
    winRate: 64,
    totalWinnings: 342.5,
  }

  return (
    <Card className="bg-linear-to-r from-accent-navy to-secondary-purple text-text-pearl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary-gradient flex items-center justify-center text-text-plum font-bold">
                {wallet.address.substring(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{shortenAddress(wallet.address)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-text-pearl/80 hover:text-text-pearl hover:bg-white/10"
                    onClick={copyAddress}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-text-pearl/80 hover:text-text-pearl hover:bg-white/10"
                    asChild
                  >
                    <a
                      href={`https://explorer.solana.com/address/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
                <div className="text-sm text-text-pearl/80">Connected with {wallet.provider}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-2xl font-mono font-bold">{formatSOL(wallet.balance)}</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-text-pearl/80 hover:text-text-pearl hover:bg-white/10"
                onClick={handleRefreshBalance}
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Bets Created" value={stats.betsCreated} />
            <StatCard label="Bets Joined" value={stats.betsJoined} />
            <StatCard label="Win Rate" value={`${stats.winRate}%`} />
            <StatCard label="Total Winnings" value={formatSOL(stats.totalWinnings)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/10 rounded-lg p-3 text-center">
      <div className="text-sm text-text-pearl/80">{label}</div>
      <div className="text-lg font-medium mt-1">{value}</div>
    </div>
  )
}
