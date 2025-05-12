import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { Bet } from "@/types/bet"

interface BetCardProps {
  bet: Bet
}

export function BetCard({ bet }: BetCardProps) {
  const totalPool = bet.totalPool || bet.yesPool + bet.noPool
  const yesPercentage = totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50
  const noPercentage = totalPool > 0 ? (bet.noPool / totalPool) * 100 : 50

  return (
    <Card className="overflow-hidden hover-scale transition-premium">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="capitalize bg-muted/50">
            {bet.category}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {bet.daysLeft > 0 ? `${bet.daysLeft} days left` : "Ended"}
          </div>
        </div>
        <CardTitle className="line-clamp-2 mt-2 text-lg">{bet.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Yes: {yesPercentage.toFixed(1)}%</span>
              <span>No: {noPercentage.toFixed(1)}%</span>
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
              <span className="font-mono">{totalPool.toFixed(2)} SOL</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4 text-accent-blue" />
              <span>{bet.participantCount} participants</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          asChild 
          className="w-full bg-primary-gradient text-text-plum"
          disabled={bet.status !== "active" || new Date(bet.endTime) < new Date()}
        >
          <Link href={`/bet/${bet.id}`}>
            {bet.status === "active" && new Date(bet.endTime) >= new Date() 
              ? "Place Bet" 
              : "View Bet"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
