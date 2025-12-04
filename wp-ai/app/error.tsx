'use client'

import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <AppLayout>
      <div className="min-h-screen px-4 pt-6 pb-24 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-accent-orange/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-accent-orange" />
          </div>

          <h1 className="text-2xl font-heading font-bold mb-3">Something went wrong</h1>
          <p className="text-text-secondary mb-6">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-card/50 border border-border rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-text-muted mb-2">Error Details:</p>
              <p className="text-sm font-mono text-accent-orange">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="w-full bg-neon-lime text-background font-semibold py-3 rounded-lg hover:bg-neon-lime/90 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <Link href="/dashboard">
              <button className="w-full bg-card border border-border font-semibold py-3 rounded-lg hover:bg-card/80 transition-colors flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Go to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
