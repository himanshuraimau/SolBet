import { NextResponse } from "next/server"
import { fetchCommunityActivity } from "@/lib/mockData"

// GET /api/community/activity - Get community activity
export async function GET() {
  try {
    const activity = await fetchCommunityActivity()

    return NextResponse.json(activity)
  } catch (error) {
    console.error("Error fetching community activity:", error)
    return NextResponse.json({ error: "Failed to fetch community activity" }, { status: 500 })
  }
}
