import { type NextRequest, NextResponse } from "next/server"
import { fetchWalletTransactions } from "@/lib/mockData"

// GET /api/wallet/transactions - Get wallet transactions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const transactions = await fetchWalletTransactions(address)

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching wallet transactions:", error)
    return NextResponse.json({ error: "Failed to fetch wallet transactions" }, { status: 500 })
  }
}
