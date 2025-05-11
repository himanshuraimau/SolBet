import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { formatSOL } from "@/lib/utils";
import { UserBet } from "@/lib/query/hooks/use-user-bets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface BetCardProps {
  bet: UserBet;
  type: "active" | "created" | "participated" | "resolved";
}

export function BetCard({ bet, type }: BetCardProps) {
  const isResolved = type === "resolved";
  const expiryDate = new Date(bet.expiresAt);
  const isExpired = expiryDate < new Date();
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-base line-clamp-1">{bet.title}</h3>
          {getStatusBadge(bet, type)}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{bet.description}</p>
        
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-muted-foreground">Amount:</span>{" "}
            <span className="font-mono font-medium">{formatSOL(bet.amount)}</span>
          </div>
          
          {isResolved && bet.payout && bet.payout > 0 && (
            <div>
              <span className="text-muted-foreground">Payout:</span>{" "}
              <span className="font-mono font-medium text-accent-green">{formatSOL(bet.payout)}</span>
            </div>
          )}
          
          {bet.position && (
            <div>
              <span className="text-muted-foreground">Position:</span>{" "}
              <Badge variant={bet.position === "YES" ? "success" : "destructive"} className="ml-1">
                {bet.position}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-muted-foreground">
            {isExpired 
              ? `Expired ${formatDistanceToNow(expiryDate, { addSuffix: true })}` 
              : `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}`}
          </div>
          
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href={`/bets/${bet.id}`}>
              View <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusBadge(bet: UserBet, type: string) {
  if (type === "resolved") {
    if (bet.outcome) {
      const userWon = 
        (bet.position === "YES" && bet.outcome === "YES") || 
        (bet.position === "NO" && bet.outcome === "NO");
      
      return (
        <Badge variant={userWon ? "success" : "destructive"}>
          {userWon ? "Won" : "Lost"}
        </Badge>
      );
    }
    return <Badge variant="outline">Resolved</Badge>;
  }
  
  if (type === "created") {
    return <Badge variant="secondary">Created by you</Badge>;
  }
  
  if (type === "participated") {
    return <Badge variant="secondary">Participated</Badge>;
  }
  
  return <Badge variant="outline">Active</Badge>;
}
