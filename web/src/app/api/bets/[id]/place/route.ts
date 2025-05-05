import { type NextRequest, NextResponse } from "next/server"
import { placeBet } from "@/lib/mockData"

// PUT /api/bets/[id]/place - Place a bet
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Validate required fields
    if (!body.position || !body.amount || !body.walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedBet = await placeBet(id, body.position, body.amount, body.walletAddress)

    return NextResponse.json(updatedBet)
  } catch (error) {
    console.error("Error placing bet:", error)
    return NextResponse.json({ error: "Failed to place bet" }, { status: 500 })
  }
}
