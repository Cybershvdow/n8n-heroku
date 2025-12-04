'use client'

import { BottomNav } from './bottom-nav'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
