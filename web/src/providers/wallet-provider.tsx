"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { WalletInfo, WalletTransaction } from "@/types/wallet"
import { mockWalletInfo, mockTransactions } from "@/lib/mockData"

interface WalletContextType {
  wallet: WalletInfo | null
  connecting: boolean
  transactions: WalletTransaction[]
  connect: (provider: string) => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])

  // Check for existing connection on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("solbet-wallet")
    if (savedWallet) {
      try {
        const parsedWallet = JSON.parse(savedWallet)
        setWallet(parsedWallet)
        // Load transactions for this wallet
        loadTransactions()
      } catch (error) {
        console.error("Failed to parse saved wallet", error)
        localStorage.removeItem("solbet-wallet")
      }
    }
  }, [])

  const loadTransactions = async () => {
    // Use mock transactions data
    setTransactions(mockTransactions)
  }

  const connect = async (provider: string) => {
    setConnecting(true)
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Use mock wallet info
      const connectedWallet = {
        ...mockWalletInfo,
        provider: provider as any,
      }

      setWallet(connectedWallet)
      localStorage.setItem("solbet-wallet", JSON.stringify(connectedWallet))
      loadTransactions()
    } catch (error) {
      console.error("Failed to connect wallet", error)
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setWallet(null)
    setTransactions([])
    localStorage.removeItem("solbet-wallet")
  }

  const refreshBalance = async () => {
    if (!wallet) return

    // Simulate balance update delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const updatedWallet = {
      ...wallet,
      balance: wallet.balance + (Math.random() * 2 - 1), // Random change between -1 and 1
    }

    setWallet(updatedWallet)
    localStorage.setItem("solbet-wallet", JSON.stringify(updatedWallet))
    return updatedWallet.balance
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connecting,
        transactions,
        connect,
        disconnect,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
