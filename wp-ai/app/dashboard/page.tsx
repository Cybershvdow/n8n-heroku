import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { AppLayout } from '@/components/layout/app-layout'
import { Plus, TrendingUp, FileText, DollarSign, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/pricing'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user stats
  const [proposalStats, recentWalkthroughs] = await Promise.all([
    prisma.proposal.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: true,
    }),
    prisma.walkthrough.findMany({
      where: { userId: user.id },
      include: {
        client: true,
        proposal: {
          select: {
            status: true,
            monthlyPrice: true,
          },
        },
        rooms: {
          select: {
            estimatedMinutes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const totalProposals = proposalStats.reduce((sum, stat) => sum + stat._count, 0)
  const sentProposals = proposalStats.find((s) => s.status === 'sent')?._count || 0
  const wonProposals = proposalStats.find((s) => s.status === 'won')?._count || 0
  const winRate = sentProposals > 0 ? (wonProposals / sentProposals) * 100 : 0

  const totalRevenue = recentWalkthroughs
    .filter((w) => w.proposal?.status === 'won')
    .reduce((sum, w) => sum + (w.proposal?.monthlyPrice || 0), 0)

  return (
    <AppLayout>
      <div className="min-h-screen px-4 pt-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Dashboard</h1>
          <p className="text-text-secondary">Welcome back! Here's your overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-accent-blue" />
              <span className="text-text-muted text-sm">Proposals</span>
            </div>
            <p className="text-2xl font-bold">{totalProposals}</p>
          </div>

          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent-green" />
              <span className="text-text-muted text-sm">Win Rate</span>
            </div>
            <p className="text-2xl font-bold">{winRate.toFixed(0)}%</p>
          </div>

          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-neon-lime" />
              <span className="text-text-muted text-sm">Monthly Revenue</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>

          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-accent-purple" />
              <span className="text-text-muted text-sm">Walkthroughs</span>
            </div>
            <p className="text-2xl font-bold">{recentWalkthroughs.length}</p>
          </div>
        </div>

        {/* New Walkthrough CTA */}
        <Link href="/walkthroughs/new">
          <button className="w-full bg-neon-lime text-background font-semibold py-4 rounded-xl hover:bg-neon-lime/90 transition-colors flex items-center justify-center gap-2 mb-8">
            <Plus className="w-5 h-5" />
            New Walkthrough
          </button>
        </Link>

        {/* Recent Walkthroughs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold">Recent Walkthroughs</h2>
            <Link href="/walkthroughs" className="text-neon-lime text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentWalkthroughs.length === 0 ? (
              <div className="bg-card/50 border border-border rounded-xl p-8 text-center">
                <p className="text-text-muted">No walkthroughs yet. Create your first one!</p>
              </div>
            ) : (
              recentWalkthroughs.map((walkthrough) => {
                const totalMinutes = walkthrough.rooms.reduce(
                  (sum, room) => sum + room.estimatedMinutes,
                  0
                )
                const hours = Math.floor(totalMinutes / 60)
                const minutes = totalMinutes % 60

                return (
                  <Link
                    key={walkthrough.id}
                    href={`/walkthroughs/${walkthrough.id}`}
                    className="block bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4 hover:border-neon-lime/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{walkthrough.client.name}</h3>
                        <p className="text-sm text-text-secondary">
                          {walkthrough.propertyAddress}
                        </p>
                      </div>
                      {walkthrough.proposal && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            walkthrough.proposal.status === 'won'
                              ? 'bg-accent-green/20 text-accent-green'
                              : walkthrough.proposal.status === 'sent'
                              ? 'bg-accent-blue/20 text-accent-blue'
                              : 'bg-text-muted/20 text-text-muted'
                          }`}
                        >
                          {walkthrough.proposal.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span>{walkthrough.rooms.length} rooms</span>
                      <span>
                        {hours}h {minutes}m
                      </span>
                      {walkthrough.proposal && (
                        <span className="font-semibold text-neon-lime">
                          {formatCurrency(walkthrough.proposal.monthlyPrice)}/mo
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
