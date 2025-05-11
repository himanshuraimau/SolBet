"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useEffect, useState } from "react"
import { formatSOL } from "@/lib/utils"
import { formatWalletAddress, getWalletInitial } from "@/lib/wallet"
import { useWalletData } from "@/store/wallet-store" 
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check, RefreshCw, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"

export default function UserHeader() {
  const { publicKey, connected } = useWallet();
  const { balance, isLoading, refreshBalance } = useWalletData();
  const { user } = useAuth(); // Get user data from auth provider
  const [copied, setCopied] = useState(false);
  // Add state to track client-side rendering
  const [mounted, setMounted] = useState(false);

  // Set mounted state on client-side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load balance when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
    }
  }, [connected, publicKey, refreshBalance]);

  // Early return during server-side rendering to prevent hydration mismatch
  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="mb-4">Connecting to wallet...</p>
            <div className="inline-block">
              <Button className="bg-primary-gradient text-text-plum">
                Connect Wallet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!connected || !publicKey) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="mb-4">Connect your wallet to view your dashboard</p>
            <WalletMultiButton className="wallet-adapter-button-custom bg-primary-gradient text-text-plum" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const walletAddress = publicKey.toString()

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Use real user stats from the database if available, otherwise fallback to defaults
  const stats = user?.stats || {
    betsCreated: 0,
    betsJoined: 0,
    winRate: 0,
    totalWinnings: 0,
  }

  return (
    <Card className="bg-linear-to-r from-accent-navy to-secondary-purple text-text-pearl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary-gradient flex items-center justify-center text-text-plum font-bold">
                {getWalletInitial(publicKey)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{formatWalletAddress(publicKey)}</span>
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
                      href={`https://explorer.solana.com/address/${walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
                <div className="text-sm text-text-pearl/80">
                  {user?.displayName ? user.displayName : "Connected Wallet"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-2xl font-mono font-bold">{formatSOL(balance || 0)}</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-text-pearl/80 hover:text-text-pearl hover:bg-white/10"
                onClick={refreshBalance}
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
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
