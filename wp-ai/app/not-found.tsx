import { AppLayout } from '@/components/layout/app-layout'
import { Search, Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <AppLayout>
      <div className="min-h-screen px-4 pt-6 pb-24 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-accent-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-accent-purple" />
          </div>

          <h1 className="text-6xl font-heading font-bold mb-3 text-neon-lime">404</h1>
          <h2 className="text-2xl font-heading font-bold mb-3">Page Not Found</h2>
          <p className="text-text-secondary mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link href="/dashboard">
            <button className="bg-neon-lime text-background font-semibold py-3 px-6 rounded-lg hover:bg-neon-lime/90 transition-colors inline-flex items-center gap-2">
              <Home className="w-5 h-5" />
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
