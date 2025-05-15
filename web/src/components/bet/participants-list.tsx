import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatSOL } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/date-utils"

// Define the Participant type expected by this component
export interface Participant {
  walletAddress: string;
  position: "yes" | "no";  // Strict literal type
  amount: number;
  timestamp: Date;
}

interface ParticipantsListProps {
  participants: Participant[];
}

export default function ParticipantsList({ participants }: ParticipantsListProps) {
  // Type guard function to ensure data conforms to expected shape
  const formatParticipant = (participant: any): Participant => {
    return {
      walletAddress: participant.walletAddress,
      position: participant.position.toLowerCase() === "yes" ? "yes" : "no",
      amount: participant.amount,
      timestamp: new Date(participant.timestamp)
    };
  };

  // Ensure participants are correctly typed
  const typedParticipants = participants 
    ? participants.map(p => formatParticipant(p))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
      </CardHeader>
      <CardContent>
        {typedParticipants.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No participants yet. Be the first to place a bet!</p>
        ) : (
          <div className="space-y-4">
            {typedParticipants.map((participant, i) => (
              <div 
                key={i} 
                className="flex justify-between items-center py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {participant.walletAddress.substring(0, (participant.walletAddress.includes('...') ? participant.walletAddress.length : 6))}
                    {!participant.walletAddress.includes('...') && '...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatRelativeTime(new Date(participant.timestamp))}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    participant.position === "yes" 
                      ? "text-accent-green" 
                      : "text-accent-coral"
                  }`}>
                    {participant.position.toUpperCase()}
                  </p>
                  <p className="font-mono text-sm">{formatSOL(participant.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
