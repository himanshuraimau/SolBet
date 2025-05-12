"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Plus,
  Search,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  Menu,
  X,
  Users,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Create Bet",
    href: "/create-bet",
    icon: Plus,
  },
  {
    name: "Browse Bets",
    href: "/browse",
    icon: Search,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Community",
    href: "/community",
    icon: Users,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
]



interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.div
          initial={false}
          animate={{
            width: collapsed ? 72 : 256,
            transition: { duration: 0.3 },
          }}
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background transition-all md:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            className,
          )}
        >
          <div className="flex h-16 items-center border-b px-4 justify-between">
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/" className="flex items-center gap-2">
                    <span className="font-heading text-2xl font-bold text-gradient-primary">SolBet</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle button */}
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
            <nav className="space-y-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary-gradient text-text-plum"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed ? "justify-center" : "",
                  )}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? link.name : undefined}
                >
                  <link.icon className="h-5 w-5" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              ))}
            </nav>

          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
