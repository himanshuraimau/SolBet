"use client";

import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatSOL } from "@/lib/utils";
import { formatWalletAddress } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import WalletBadge from "./wallet-badge";
import TransactionList from "./transaction-list";
import { useWalletData } from "@/store/wallet-store";

export default function WalletOption() {
  const { publicKey, connected } = useWallet();
  const { balance, refreshBalance, transactions, isLoading } = useWalletData();
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true when component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh wallet data when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
    }
  }, [connected, publicKey, refreshBalance]);

  // Don't render on server side
  if (!mounted) {
    return null;
  }

  if (!connected || !publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Connect your Solana wallet to see your balance and transaction history
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <WalletBadge />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>
          {formatWalletAddress(publicKey)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-3">
          <div className="text-sm text-muted-foreground">Balance</div>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-semibold font-mono">{formatSOL(balance)}</div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Recent Transactions</div>
            <Button variant="link" className="h-auto p-0 text-xs" asChild>
              <a href="/transactions">
                View All <ArrowRightIcon className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <TransactionList transactions={transactions.slice(0, 3)} />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            onClick={refreshBalance}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh
          </Button>
          <WalletBadge />
        </div>
      </CardFooter>
    </Card>
  );
}
