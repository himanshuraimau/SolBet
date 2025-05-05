import { formatDistanceToNow } from "date-fns"
import { formatSOL } from "@/lib/utils"
import type { WalletTransaction } from "@/types/wallet"
import { ArrowDownLeft, ArrowUpRight, Coins, Ticket } from "lucide-react"

interface TransactionListProps {
  transactions: WalletTransaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (!transactions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getTransactionIconClass(tx.type)}`}>{getTransactionIcon(tx.type)}</div>
            <div>
              <div className="font-medium">{getTransactionTitle(tx.type)}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span>{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</span>
                <span>•</span>
                <span className="font-mono">{tx.id.substring(0, 8)}</span>
              </div>
            </div>
          </div>
          <div className={`font-mono font-medium ${getTransactionAmountClass(tx.type)}`}>
            {getTransactionPrefix(tx.type)}
            {formatSOL(tx.amount)}
          </div>
        </div>
      ))}
    </div>
  )
}

function getTransactionIcon(type: WalletTransaction["type"]) {
  switch (type) {
    case "deposit":
      return <ArrowDownLeft className="h-4 w-4" />
    case "withdrawal":
      return <ArrowUpRight className="h-4 w-4" />
    case "bet":
      return <Ticket className="h-4 w-4" />
    case "winnings":
      return <Coins className="h-4 w-4" />
    default:
      return <ArrowDownLeft className="h-4 w-4" />
  }
}

function getTransactionIconClass(type: WalletTransaction["type"]) {
  switch (type) {
    case "deposit":
      return "bg-accent-green/10 text-accent-green"
    case "withdrawal":
      return "bg-accent-coral/10 text-accent-coral"
    case "bet":
      return "bg-secondary-violet/10 text-secondary-violet"
    case "winnings":
      return "bg-primary-yellow/10 text-primary-yellow"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getTransactionTitle(type: WalletTransaction["type"]) {
  switch (type) {
    case "deposit":
      return "Deposit"
    case "withdrawal":
      return "Withdrawal"
    case "bet":
      return "Placed Bet"
    case "winnings":
      return "Received Winnings"
    default:
      return "Transaction"
  }
}

function getTransactionAmountClass(type: WalletTransaction["type"]) {
  switch (type) {
    case "deposit":
    case "winnings":
      return "text-accent-green"
    case "withdrawal":
    case "bet":
      return "text-accent-coral"
    default:
      return ""
  }
}

function getTransactionPrefix(type: WalletTransaction["type"]) {
  switch (type) {
    case "deposit":
    case "winnings":
      return "+"
    case "withdrawal":
    case "bet":
      return "-"
    default:
      return ""
  }
}
