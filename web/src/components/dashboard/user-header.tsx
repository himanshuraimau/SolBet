"use client";

import { useEffect } from "react";
import { useWalletData } from "@/store/wallet-store";
import { formatSOL } from "@/lib/utils";
import { formatWalletAddress } from "@/lib/wallet";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import WalletBadge from "@/components/wallet/wallet-badge";

export default function UserHeader() {
  const { publicKey, connected, balance, refreshBalance, updateUserProfile, userProfile, isLoading } = useWalletData();

  // Refresh wallet data when component mounts or when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
      updateUserProfile();
    }
  }, [connected, publicKey, refreshBalance, updateUserProfile]);

  if (!connected || !publicKey) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">Welcome to SolBet</h2>
                <p className="text-muted-foreground">Connect your wallet to get started</p>
              </div>
            </div>
            <WalletBadge />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary-gradient text-text-plum">
                {userProfile?.displayName ? userProfile.displayName[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {userProfile?.displayName || "Solana User"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {formatWalletAddress(publicKey)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Wallet Balance</div>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <div className="text-xl font-semibold font-mono">
                  {formatSOL(balance)}
                </div>
              )}
            </div>
            <WalletBadge />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
