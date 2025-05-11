"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AuthWrapperProps {
  children: ReactNode;
  redirectPath?: string;
}

export default function AuthWrapper({ children, redirectPath = "/" }: AuthWrapperProps) {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  if (!connected || !publicKey) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4">Connect your wallet to access this page</p>
            <div className="flex flex-col gap-4 items-center">
              <WalletMultiButton className="wallet-adapter-button-custom" />
              <Button 
                variant="outline"
                onClick={() => router.push(redirectPath)}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
