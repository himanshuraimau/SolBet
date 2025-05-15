import Link from "next/link";
import { formatSOL } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import type { Bet, BetCardProps } from "@/types/bet";

export function BetCard({ bet }: BetCardProps) {
  // Calculate days left
  const now = new Date();
  const endDate = new Date(bet.endTime);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Format dates
  const timeLeftText = daysLeft === 0 
    ? "Ends today" 
    : daysLeft === 1 
      ? "1 day left" 
      : `${daysLeft} days left`;
      
  // Calculate percentages for yes/no
  const totalPool = bet.yesPool + bet.noPool;
  const yesPercentage = totalPool > 0 
    ? Math.round((bet.yesPool / totalPool) * 100) 
    : 50;
  const noPercentage = 100 - yesPercentage;
  
  // Determine status badge
  const getBadgeVariant = () => {
    if (bet.status === 'active') return "secondary";
    if (bet.status === 'closed') return "outline";
    if (bet.status === 'resolved_yes' || bet.status === 'resolved_no') return "destructive";
    return "outline";
  };
  
  const getStatusText = () => {
    if (bet.status === 'active') return "Active";
    if (bet.status === 'closed') return "Closed";
    if (bet.status === 'resolved_yes') return "Resolved: Yes";
    if (bet.status === 'resolved_no') return "Resolved: No";
    return bet.status;
  };

  // Get creator's formatted address (first 6 and last 4 chars)
  const creatorAddress = bet.creatorAddress || "";
  const formattedCreator = creatorAddress ? 
    `${creatorAddress.substring(0, 6)}...${creatorAddress.substring(creatorAddress.length - 4)}` : 
    "Unknown";

  // Format pools for display
  const totalPoolFormatted = formatSOL(bet.totalPool);
  const yesPoolFormatted = formatSOL(bet.yesPool);
  const noPoolFormatted = formatSOL(bet.noPool);
  
  // Calculate percentages for visual display
  const yesPercentageFormatted = bet.totalPool > 0 ? (bet.yesPool / bet.totalPool) * 100 : 50;
  const noPercentageFormatted = bet.totalPool > 0 ? (bet.noPool / bet.totalPool) * 100 : 50;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="capitalize bg-muted/50">
            {bet.category}
          </Badge>
          <Badge variant={getBadgeVariant()}>
            {getStatusText()}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 mt-2 text-lg">
          {bet.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {bet.description}
        </p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Yes: {yesPercentage}%</span>
              <span>No: {noPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary-gradient h-2.5 rounded-full"
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-accent-green" />
              <span className="font-mono">{formatSOL(totalPool)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>{timeLeftText}</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4 text-accent-blue" />
              <span>{bet.participants.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-primary-gradient text-text-plum">
          <Link href={`/bets/${bet.id}`}>View Bet</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
