"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { WalletProvider } from "@/providers/wallet-provider"
import { QueryProvider } from "@/providers/QueryProvider"
import { usePathname } from "next/navigation"
import { AuthProvider } from "@/providers/auth-provider" // Fix: Import named export

export default function ClientRootLayout({
  children,
  spaceGrotesk,
  nunito,
  jetbrainsMono,
}: Readonly<{
  children: React.ReactNode
  spaceGrotesk: string
  nunito: string
  jetbrainsMono: string
}>) {
  // Use state to track client-side hydration
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true when component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`${spaceGrotesk} ${nunito} ${jetbrainsMono} font-sans`}>
      <QueryProvider>
        {/* Always render WalletProvider to ensure context is available */}
        <WalletProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <FooterWrapper />
            </div>
          </AuthProvider>
        </WalletProvider>
      </QueryProvider>
    </div>
  )
}

// Client component to conditionally render footer
function FooterWrapper() {
  const pathname = usePathname()

  // Don't show footer in auth layout pages
  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/create-bet") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/bet/") ||
    pathname?.startsWith("/analytics") ||
    pathname?.startsWith("/community") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/notifications") ||
    pathname?.startsWith("/help")
  ) {
    return null
  }

  return <Footer />
}
