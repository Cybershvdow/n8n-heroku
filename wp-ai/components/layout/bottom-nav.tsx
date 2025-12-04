'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Camera, FileText, Settings } from 'lucide-react'

const navItems = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/walkthroughs/new',
    label: 'New',
    icon: Camera,
  },
  {
    href: '/proposals',
    label: 'Proposals',
    icon: FileText,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors ${
                  isActive
                    ? 'text-neon-lime'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-neon-lime/10' : ''}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
