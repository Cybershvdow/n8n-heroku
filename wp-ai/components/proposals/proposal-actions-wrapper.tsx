'use client'

import { useState } from 'react'
import { QuickEditModal } from '@/components/proposals/quick-edit-modal'
import { QuickActionFAB } from '@/components/proposals/quick-action-fab'
import { useRouter } from 'next/navigation'

interface ProposalActionsWrapperProps {
  proposal: any
  children: React.ReactNode
}

export function ProposalActionsWrapper({
  proposal,
  children,
}: ProposalActionsWrapperProps) {
  const router = useRouter()
  const [showQuickEdit, setShowQuickEdit] = useState(false)

  const handleSave = async (updates: any) => {
    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update proposal')

      router.refresh()
    } catch (error) {
      console.error('Error updating proposal:', error)
      throw error
    }
  }

  const handleSend = async () => {
    const email = proposal.client.email || prompt('Enter client email:')
    if (!email) return

    try {
      const response = await fetch(`/api/proposals/${proposal.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) throw new Error('Failed to send proposal')

      alert('Proposal sent successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error sending proposal:', error)
      alert('Failed to send proposal')
    }
  }

  const handleDownloadPDF = () => {
    window.open(`/api/proposals/${proposal.id}/pdf`, '_blank')
  }

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/share`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to generate share link')

      const { fullUrl } = await response.json()

      // Copy to clipboard
      await navigator.clipboard.writeText(fullUrl)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('Error generating share link:', error)
      alert('Failed to generate share link')
    }
  }

  return (
    <>
      {children}

      {/* Quick Edit Modal */}
      <QuickEditModal
        isOpen={showQuickEdit}
        onClose={() => setShowQuickEdit(false)}
        proposal={proposal}
        onSave={handleSave}
      />

      {/* Floating Action Button */}
      <QuickActionFAB
        proposalId={proposal.id}
        onEdit={() => setShowQuickEdit(true)}
        onSend={handleSend}
        onDownloadPDF={handleDownloadPDF}
        onShare={handleShare}
      />
    </>
  )
}
