import { type NextRequest, NextResponse } from "next/server"
import { fetchBets, createBet } from "@/lib/mockData"
import type { BetCategory, BetStatus } from "@/types/bet"

// GET /api/bets - List all bets with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") as BetCategory | undefined
    const status = searchParams.get("status") as BetStatus | undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const result = await fetchBets(category, status, page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching bets:", error)
    return NextResponse.json({ error: "Failed to fetch bets" }, { status: 500 })
  }
}

// POST /api/bets - Create a new bet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.description || !body.category || !body.creator) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newBet = await createBet({
      title: body.title,
      description: body.description,
      category: body.category,
      minimumBet: body.minimumBet || 0.1,
      maximumBet: body.maximumBet || 100,
      endTime: new Date(body.endTime || Date.now() + 7 * 24 * 60 * 60 * 1000),
      creator: body.creator,
    })

    return NextResponse.json(newBet, { status: 201 })
  } catch (error) {
    console.error("Error creating bet:", error)
    return NextResponse.json({ error: "Failed to create bet" }, { status: 500 })
  }
}
