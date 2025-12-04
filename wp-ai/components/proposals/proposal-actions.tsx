'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Send, CheckCircle, XCircle, Edit, MoreVertical } from 'lucide-react'
import { PROPOSAL_STATUSES } from '@/lib/constants'

interface ProposalActionsProps {
  proposal: {
    id: string
    status: string
    walkthroughId: string
  }
}

export function ProposalActions({ proposal }: ProposalActionsProps) {
  const router = useRouter()
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
        setShowStatusMenu(false)
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDuplicate = async () => {
    setDuplicating(true)
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/duplicate`, {
        method: 'POST',
      })

      if (response.ok) {
        const newProposal = await response.json()
        router.push(`/proposals/${newProposal.id}`)
      } else {
        alert('Failed to duplicate proposal')
      }
    } catch (error) {
      console.error('Error duplicating proposal:', error)
      alert('Failed to duplicate proposal')
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Status Change */}
      {proposal.status === 'draft' && (
        <button
          onClick={() => handleStatusChange('sent')}
          disabled={updating}
          className="w-full bg-neon-lime text-background font-semibold py-3 rounded-lg hover:bg-neon-lime/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {updating ? 'Sending...' : 'Mark as Sent'}
        </button>
      )}

      {proposal.status === 'sent' && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleStatusChange('won')}
            disabled={updating}
            className="bg-accent-green text-white font-semibold py-3 rounded-lg hover:bg-accent-green/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Won
          </button>
          <button
            onClick={() => handleStatusChange('lost')}
            disabled={updating}
            className="bg-accent-orange text-white font-semibold py-3 rounded-lg hover:bg-accent-orange/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Lost
          </button>
        </div>
      )}

      {/* Duplicate */}
      <button
        onClick={handleDuplicate}
        disabled={duplicating}
        className="w-full bg-card border border-border font-semibold py-3 rounded-lg hover:bg-card/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Copy className="w-5 h-5" />
        {duplicating ? 'Duplicating...' : 'Duplicate Proposal'}
      </button>

      {/* Status Menu */}
      <div className="relative">
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className="w-full bg-card border border-border font-semibold py-3 rounded-lg hover:bg-card/80 transition-colors flex items-center justify-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Change Status
        </button>

        {showStatusMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowStatusMenu(false)}
            ></div>
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-20">
              {PROPOSAL_STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  disabled={proposal.status === status.value || updating}
                  className={`w-full px-4 py-3 text-left hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    proposal.status === status.value ? 'bg-background' : ''
                  }`}
                >
                  <span className={status.color}>{status.label}</span>
                  {proposal.status === status.value && (
                    <span className="ml-2 text-xs text-text-muted">(current)</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
