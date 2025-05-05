import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Filter, Search, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default function BrowsePage() {
  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Bets</h1>
          <p className="text-muted-foreground mt-1">Discover and join bets on any topic</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search bets..." className="w-full md:w-[260px] pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="bg-primary-gradient text-text-plum">Create Bet</Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/50 mb-8">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
          >
            All Bets
          </TabsTrigger>
          <TabsTrigger
            value="trending"
            className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
          >
            Trending
          </TabsTrigger>
          <TabsTrigger
            value="ending-soon"
            className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
          >
            Ending Soon
          </TabsTrigger>
          <TabsTrigger
            value="my-bets"
            className="data-[state=active]:bg-primary-gradient data-[state=active]:text-text-plum"
          >
            My Bets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <BetCard key={i} index={i} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Button variant="outline" size="lg">
              Load More
            </Button>
          </div>
        </TabsContent>

        {/* Other tab contents would be similar */}
        <TabsContent value="trending" className="mt-0">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Select a different tab to see more bets</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BetCard({ index }: { index: number }) {
  const categories = ["crypto", "sports", "politics", "entertainment", "weather"]
  const titles = [
    "Will BTC reach $100k before July 2024?",
    "Will the Lakers win the NBA Championship?",
    "Will Solana reach 500 TPS sustained?",
    "Will it rain in Miami on July 4th?",
    "Will the next James Bond be a woman?",
    "Will SpaceX reach Mars before 2030?",
    "Will Apple release a foldable iPhone in 2024?",
    "Will the US election have over 65% turnout?",
  ]

  const category = categories[index % categories.length]
  const title = titles[index % titles.length]
  const yesPool = Math.floor(Math.random() * 5000) + 500
  const noPool = Math.floor(Math.random() * 5000) + 500
  const daysLeft = Math.floor(Math.random() * 30) + 1
  const participants = Math.floor(Math.random() * 100) + 20

  return (
    <Card className="overflow-hidden hover-scale transition-premium">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="capitalize bg-muted/50">
            {category}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {daysLeft} days left
          </div>
        </div>
        <CardTitle className="line-clamp-2 mt-2 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Yes: {((yesPool / (yesPool + noPool)) * 100).toFixed(1)}%</span>
              <span>No: {((noPool / (yesPool + noPool)) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary-gradient h-2.5 rounded-full"
                style={{ width: `${(yesPool / (yesPool + noPool)) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-accent-green" />
              <span className="font-mono">{yesPool + noPool} SOL</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4 text-accent-blue" />
              <span>{participants} participants</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary-gradient text-text-plum">
          <Link href={`/bet/bet-${index + 1}`}>Place Bet</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
