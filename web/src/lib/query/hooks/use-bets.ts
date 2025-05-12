import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { BetCategory, BetStatus } from "@/types/bet"
import { useSolanaBet } from "@/hooks/bet/use-solana-bet";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { Bet } from "@/types/bet";

// Updated API functions
const fetchBetsFromApi = async (category?: BetCategory, status?: BetStatus, page = 1, limit = 10) => {
  const params = new URLSearchParams()
  if (category) params.append("category", category)
  if (status) params.append("status", status)
  params.append("page", page.toString())
  params.append("limit", limit.toString())

  const response = await fetch(`/api/bets?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch bets")
  }
  return response.json()
}

const fetchBetByIdFromApi = async (id: string) => {
  const response = await fetch(`/api/bets/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch bet")
  }
  return response.json()
}

// Hook to fetch a list of bets with optional filtering
export function useBets(category?: BetCategory, status?: BetStatus) {
  return useQuery({
    queryKey: queryKeys.bets.list(JSON.stringify({ category, status })),
    queryFn: () => fetchBetsFromApi(category, status),
  })
}

// Hook to fetch a single bet by ID
export const useBet = (betId: string) => {
  const { toast } = useToast();
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString();

  // Fetch bet data from the API
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.bets.detail(betId),
    queryFn: async () => {
      const response = await fetch(`/api/bets/${betId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch bet");
      }
      
      const data = await response.json();
      return data as Bet;
    },
    enabled: !!betId,
    retry: 3,
    retryDelay: 1000,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Also get Solana chain data for this bet
  const { useBetData: useSolanaBetData } = useSolanaBet();
  const { 
    data: solanaBetData,
    isLoading: isSolanaLoading,
    error: solanaError
  } = useSolanaBetData(betId);

  // Check if the current user has already placed a bet
  const hasUserParticipated = !!data?.participants.find(
    (p) => p.walletAddress === walletAddress
  );

  const userPosition = data?.participants.find(
    (p) => p.walletAddress === walletAddress
  )?.position;

  return {
    data,
    solanaBetData,
    isLoading: isLoading || isSolanaLoading,
    error: error || solanaError,
    hasUserParticipated,
    userPosition,
    refetch,
  };
};

// Hook for infinite scrolling of bets
export function useInfiniteBets(category?: BetCategory, status?: BetStatus) {
  return useInfiniteQuery({
    queryKey: queryKeys.bets.list(JSON.stringify({ category, status, infinite: true })),
    queryFn: ({ pageParam = 1 }) => fetchBetsFromApi(category, status, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.bets.length === 0) return undefined
      if (lastPageParam >= lastPage.totalPages) return undefined
      return (lastPageParam as number) + 1
    },
  })
}
