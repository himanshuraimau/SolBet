"use client";

import { useEffect } from "react";
import { useWalletData } from "@/store/wallet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightIcon } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import TransactionList from "@/components/wallet/transaction-list";
import Link from "next/link";

export function TransactionHistory() {
  const { publicKey, connected } = useWallet();
  const { transactions, refreshBalance, isLoading } = useWalletData();

  // Refresh wallet data when component mounts or when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
    }
  }, [connected, publicKey, refreshBalance]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Transaction History</CardTitle>
        <Button variant="link" className="h-auto p-0 text-xs" asChild>
          <Link href="/wallet">
            View All <ArrowRightIcon className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!connected ? (
          <div className="text-center text-sm text-muted-foreground py-6">
            Connect your wallet to view transaction history
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">
            No transactions yet
          </div>
        ) : (
          <TransactionList transactions={transactions.slice(0, 5)} />
        )}
      </CardContent>
    </Card>
  );
}
