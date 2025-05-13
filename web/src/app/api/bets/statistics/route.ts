import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeApiHandler, validateUserByWalletAddress, formatApiResponse } from "@/lib/api-utils";

/**
 * @route GET /api/bets/statistics
 * @description Get statistics about a user's betting history
 * @param {string} address - The user's wallet address
 * @returns {Object} Bet statistics including yes/no distribution
 */
export async function GET(request: NextRequest) {
  return safeApiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    
    const user = await validateUserByWalletAddress(address!);

    // Get bet statistics
    const userBets = await prisma.userBet.findMany({
      where: {
        userId: user.id,
      },
      include: {
        bet: true,
      },
    });

    // Calculate yes/no bet distribution
    let yesBets = 0;
    let noBets = 0;
    let totalBets = userBets.length;

    userBets.forEach((userBet) => {
      if (userBet.position === "yes" || userBet.position === "YES") {
        yesBets++;
      } else if (userBet.position === "no" || userBet.position === "NO") {
        noBets++;
      }
    });

    return formatApiResponse({
      yesBets,
      noBets,
      totalBets,
    });
  });
}