import { useUserTransactions } from "@/lib/query/hooks/use-user-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatSOL } from "@/lib/utils";
import Link from "next/link";

export function TransactionHistory() {
  const { data, isLoading, error } = useUserTransactions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Failed to load transaction history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const transactions = data?.transactions || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card/50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        tx.status === "confirmed"
                          ? "success"
                          : tx.status === "failed"
                          ? "destructive"
                          : "warning"
                      }
                      className="capitalize"
                    >
                      {tx.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {tx.type}
                    </Badge>
                  </div>
                  
                  {tx.betTitle && tx.betId && (
                    <Link 
                      href={`/bet/${tx.betId}`} 
                      className="text-sm font-medium hover:underline block"
                    >
                      {tx.betTitle}
                    </Link>
                  )}
                  
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="font-mono text-sm font-semibold">
                  {tx.type === "deposit" || tx.type === "winnings" || tx.type === "payout" ? "+" : "-"}
                  {formatSOL(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
