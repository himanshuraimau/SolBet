import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateBetAddress } from "@/lib/solana";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const betId = params.id;
    
    if (!betId) {
      return NextResponse.json({ error: "Bet ID is required" }, { status: 400 });
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
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }
    
    let betAccount = bet.onChainBetAddress;
    let escrowAccount = bet.onChainEscrowAddress;
    
    // If we don't have on-chain accounts stored, generate deterministic ones
    // Note: In production, this should only happen during a migration or if there's an issue
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
    
    return NextResponse.json({
      betAccount,
      escrowAccount
    });
    
  } catch (error) {
    console.error("Error fetching Solana addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch Solana addresses" },
      { status: 500 }
    );
  }
}
