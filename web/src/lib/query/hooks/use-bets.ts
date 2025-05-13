import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { queryKeys } from "../config"
import type { BetCategory, BetStatus } from "@/types/bet"
import { useSolanaBet } from "@/hooks/bet/use-solana-bet"
import { useWallet } from "@solana/wallet-adapter-react"
import { fetchBetById, fetchBets } from "@/lib/api"

/**
 * Hook to fetch a list of bets with optional filtering
 * @param category Optional category filter
 * @param status Optional status filter
 */
export function useBets(category?: BetCategory, status?: BetStatus) {
  return useQuery({
    queryKey: queryKeys.bets.list(JSON.stringify({ category, status })),
    queryFn: () => fetchBets(category, status),
  })
}

/**
 * Hook to fetch a single bet by ID
 * Includes both API and Solana blockchain data
 * @param betId The bet ID
 */
export const useBet = (betId: string) => {
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
    queryFn: () => fetchBetById(betId),
    enabled: !!betId,
    retry: 3,
    retryDelay: 1000,
    refetchInterval: 5000, // Refetch every 5 seconds
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
    (p: any) => p.walletAddress === walletAddress
  );

  const userPosition = data?.participants.find(
    (p: any) => p.walletAddress === walletAddress
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

/**
 * Hook for infinite scrolling of bets
 * Used for paginated bet lists
 * @param category Optional category filter
 * @param status Optional status filter
 */
export function useInfiniteBets(category?: BetCategory, status?: BetStatus) {
  return useInfiniteQuery({
    queryKey: queryKeys.bets.list(JSON.stringify({ category, status, infinite: true })),
    queryFn: ({ pageParam = 1 }) => fetchBets(category, status, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.bets.length === 0) return undefined
      if (lastPageParam >= lastPage.totalPages) return undefined
      return (lastPageParam as number) + 1
    },
  })
}
