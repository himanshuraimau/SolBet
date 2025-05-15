"use client"

import type React from "react"
import { useState } from "react" 
import Sidebar from "@/components/dashboard/sidebar"
import { WalletProvider } from "@/providers/wallet-provider"
import { AuthProvider } from "@/providers/auth-provider"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Track sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <WalletProvider>
      <AuthProvider>
        <div className="flex min-h-screen">
          {/* Static sidebar that takes up real space in the layout */}
          <div className={`shrink-0 ${sidebarCollapsed ? 'w-[80px]' : 'w-[256px]'}`}>
            <Sidebar 
              onCollapsedChange={setSidebarCollapsed} 
              className="fixed inset-y-0 left-0 z-30"
            />
          </div>
          
          {/* Main content area that flexes to fill available space */}
          <div className="flex-1 w-full">
            <div className="container py-8 px-4 sm:px-6 max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </AuthProvider>
    </WalletProvider>
  )
}
