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
  const { user, isLoading, error, refreshUser } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Track if we've already triggered the refresh
  const [hasRefreshed, setHasRefreshed] = useState(false);

  // Set mounted state on client-side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh user data only once when component mounts and wallet is connected
  useEffect(() => {
    if (mounted && connected && publicKey && !hasRefreshed) {
      refreshUser();
      setHasRefreshed(true);
    }
    
    // Reset hasRefreshed flag when wallet disconnects
    if (!connected || !publicKey) {
      setHasRefreshed(false);
    }
  }, [mounted, connected, publicKey, refreshUser, hasRefreshed]);

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
            <p className="text-accent-coral mb-4">Error: {error}</p>
            <div className="flex flex-col gap-4 items-center">
              <Button 
                onClick={refreshUser}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Try Again
              </Button>
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

  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4">No user profile found. Please try reconnecting your wallet.</p>
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
