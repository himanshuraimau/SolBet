"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BetCard } from "@/components/dashboard/bet-card";
import { useUserBets } from "@/lib/query/hooks/use-user-bets";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardBets() {
  const [activeTab, setActiveTab] = useState("active");
  const { data, isLoading, error } = useUserBets();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bets</CardTitle>
          <CardDescription>Loading your bets...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bets</CardTitle>
          <CardDescription>There was an error loading your bets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load your bets</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the appropriate bets based on active tab
  const getBets = () => {
    if (!data) return [];
    switch (activeTab) {
      case "active":
        return data.active;
      case "resolved":
        return data.resolved;
      case "created":
        return data.created;
      case "participated":
        return data.participated;
      default:
        return data.active;
    }
  };

  const bets = getBets();
  const isEmpty = bets.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bets</CardTitle>
        <CardDescription>Manage your bets and check their status</CardDescription>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="created">Created</TabsTrigger>
            <TabsTrigger value="participated">Participated</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No bets found in this category</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/browse">Browse Bets</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bets.map((bet) => (
              <BetCard key={bet.id} bet={bet} type={activeTab as any} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
