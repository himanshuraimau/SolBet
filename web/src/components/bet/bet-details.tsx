import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatSOL } from "@/lib/utils"
import { formatDateTime } from "@/lib/date-utils"
import { Bet } from "@/types/bet"
import { Users, Clock, Calendar } from "lucide-react"

interface BetDetailsProps {
  bet: Bet
  timeLeft?: string | null
}

export default function BetDetails({ bet, timeLeft }: BetDetailsProps) {
  // Format creator address for display
  const creatorAddress = bet.creatorAddress || "Unknown";
  const formattedCreator = creatorAddress ? 
    `${creatorAddress.substring(0, 6)}...${creatorAddress.substring(creatorAddress.length - 4)}` : 
    "Unknown";

  // Get status badge color
  const getStatusColor = () => {
    if (bet.status === "resolved") return "green";
    if (bet.status === "active") return "blue";
    if (new Date(bet.endTime) <= new Date()) return "yellow";
    return "gray";
  }

  // Get status text
  const getStatusText = () => {
    if (bet.status === "resolved") {
      return `Resolved: ${bet.outcome === "yes" ? "YES" : "NO"}`;
    }
    if (bet.status === "active" && new Date(bet.endTime) <= new Date()) {
      return "Expired";
    }
    return bet.status.charAt(0).toUpperCase() + bet.status.slice(1);
  }

  return (
    <div className="w-full">
      <Card className="border border-muted bg-gradient-to-b from-card/40 to-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">{bet.title}</CardTitle>
          <CardDescription>
            Created by {formattedCreator}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground">{bet.description}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                  <div className="font-medium">{bet.participants?.length || 0}</div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Time Left</div>
                  <div className="font-medium">{timeLeft || "N/A"}</div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">End Date</div>
                  <div className="font-medium">{formatDateTime(bet.endTime)}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Total Pool</div>
                <div className="font-mono text-lg font-medium">{formatSOL(bet.yesPool + bet.noPool)}</div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Yes Pool</div>
                <div className="font-mono text-lg font-medium text-accent-green">{formatSOL(bet.yesPool)}</div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">No Pool</div>
                <div className="font-mono text-lg font-medium text-accent-coral">{formatSOL(bet.noPool)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Min Bet</div>
                <div className="font-mono font-medium">{formatSOL(bet.minimumBet)}</div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Max Bet</div>
                <div className="font-mono font-medium">{formatSOL(bet.maximumBet)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
