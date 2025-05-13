import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBetAddress } from "@/lib/solana";
import { safeApiHandler, ApiError, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/bets/:id/solana-address
 * @description Get Solana addresses for a bet
 * @param {string} id - The bet ID
 * @returns {Object} Bet's on-chain account addresses
 */
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeApiHandler(async () => {
    const betId = params.id;
    
    if (!betId) {
      return ApiError.badRequest("Bet ID is required");
    }
    
    // Fetch bet from database to get its on-chain reference
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      select: { 
        id: true,
        onChainBetAddress: true,
        onChainEscrowAddress: true,
        createdAt: true,
        creatorId: true
      }
    });
    
    if (!bet) {
      return ApiError.notFound("Bet not found");
    }
    
    let betAccount = bet.onChainBetAddress;
    let escrowAccount = bet.onChainEscrowAddress;
    
    // If we don't have on-chain accounts stored, generate deterministic ones
    if (!betAccount || !escrowAccount) {
      // Generate deterministic addresses based on bet ID and creation data
      const seed = `${bet.id}-${bet.createdAt.getTime()}-${bet.creatorId}`;
      const addresses = generateBetAddress(seed);
      
      betAccount = addresses.betAccount;
      escrowAccount = addresses.escrowAccount;
      
      // Store these for future use
      await prisma.bet.update({
        where: { id: betId },
        data: {
          onChainBetAddress: betAccount,
          onChainEscrowAddress: escrowAccount
        }
      });
    }
    
    return formatApiResponse({
      betAccount,
      escrowAccount
    });
  });
}
