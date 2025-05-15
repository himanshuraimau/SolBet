"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  Bell,
  Menu,
  X,
  LogOut,
  Plus,
  Search,
  UserCircle
  // Add any other icons you're using
} from "lucide-react"

interface SidebarProps {
  className?: string
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function Sidebar({ className, onCollapsedChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  // Handle collapse state changes
  const toggleCollapsed = () => {
    const newState = !collapsed
    setCollapsed(newState)
    onCollapsedChange?.(newState)
  }

  // Define navigation items - using previously existing paths
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/browse", label: "Browse Bets", icon: Search },
    { href: "/create-bet", label: "Create Bet", icon: Plus },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/profile", label: "Profile", icon: UserCircle }

  ]

  return (
    <aside
      className={cn(
        "h-screen bg-background border-r border-border transition-all duration-300",
        collapsed ? "w-[80px]" : "w-[256px]",
        className
      )}
    >
      <div className="h-full flex flex-col">
        {/* Sidebar header with logo/title and collapse toggle */}
        <div className={cn(
          "h-16 flex items-center px-4 border-b border-border",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && <Link className="font-heading text-2xl font-bold text-gradient-primary" href="/">SolBet</Link>}
          <button
            onClick={toggleCollapsed}
            className="p-2 rounded-md hover:bg-accent"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                  collapsed ? "justify-center px-0" : "justify-start",
                  isActive
                    ? "bg-primary-gradient text-text-plum"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={20} className={cn(collapsed ? "mx-0" : "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </div>


      </div>
    </aside>
  )
}
