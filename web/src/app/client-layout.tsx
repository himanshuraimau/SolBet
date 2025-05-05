"use client"

import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { WalletProvider } from "@/providers/wallet-provider"
import { QueryProvider } from "@/providers/query-provider"
import { usePathname } from "next/navigation"

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk} ${nunito} ${jetbrainsMono} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <WalletProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <FooterWrapper />
              </div>
            </WalletProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
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
