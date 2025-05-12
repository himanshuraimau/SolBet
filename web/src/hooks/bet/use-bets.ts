import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Bet, BetsResponse, PaginationInfo, BetTab } from "@/types/bet"

interface UseBetsProps {
  tab: BetTab | string
  page: number
  search?: string
  category?: string
}

interface UseBetsReturn {
  bets: Bet[]
  pagination: PaginationInfo
  isLoading: boolean
  error: Error | null
}

export function useBets({ tab, page, search, category }: UseBetsProps): UseBetsReturn {
  const [bets, setBets] = useState<Bet[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: page,
    limit: 12,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { publicKey } = useWallet()

  useEffect(() => {
    async function fetchBets() {
      setIsLoading(true)
      setError(null)
      
      try {
        let url = `/api/bets?tab=${tab}&page=${page}&limit=12`
        
        if (search) {
          url += `&search=${encodeURIComponent(search)}`
        }
        
        if (category) {
          url += `&category=${encodeURIComponent(category)}`
        }
        
        // Add wallet address for my-bets tab
        if (tab === "my-bets" && publicKey) {
          url += `&wallet=${publicKey.toString()}`
        }
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error("Failed to fetch bets")
        }
        
        const data: BetsResponse = await response.json()
        setBets(data.bets)
        setPagination(data.pagination)
      } catch (err) {
        console.error("Error fetching bets:", err)
        setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchBets()
  }, [tab, page, search, category, publicKey])

  return { bets, pagination, isLoading, error }
}
