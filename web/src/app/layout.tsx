import { Space_Grotesk, Nunito, JetBrains_Mono } from "next/font/google"
import ClientRootLayout from "./client-layout"
import "./globals.css"
// Font configuration
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata = {
  title: "SolBet - Decentralized Betting Platform",
  description: "Create and participate in bets on the Solana blockchain",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        
          <ClientRootLayout
            spaceGrotesk={spaceGrotesk.variable}
            nunito={nunito.variable}
            jetbrainsMono={jetbrainsMono.variable}
          >
            {children}
          </ClientRootLayout>
        
      </body>
    </html>
  )
}
