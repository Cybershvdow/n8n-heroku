'use client'

import { useState } from 'react'
import {
  Edit3,
  Send,
  Download,
  Share2,
  MoreVertical,
  X,
  FileText,
} from 'lucide-react'

interface QuickActionFABProps {
  proposalId: string
  onEdit: () => void
  onSend: () => void
  onDownloadPDF: () => void
  onShare: () => void
}

export function QuickActionFAB({
  proposalId,
  onEdit,
  onSend,
  onDownloadPDF,
  onShare,
}: QuickActionFABProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const actions = [
    { icon: Edit3, label: 'Edit', onClick: onEdit, color: 'text-[#D4FF00]' },
    { icon: Send, label: 'Send', onClick: onSend, color: 'text-[#0EA5E9]' },
    {
      icon: Download,
      label: 'PDF',
      onClick: onDownloadPDF,
      color: 'text-[#10B981]',
    },
    { icon: Share2, label: 'Share', onClick: onShare, color: 'text-[#8B5CF6]' },
  ]

  const handleActionClick = (action: any) => {
    action.onClick()
    setIsExpanded(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col-reverse items-end gap-3">
      {/* Action Buttons - Appear when expanded */}
      {isExpanded &&
        actions.map((action, index) => (
          <button
            key={action.label}
            onClick={() => handleActionClick(action)}
            className="group flex items-center gap-3 animate-in slide-in-from-bottom fade-in duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="px-3 py-2 bg-[#1A1F2E] border border-[#2D3748] rounded-lg text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {action.label}
            </span>
            <div className="w-12 h-12 bg-[#1A1F2E] border-2 border-[#2D3748] rounded-full flex items-center justify-center shadow-lg hover:border-[#D4FF00] transition-all active:scale-95">
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
          </button>
        ))}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center ${
          isExpanded
            ? 'bg-[#2D3748] border-2 border-[#D4FF00]'
            : 'bg-gradient-to-br from-[#D4FF00] to-[#B8E600] border-2 border-[#D4FF00]/50'
        }`}
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MoreVertical className="w-6 h-6 text-[#0A0E1A]" />
        )}
      </button>

      {/* Backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  )
}
