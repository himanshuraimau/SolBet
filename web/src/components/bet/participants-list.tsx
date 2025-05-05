import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatSOL, shortenAddress } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import type { Participant } from "@/types/bet"

interface ParticipantsListProps {
  participants: Participant[]
}

export default function ParticipantsList({ participants }: ParticipantsListProps) {
  if (!participants.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
          <CardDescription>Be the first to place a bet!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No participants yet</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>{participants.length} bettors have joined</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Address</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Position</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">When</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <tr key={`${participant.walletAddress}-${index}`} className="border-b last:border-0">
                  <td className="py-3 px-2 font-mono text-sm">{shortenAddress(participant.walletAddress)}</td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        participant.position === "yes"
                          ? "bg-accent-green/10 text-accent-green"
                          : "bg-accent-coral/10 text-accent-coral"
                      }`}
                    >
                      {participant.position.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono">{formatSOL(participant.amount)}</td>
                  <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(participant.timestamp, { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
