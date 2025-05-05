"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import WalletBadge from "@/components/wallet/wallet-badge"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Browse Bets", href: "/browse" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "FAQ", href: "/#faq" },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Don't show header in auth layout pages
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

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="font-heading text-2xl font-bold text-gradient-primary">SolBet</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-semibold leading-6 transition-colors hover:text-primary-yellow",
                pathname === item.href ? "text-primary-yellow" : "text-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <WalletBadge />
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`lg:hidden ${mobileMenuOpen ? "fixed inset-0 z-50" : "hidden"}`}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xs" />
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="font-heading text-2xl font-bold text-gradient-primary">SolBet</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-accent",
                      pathname === item.href ? "text-primary-yellow" : "text-foreground",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <WalletBadge />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
