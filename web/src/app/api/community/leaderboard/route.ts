import { type NextRequest, NextResponse } from "next/server"
import { fetchLeaderboard } from "@/lib/mockData"

// GET /api/community/leaderboard - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "weekly"

    const leaderboard = await fetchLeaderboard(period)

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
