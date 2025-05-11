import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET /api/bets/statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Authenticate the user
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user from wallet address
    const user = await prisma.user.findFirst({
      where: {
        walletAddress: address,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get bet statistics
    const userBets = await prisma.userBet.findMany({
      where: {
        userId: user.id,
      },
      include: {
        bet: true,
      },
    })

    // Calculate yes/no bet distribution
    let yesBets = 0
    let noBets = 0
    let totalBets = userBets.length

    userBets.forEach((userBet) => {
      if (userBet.position === "YES") {
        yesBets++
      } else if (userBet.position === "NO") {
        noBets++
      }
    })

    return NextResponse.json({
      yesBets,
      noBets,
      totalBets,
    })
  } catch (error) {
    console.error("Error fetching bet statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch bet statistics" },
      { status: 500 }
    )
  }
}