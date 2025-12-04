import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/pricing'
import { FileText, Building2, Calendar, DollarSign, Clock, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    publicUrl: string
  }
}

export default async function PublicProposalPage({ params }: Props) {
  // Increment view count and get proposal
  const proposal = await prisma.proposal.findUnique({
    where: { publicUrl: params.publicUrl },
    include: {
      client: true,
      user: true,
      walkthrough: {
        include: {
          rooms: true,
          photos: true,
        },
      },
    },
  })

  if (!proposal) {
    notFound()
  }

  // Update view count and viewed timestamp
  await prisma.proposal.update({
    where: { id: proposal.id },
    data: {
      viewCount: { increment: 1 },
      viewedAt: proposal.viewedAt || new Date(),
    },
  })

  // Track activity
  await prisma.proposalActivity.create({
    data: {
      proposalId: proposal.id,
      activityType: 'viewed',
      metadata: {
        viewedAt: new Date().toISOString(),
        userAgent: 'client',
      },
    },
  })

  const totalRooms = proposal.walkthrough.rooms.length
  const totalMinutes = proposal.walkthrough.rooms.reduce(
    (sum, room) => sum + room.estimatedMinutes,
    0
  )

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <div className="bg-[#1A1F2E] border-b border-[#2D3748]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-[#D4FF00]" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {proposal.user.company || proposal.user.name}
            </h1>
          </div>
          <p className="text-[#94A3B8]">Professional Janitorial Services Proposal</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Proposal Title */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">{proposal.title}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{proposal.client.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="bg-gradient-to-br from-[#D4FF00]/10 to-transparent border border-[#D4FF00]/30 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Monthly Investment</h3>
            {proposal.status === 'won' && (
              <div className="flex items-center gap-2 text-[#10B981]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Accepted</span>
              </div>
            )}
          </div>

          <div className="text-center mb-8">
            <div className="text-5xl md:text-6xl font-bold text-[#D4FF00] mb-2">
              {formatCurrency(proposal.monthlyPrice)}
            </div>
            <div className="text-[#94A3B8]">per month</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {proposal.totalMonthlyHours.toFixed(0)}
              </div>
              <div className="text-sm text-[#94A3B8]">Hours/Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalRooms}</div>
              <div className="text-sm text-[#94A3B8]">Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {proposal.walkthrough.daysPerWeek}
              </div>
              <div className="text-sm text-[#94A3B8]">Days/Week</div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        {proposal.introduction && (
          <div className="bg-[#1A1F2E]/80 backdrop-blur-sm border border-[#2D3748] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Introduction</h3>
            <p className="text-[#94A3B8] whitespace-pre-wrap leading-relaxed">
              {proposal.introduction}
            </p>
          </div>
        )}

        {/* Scope of Work */}
        {proposal.scopeOfWork && (
          <div className="bg-[#1A1F2E]/80 backdrop-blur-sm border border-[#2D3748] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Scope of Work</h3>
            <p className="text-[#94A3B8] whitespace-pre-wrap leading-relaxed">
              {proposal.scopeOfWork}
            </p>
          </div>
        )}

        {/* Areas Included */}
        <div className="bg-[#1A1F2E]/80 backdrop-blur-sm border border-[#2D3748] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Areas Included</h3>
          <div className="space-y-3">
            {proposal.walkthrough.rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-3 bg-[#0A0E1A]/50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-white">{room.name}</div>
                  <div className="text-sm text-[#94A3B8] capitalize">
                    {room.roomType.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#94A3B8]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{room.estimatedMinutes} min</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#2D3748]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94A3B8]">Total daily time</span>
              <span className="font-medium text-white">{totalMinutes} minutes</span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        {proposal.termsConditions && (
          <div className="bg-[#1A1F2E]/80 backdrop-blur-sm border border-[#2D3748] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Terms & Conditions</h3>
            <p className="text-[#94A3B8] whitespace-pre-wrap leading-relaxed text-sm">
              {proposal.termsConditions}
            </p>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-[#1A1F2E]/80 backdrop-blur-sm border border-[#2D3748] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Questions?</h3>
          <div className="space-y-2 text-[#94A3B8]">
            <p>Contact us at:</p>
            <p className="font-medium text-white">{proposal.user.email}</p>
            {proposal.user.phone && (
              <p className="font-medium text-white">{proposal.user.phone}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-[#64748B] py-8">
          <p>This proposal is valid for 30 days from the date issued.</p>
          <p className="mt-2">
            Powered by{' '}
            <span className="text-[#D4FF00] font-medium">W&P AI</span>
          </p>
        </div>
      </div>
    </div>
  )
}
