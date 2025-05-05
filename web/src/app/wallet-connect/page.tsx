"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/providers/wallet-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

const wallets = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "/placeholder.svg?height=48&width=48",
    description: "The most popular Solana wallet",
    recommended: true,
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "/placeholder.svg?height=48&width=48",
    description: "Solana's original wallet",
    recommended: false,
  },
  {
    id: "backpack",
    name: "Backpack",
    icon: "/placeholder.svg?height=48&width=48",
    description: "Multi-chain wallet with xNFT support",
    recommended: false,
  },
]

export default function WalletConnect() {
  const { wallet, connecting, connect } = useWallet()
  const [selectedWallet, setSelectedWallet] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // If wallet is already connected, redirect to dashboard
    if (wallet && !connecting) {
      router.push("/dashboard")
    }
  }, [wallet, connecting, router])

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId)
    setError(null)

    try {
      await connect(walletId)
      setSuccess(true)

      // Redirect after successful connection
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      setError("Failed to connect wallet. Please try again.")
    }
  }

  return (
    <div className="container max-w-md py-12">
      <Card className="w-full jewel-card text-text-pearl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
          <CardDescription className="text-text-pearl/80">Choose a wallet to connect to SolBet</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recommended" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="recommended" className="text-text-pearl data-[state=active]:bg-white/20">
                Recommended
              </TabsTrigger>
              <TabsTrigger value="all" className="text-text-pearl data-[state=active]:bg-white/20">
                All Wallets
              </TabsTrigger>
            </TabsList>
            <TabsContent value="recommended" className="mt-4">
              <div className="space-y-4">
                {wallets
                  .filter((w) => w.recommended)
                  .map((wallet) => (
                    <WalletOption
                      key={wallet.id}
                      wallet={wallet}
                      selected={selectedWallet === wallet.id}
                      connecting={connecting}
                      onConnect={handleConnect}
                    />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="all" className="mt-4">
              <div className="space-y-4">
                {wallets.map((wallet) => (
                  <WalletOption
                    key={wallet.id}
                    wallet={wallet}
                    selected={selectedWallet === wallet.id}
                    connecting={connecting}
                    onConnect={handleConnect}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4 bg-accent-coral/20 border-accent-coral/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 bg-accent-green/20 border-accent-green/30 text-accent-green">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Wallet connected successfully! Redirecting...</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-text-pearl/80 text-center">
            By connecting your wallet, you agree to our{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

interface WalletOptionProps {
  wallet: {
    id: string
    name: string
    icon: string
    description: string
    recommended: boolean
  }
  selected: boolean
  connecting: boolean
  onConnect: (walletId: string) => void
}

function WalletOption({ wallet, selected, connecting, onConnect }: WalletOptionProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border ${
        selected ? "border-primary-yellow bg-white/10" : "border-white/20"
      } hover:border-primary-yellow hover:bg-white/10 transition-colors cursor-pointer`}
      onClick={() => !connecting && onConnect(wallet.id)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white/10">
          <Image src={wallet.icon || "/placeholder.svg"} alt={wallet.name} fill className="object-cover" />
        </div>
        <div>
          <h3 className="font-medium">{wallet.name}</h3>
          <p className="text-sm text-text-pearl/80">{wallet.description}</p>
        </div>
      </div>
      <div>
        {selected && connecting ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-yellow border-t-transparent" />
        ) : selected ? (
          <CheckCircle className="h-5 w-5 text-primary-yellow" />
        ) : (
          <ArrowRight className="h-5 w-5 text-text-pearl/60" />
        )}
      </div>
    </div>
  )
}
