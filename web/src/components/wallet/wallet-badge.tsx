"use client"

import { useState } from "react"
import { useWallet } from "@/providers/wallet-provider"
import { Button } from "@/components/ui/button"
import { Wallet, Copy, Check, LogOut, RefreshCw } from "lucide-react"
import { shortenAddress } from "@/lib/utils"
import { formatSOL } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function WalletBadge() {
  const { wallet, disconnect, refreshBalance } = useWallet()
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  if (!wallet) {
    return (
      <Button asChild variant="default" className="bg-primary-gradient text-text-plum hover-scale">
        <Link href="/wallet-connect" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Link>
      </Button>
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 hover-scale">
          <div className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
          <span className="font-mono">{shortenAddress(wallet.address)}</span>
          <span className="hidden md:inline-block font-mono">{formatSOL(wallet.balance)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Connected with {wallet.provider}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm">{shortenAddress(wallet.address)}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress} aria-label="Copy address">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between" onClick={handleRefreshBalance}>
          <span>Balance</span>
          <span className="flex items-center gap-1 font-mono">
            {formatSOL(wallet.balance)}
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-accent-coral focus:text-accent-coral" onClick={disconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
