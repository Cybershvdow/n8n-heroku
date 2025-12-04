'use client'

import { useState } from 'react'
import { X, DollarSign, FileText, Save, Sparkles } from 'lucide-react'

interface QuickEditModalProps {
  isOpen: boolean
  onClose: () => void
  proposal: {
    id: string
    title: string
    customerRate: number
    introduction?: string
    scopeOfWork?: string
    termsConditions?: string
  }
  onSave: (updates: any) => Promise<void>
}

export function QuickEditModal({
  isOpen,
  onClose,
  proposal,
  onSave,
}: QuickEditModalProps) {
  const [activeTab, setActiveTab] = useState<'pricing' | 'content'>('pricing')
  const [saving, setSaving] = useState(false)

  // Form state
  const [customerRate, setCustomerRate] = useState(proposal.customerRate)
  const [title, setTitle] = useState(proposal.title)
  const [introduction, setIntroduction] = useState(proposal.introduction || '')
  const [scopeOfWork, setScopeOfWork] = useState(proposal.scopeOfWork || '')
  const [termsConditions, setTermsConditions] = useState(
    proposal.termsConditions || ''
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        title,
        customerRate,
        introduction,
        scopeOfWork,
        termsConditions,
      })
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const quickMultipliers = [1.35, 1.5, 1.75, 2.0]

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
        <div className="bg-[#1A1F2E] md:rounded-2xl rounded-t-3xl border-t md:border border-[#2D3748] w-full md:max-w-3xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#2D3748]">
            <h2 className="text-xl font-bold text-white">Quick Edit</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2D3748] rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-[#94A3B8]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#2D3748] px-4">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 py-3 px-4 font-medium transition-colors relative ${
                activeTab === 'pricing'
                  ? 'text-[#D4FF00]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>Pricing</span>
              </div>
              {activeTab === 'pricing' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4FF00]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-3 px-4 font-medium transition-colors relative ${
                activeTab === 'content'
                  ? 'text-[#D4FF00]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Content</span>
              </div>
              {activeTab === 'content' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4FF00]" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeTab === 'pricing' ? (
              <div className="space-y-6">
                {/* Customer Rate */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Customer Rate ($/hour)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#94A3B8]">
                      $
                    </span>
                    <input
                      type="number"
                      value={customerRate}
                      onChange={(e) =>
                        setCustomerRate(parseFloat(e.target.value) || 0)
                      }
                      className="w-full pl-12 pr-4 py-4 text-3xl font-bold bg-[#0A0E1A] border-2 border-[#2D3748] rounded-xl text-white focus:border-[#D4FF00] focus:outline-none transition-colors"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Quick Multipliers */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Quick Multipliers
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickMultipliers.map((multiplier) => {
                      const rate = 20 * multiplier // Assuming $20 base wage
                      return (
                        <button
                          key={multiplier}
                          onClick={() => setCustomerRate(rate)}
                          className="p-4 bg-[#0A0E1A] border-2 border-[#2D3748] rounded-xl hover:border-[#D4FF00] transition-colors active:scale-95"
                        >
                          <div className="text-sm text-[#94A3B8]">
                            {multiplier}x
                          </div>
                          <div className="text-lg font-bold text-white mt-1">
                            ${rate}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* AI Suggestion Button */}
                <button className="w-full p-4 bg-gradient-to-r from-[#D4FF00]/20 to-transparent border-2 border-[#D4FF00]/30 rounded-xl hover:border-[#D4FF00] transition-colors group">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D4FF00]" />
                    <span className="font-medium text-white">
                      Get AI Pricing Suggestion
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Proposal Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0E1A] border-2 border-[#2D3748] rounded-xl text-white focus:border-[#D4FF00] focus:outline-none transition-colors"
                    placeholder="Enter proposal title..."
                  />
                </div>

                {/* Introduction */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Introduction
                  </label>
                  <textarea
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0A0E1A] border-2 border-[#2D3748] rounded-xl text-white focus:border-[#D4FF00] focus:outline-none transition-colors resize-none"
                    placeholder="Enter introduction..."
                  />
                </div>

                {/* Scope of Work */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Scope of Work
                  </label>
                  <textarea
                    value={scopeOfWork}
                    onChange={(e) => setScopeOfWork(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 bg-[#0A0E1A] border-2 border-[#2D3748] rounded-xl text-white focus:border-[#D4FF00] focus:outline-none transition-colors resize-none"
                    placeholder="Enter scope of work..."
                  />
                </div>

                {/* Terms & Conditions */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0A0E1A] border-2 border-[#2D3748] rounded-xl text-white focus:border-[#D4FF00] focus:outline-none transition-colors resize-none"
                    placeholder="Enter terms and conditions..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer - Save Button */}
          <div className="p-4 md:p-6 border-t border-[#2D3748] space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 px-6 bg-[#D4FF00] text-[#0A0E1A] font-bold rounded-xl hover:bg-[#B8E600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#0A0E1A] border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-[#2D3748] text-white font-medium hover:bg-[#374151] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
