import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, Nunito, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import ClientRootLayout from "./client-layout"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SolBet - Decentralized Betting Platform",
  description: "Place bets on anything with the power of Solana blockchain",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClientRootLayout
      spaceGrotesk={spaceGrotesk.variable}
      nunito={nunito.variable}
      jetbrainsMono={jetbrainsMono.variable}
    >
      {children}
    </ClientRootLayout>
  )
}
