import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { AppLayout } from '@/components/layout/app-layout'
import { PricingCalculator } from '@/components/pricing/pricing-calculator'
import { PricingActions } from '@/components/pricing/pricing-actions'
import { ChevronLeft, MapPin, Building2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatHours } from '@/lib/pricing'

interface PricingPageProps {
  params: Promise<{ id: string }>
}

export default async function PricingPage({ params }: PricingPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const walkthrough = await prisma.walkthrough.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      client: true,
      rooms: {
        orderBy: { createdAt: 'asc' },
      },
      proposal: true,
    },
  })

  if (!walkthrough) {
    notFound()
  }

  const userSettings = await prisma.user.findUnique({
    where: { id: user.id },
    select: { hourlyWage: true, targetMargin: true },
  })

  const totalMinutes = walkthrough.rooms.reduce((sum, room) => sum + room.estimatedMinutes, 0)

  // If proposal exists, redirect to it
  if (walkthrough.proposal) {
    redirect(`/proposals/${walkthrough.proposal.id}`)
  }

  return (
    <AppLayout>
      <div className="min-h-screen px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-card rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold">Set Pricing</h1>
            <p className="text-sm text-text-secondary">Configure rates and generate proposal</p>
          </div>
        </div>

        {/* Walkthrough Summary */}
        <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-heading font-semibold">{walkthrough.client.name}</h2>
              <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                <MapPin className="w-4 h-4" />
                {walkthrough.propertyAddress}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Rooms</p>
              <p className="text-lg font-semibold">{walkthrough.rooms.length}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Daily Time</p>
              <p className="text-lg font-semibold">{formatHours(totalMinutes / 60)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Frequency</p>
              <p className="text-lg font-semibold">{walkthrough.daysPerWeek}x/week</p>
            </div>
          </div>

          {walkthrough.facilityType && (
            <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
              <Building2 className="w-4 h-4" />
              {walkthrough.facilityType}
            </div>
          )}
        </div>

        {/* Rooms List */}
        <div className="mb-6">
          <h3 className="text-lg font-heading font-semibold mb-3">Rooms Breakdown</h3>
          <div className="space-y-2">
            {walkthrough.rooms.map((room) => (
              <div
                key={room.id}
                className="bg-card/50 border border-border rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{room.name}</p>
                  <p className="text-sm text-text-muted">{room.roomType}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neon-lime">{room.estimatedMinutes} min</p>
                  {room.squareFeet && (
                    <p className="text-xs text-text-muted">{room.squareFeet} sq ft</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Calculator */}
        <PricingActions
          walkthroughId={walkthrough.id}
          clientId={walkthrough.client.id}
          totalDailyMinutes={totalMinutes}
          daysPerWeek={walkthrough.daysPerWeek}
          employeeWage={userSettings?.hourlyWage || 20}
        />
      </div>
    </AppLayout>
  )
}
