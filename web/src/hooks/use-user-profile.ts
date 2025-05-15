import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { queryKeys } from '@/lib/query/config';
import { fetchUserProfile } from '@/lib/api';
import type { UserProfile } from '@/lib/query/hooks/use-user-data';

/**
 * Extended hook for user profile data with additional functionality
 * beyond the basic useUserProfile hook
 */
export function useExtendedUserProfile() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString();
  const queryClient = useQueryClient();
  
  const result = useQuery<UserProfile>({
    queryKey: queryKeys.user.profile(),
    queryFn: () => walletAddress 
      ? fetchUserProfile(walletAddress) 
      : Promise.resolve(null),
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Add a refresh function for explicit refresh requests
  const refreshProfile = async () => {
    if (walletAddress) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    }
  };
  
  return {
    ...result,
    refreshProfile
  };
}
