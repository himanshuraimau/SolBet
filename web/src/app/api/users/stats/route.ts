import { type NextRequest, NextResponse } from "next/server"
import { fetchUserStats } from "@/lib/mockData"

// GET /api/users/stats - Get user stats
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")
    const timeFrame = searchParams.get("timeFrame") || "all"

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const stats = await fetchUserStats(address, timeFrame)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
  }
}
