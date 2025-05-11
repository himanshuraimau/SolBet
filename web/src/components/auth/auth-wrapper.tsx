"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { Loader2 } from "lucide-react"

interface AuthWrapperProps {
  children: ReactNode;
  redirectPath?: string;
}

export default function AuthWrapper({ children, redirectPath = "/" }: AuthWrapperProps) {
  const { publicKey, connected } = useWallet();
  const { user, isLoading, error } = useAuth();
  const router = useRouter();
  // Add state to track client-side rendering
  const [mounted, setMounted] = useState(false);

  // Set mounted state on client-side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Early return during server-side rendering to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="mb-4">Connect your wallet to access this page</p>
            <div className="flex flex-col gap-4 items-center">
              <Button className="bg-primary-gradient text-text-plum">
                Connect Wallet
              </Button>
              <Button 
                variant="outline"
                onClick={() => {}}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!connected || !publicKey) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
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

  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading your profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-accent-coral mb-4">Error connecting to your profile</p>
            <div className="flex flex-col gap-4 items-center">
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
