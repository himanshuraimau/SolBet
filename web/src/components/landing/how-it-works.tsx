import { CheckCircle, Coins, type LucideIcon, ShieldCheck, Zap } from "lucide-react"

interface StepProps {
  title: string
  description: string
  icon: LucideIcon
  step: number
}

function Step({ title, description, icon: Icon, step }: StepProps) {
  return (
    <div className="relative pl-16">
      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary-gradient">
        <span className="font-mono text-lg font-bold text-text-plum">{step}</span>
      </div>
      <div className="font-heading text-xl font-bold mb-2">{title}</div>
      <div className="text-muted-foreground">{description}</div>
      <div className="absolute left-5 top-10 h-full w-px bg-border" />
      <div className="mt-6 flex items-center gap-x-3">
        <Icon className="h-5 w-5 text-primary-yellow" />
        <span className="text-sm text-muted-foreground">{getFeature(step)}</span>
      </div>
    </div>
  )
}

function getFeature(step: number): string {
  switch (step) {
    case 1:
      return "No account creation required, just connect your wallet"
    case 2:
      return "Create custom bets on any topic with flexible parameters"
    case 3:
      return "Transparent odds and real-time updates"
    case 4:
      return "Instant payouts secured by smart contracts"
    default:
      return ""
  }
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-6 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl uppercase">
            How <span className="text-gradient-primary">SolBet</span> Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Simple, transparent, and secure betting on the Solana blockchain.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:gap-x-16">
          <div className="space-y-12">
            <Step
              step={1}
              title="Connect Your Wallet"
              description="Link your Solana wallet to SolBet with a single click. We support Phantom, Solflare, and more."
              icon={ShieldCheck}
            />
            <Step
              step={2}
              title="Create or Join a Bet"
              description="Browse existing bets or create your own on any topic. Set parameters like minimum bet, end date, and more."
              icon={Zap}
            />
          </div>
          <div className="space-y-12">
            <Step
              step={3}
              title="Place Your Prediction"
              description="Choose 'Yes' or 'No' and decide how much SOL to wager. The odds update in real-time based on the pool sizes."
              icon={CheckCircle}
            />
            <Step
              step={4}
              title="Collect Your Winnings"
              description="When the bet resolves, winners automatically receive their share of the pool directly to their wallet."
              icon={Coins}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
