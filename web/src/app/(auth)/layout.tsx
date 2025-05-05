import type React from "react"
import Sidebar from "@/components/dashboard/sidebar"
import { WalletProvider } from "@/providers/wallet-provider"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <WalletProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 md:ml-64 transition-all duration-300">
          <div className="container py-8">{children}</div>
        </div>
      </div>
    </WalletProvider>
  )
}
