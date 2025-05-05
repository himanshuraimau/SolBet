import { type NextRequest, NextResponse } from "next/server"
import { fetchBetById } from "@/lib/mockData"

// GET /api/bets/[id] - Get a specific bet
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const bet = await fetchBetById(id)

    if (!bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 })
    }

    return NextResponse.json(bet)
  } catch (error) {
    console.error("Error fetching bet:", error)
    return NextResponse.json({ error: "Failed to fetch bet" }, { status: 500 })
  }
}
