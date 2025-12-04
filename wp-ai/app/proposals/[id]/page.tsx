import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { AppLayout } from '@/components/layout/app-layout'
import { ProposalActions } from '@/components/proposals/proposal-actions'
import { ProposalActionsWrapper } from '@/components/proposals/proposal-actions-wrapper'
import { ChevronLeft, MapPin, Calendar, Clock, DollarSign, TrendingUp, Building2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatHours } from '@/lib/pricing'
import { PROPOSAL_STATUSES } from '@/lib/constants'

interface ProposalPageProps {
  params: Promise<{ id: string }>
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const proposal = await prisma.proposal.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      client: true,
      walkthrough: {
        include: {
          rooms: {
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  })

  if (!proposal) {
    notFound()
  }

  const statusInfo = PROPOSAL_STATUSES.find((s) => s.value === proposal.status)

  return (
    <AppLayout>
      <ProposalActionsWrapper proposal={proposal}>
        <div className="min-h-screen px-4 pt-6 pb-24">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/proposals">
              <button className="p-2 hover:bg-card rounded-lg transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-heading font-bold">Proposal</h1>
                <span className={`text-xs px-3 py-1 rounded-full ${statusInfo?.color} bg-current/10`}>
                  {statusInfo?.label}
                </span>
              </div>
              <p className="text-sm text-text-secondary">{proposal.title}</p>
            </div>
          </div>

        {/* Client Info */}
        <div className="bg-gradient-to-br from-neon-lime/10 to-accent-green/10 border border-neon-lime/30 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-heading font-semibold mb-3">{proposal.client.name}</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-text-muted" />
              <span className="text-text-secondary">{proposal.walkthrough.propertyAddress}</span>
            </div>
            {proposal.client.contactName && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-muted">Contact:</span>
                <span className="text-text-secondary">{proposal.client.contactName}</span>
              </div>
            )}
            {proposal.client.email && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-muted">Email:</span>
                <a href={`mailto:${proposal.client.email}`} className="text-neon-lime hover:underline">
                  {proposal.client.email}
                </a>
              </div>
            )}
            {proposal.client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-muted">Phone:</span>
                <a href={`tel:${proposal.client.phone}`} className="text-neon-lime hover:underline">
                  {proposal.client.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-heading font-semibold mb-4">Pricing Summary</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-accent-blue" />
                <span className="text-text-muted text-sm">Monthly Hours</span>
              </div>
              <p className="text-2xl font-bold">{formatHours(proposal.totalMonthlyHours)}</p>
            </div>

            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-accent-orange" />
                <span className="text-text-muted text-sm">Labor Cost</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(proposal.laborCost)}</p>
            </div>

            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent-green" />
                <span className="text-text-muted text-sm">Profit Margin</span>
              </div>
              <p className="text-2xl font-bold text-accent-green">{proposal.profitMargin.toFixed(1)}%</p>
            </div>

            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-neon-lime" />
                <span className="text-text-muted text-sm">Customer Rate</span>
              </div>
              <p className="text-2xl font-bold">${proposal.customerRate.toFixed(2)}/hr</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-neon-lime/20 to-accent-green/20 rounded-lg p-4 border border-neon-lime/30">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Monthly Price</span>
              <span className="text-3xl font-bold text-neon-lime">
                {formatCurrency(proposal.monthlyPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Rooms Breakdown */}
        <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-heading font-semibold mb-4">Scope of Work</h3>

          <div className="mb-4">
            <p className="text-sm text-text-secondary">{proposal.scopeOfWork}</p>
          </div>

          <h4 className="text-sm font-semibold mb-3 text-text-secondary">Rooms ({proposal.walkthrough.rooms.length})</h4>
          <div className="space-y-2">
            {proposal.walkthrough.rooms.map((room) => (
              <div
                key={room.id}
                className="bg-background/50 rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{room.name}</p>
                  <p className="text-sm text-text-muted">{room.roomType.replace(/_/g, ' ')}</p>
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

        {/* Introduction */}
        {proposal.introduction && (
          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6 mb-6">
            <h3 className="text-lg font-heading font-semibold mb-3">Introduction</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{proposal.introduction}</p>
          </div>
        )}

        {/* Terms & Conditions */}
        {proposal.termsConditions && (
          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6 mb-6">
            <h3 className="text-lg font-heading font-semibold mb-3">Terms & Conditions</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{proposal.termsConditions}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-card/50 border border-border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-muted mb-1">Created</p>
              <p className="font-medium">{new Date(proposal.createdAt).toLocaleDateString()}</p>
            </div>
            {proposal.sentAt && (
              <div>
                <p className="text-text-muted mb-1">Sent</p>
                <p className="font-medium">{new Date(proposal.sentAt).toLocaleDateString()}</p>
              </div>
            )}
            {proposal.viewedAt && (
              <div>
                <p className="text-text-muted mb-1">Last Viewed</p>
                <p className="font-medium">{new Date(proposal.viewedAt).toLocaleDateString()}</p>
              </div>
            )}
            {proposal.signedAt && (
              <div>
                <p className="text-text-muted mb-1">Signed</p>
                <p className="font-medium">{new Date(proposal.signedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

          {/* Actions */}
          <ProposalActions proposal={proposal} />
        </div>
      </ProposalActionsWrapper>
    </AppLayout>
  )
}
