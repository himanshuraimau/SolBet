"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, Check, Twitter, Copy } from "lucide-react"
import type { Bet } from "@/mock/adapters" // Updated import from types to mock adapters
import { formatSOL } from "@/lib/utils"

interface ShareCardProps {
  bet: Bet
  className?: string
}

export default function ShareCard({ bet, className }: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://solbet.app/bet/${bet.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTwitterShare = () => {
    const text = `I'm betting on "${bet.title}" with a pool of ${formatSOL(bet.yesPool + bet.noPool)} on @SolBetApp! Join me and place your prediction!`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank")
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share this Bet
        </CardTitle>
        <CardDescription>Invite others to join this bet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-3 rounded-md text-sm font-mono break-all">{shareUrl}</div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>
        <Button onClick={handleTwitterShare} className="flex-1 bg-[#1DA1F2] hover:bg-[#1a94e0] text-white">
          <Twitter className="mr-2 h-4 w-4" />
          Tweet
        </Button>
      </CardFooter>
    </Card>
  )
}
