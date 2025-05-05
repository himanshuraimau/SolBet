"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Users } from "lucide-react"
import Leaderboard from "@/components/social/leaderboard"
import SocialActivityFeed from "@/components/social/activity-feed"
import FadeIn from "@/components/motion/fade-in"
import AnimatedCard from "@/components/motion/animated-card"

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search users..." className="pl-9 w-[200px]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <FadeIn>
            <Tabs defaultValue="activity">
              <TabsList className="bg-muted/50 mb-4">
                <TabsTrigger value="activity">Activity Feed</TabsTrigger>
                <TabsTrigger value="trending">Trending Bets</TabsTrigger>
                <TabsTrigger value="popular">Popular Users</TabsTrigger>
              </TabsList>

              <TabsContent value="activity">
                <SocialActivityFeed />
              </TabsContent>

              <TabsContent value="trending">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary-yellow" />
                      Trending Bets
                    </CardTitle>
                    <CardDescription>The most active bets right now</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Coming soon: Trending bets feature</p>
                      <Button variant="outline" className="mt-4">
                        Browse All Bets
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="popular">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary-yellow" />
                      Popular Users
                    </CardTitle>
                    <CardDescription>Most followed users on SolBet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Coming soon: Popular users feature</p>
                      <Button variant="outline" className="mt-4">
                        Explore Community
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </FadeIn>
        </div>
        <div>
          <FadeIn delay={0.2} direction="left">
            <AnimatedCard>
              <Leaderboard />
            </AnimatedCard>
          </FadeIn>
        </div>
      </div>

      <FadeIn delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle>Community Challenges</CardTitle>
            <CardDescription>Participate in special events and win rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Coming soon: Community challenges and events</p>
              <Button variant="outline" className="mt-4">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
