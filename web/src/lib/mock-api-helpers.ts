// Export for API route handlers
export function generateUserBetsResponse(userAddress: string) {
  const active = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
    id: `bet_${Math.random().toString(36).substr(2, 9)}`,
    title: getRandomBetTitle(),
    description: "A mock bet description for testing purposes",
    amount: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
    position: Math.random() > 0.5 ? "YES" : "NO",
    expiresAt: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  const created = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
    id: `bet_${Math.random().toString(36).substr(2, 9)}`,
    title: getRandomBetTitle(),
    description: "A bet created by this user",
    amount: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
    expiresAt: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  const participated = Array.from({ length: Math.floor(Math.random() * 4) + 2 }, () => ({
    id: `bet_${Math.random().toString(36).substr(2, 9)}`,
    title: getRandomBetTitle(),
    description: "A bet this user participated in",
    amount: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
    position: Math.random() > 0.5 ? "YES" : "NO",
    expiresAt: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  const resolved = Array.from({ length: Math.floor(Math.random() * 6) + 2 }, () => {
    const isWin = Math.random() > 0.4;
    return {
      id: `bet_${Math.random().toString(36).substr(2, 9)}`,
      title: getRandomBetTitle(),
      description: "A resolved bet",
      amount: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
      position: Math.random() > 0.5 ? "YES" : "NO",
      outcome: Math.random() > 0.5 ? "YES" : "NO",
      payout: isWin ? parseFloat((Math.random() * 3 + 0.5).toFixed(2)) : 0,
      expiresAt: new Date(Date.now() - (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
      status: "resolved",
      createdAt: new Date(Date.now() - (Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
  
  return { active, created, participated, resolved };
}

// Helper function to generate random bet titles
function getRandomBetTitle() {
  const titles = [
    "Will BTC reach $100K by the end of 2025?",
    "Will Ethereum 2.0 fully launch this year?",
    "Will Solana reach 100K TPS?",
    "Will Apple release a foldable iPhone?",
    "Will the EU pass major crypto regulation?",
    "Will the US have a CBDC by 2026?",
    "Will NFT trading volume exceed $10B?",
    "Will Tesla accept BTC again?",
    "Will El Salvador remain Bitcoin legal tender?",
    "Will a country adopt Solana as legal tender?",
    "Will ChatGPT-5 be released this year?",
    "Will Metaverse land sales top $1B?",
    "Will Cardano smart contracts gain traction?",
    "Will the US approve a spot Bitcoin ETF?",
    "Will a DAO buy a major sports team?"
  ];
  
  return titles[Math.floor(Math.random() * titles.length)];
}
