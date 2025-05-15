"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { featuredBets } from "@/mock/bets";
import { formatSOL } from "@/lib/utils";

export default function FeaturedBets() {
  // Add state to track client-side rendering to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true when component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // When generating bet percentages, use this approach:
  const renderBetPercentages = (bet: { yesPool: number; noPool: number; }) => {
    // If not mounted yet (server-side or first render), use fixed values
    if (!mounted) {
      return {
        yesPercent: 50,
        noPercent: 50
      };
    }
    
    // Once mounted (client-side only), calculate the actual percentages
    const totalPool = bet.yesPool + bet.noPool;
    const yesPercent = totalPool > 0 
      ? parseFloat(((bet.yesPool / totalPool) * 100).toFixed(1))
      : 50;
    const noPercent = totalPool > 0 
      ? parseFloat(((bet.noPool / totalPool) * 100).toFixed(1))
      : 50;
      
    return { yesPercent, noPercent };
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {featuredBets.map((bet: { id?: any; title?: any; yesPool: any; noPool: any; }) => {
        const { yesPercent, noPercent } = renderBetPercentages(bet);
        
        return (
          <Card key={bet.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{bet.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{yesPercent}%</span>
                  <span>{noPercent}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Yes Pool: {formatSOL(bet.yesPool)}</span>
                  <span>No Pool: {formatSOL(bet.noPool)}</span>
                </div>
                <Button variant="outline">Place Bet</Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}