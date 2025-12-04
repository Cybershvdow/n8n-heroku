'use client'

import { useState, useEffect } from 'react'
import { X, FileText, Building2, Check, ChevronRight } from 'lucide-react'

interface Template {
  id: string
  name: string
  description?: string
  category?: string
  facilityType?: string
}

interface TemplateSelectorProps {
  type: 'proposal' | 'walkthrough' | 'content'
  isOpen: boolean
  onClose: () => void
  onSelect: (template: Template) => void
  category?: string
}

export function TemplateSelector({
  type,
  isOpen,
  onClose,
  onSelect,
  category,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
    }
  }, [isOpen, type, category])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const endpoint =
        type === 'proposal'
          ? '/api/templates/proposal'
          : type === 'walkthrough'
            ? '/api/templates/walkthrough'
            : '/api/templates/content'

      const params = new URLSearchParams({ includePublic: 'true' })
      if (category) params.append('category', category)

      const response = await fetch(`${endpoint}?${params}`)
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (template: Template) => {
    setSelectedId(template.id)
    // Small delay for visual feedback
    setTimeout(() => {
      onSelect(template)
      onClose()
      setSelectedId(null)
    }, 200)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet (Mobile) / Modal (Desktop) */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
        <div className="bg-[#1A1F2E] md:rounded-2xl rounded-t-3xl border-t md:border border-[#2D3748] w-full md:max-w-2xl max-h-[85vh] md:max-h-[80vh] flex flex-col animate-in slide-in-from-bottom md:slide-in-from-bottom-0 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2D3748]">
            <div>
              <h2 className="text-xl font-bold text-white">
                Choose {type === 'proposal' ? 'Proposal' : type === 'walkthrough' ? 'Facility' : 'Content'} Template
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Start with a pre-built template
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2D3748] rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-[#94A3B8]" />
            </button>
          </div>

          {/* Templates List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
                <p className="text-[#94A3B8]">No templates available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelect(template)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-98 ${
                      selectedId === template.id
                        ? 'border-[#D4FF00] bg-[#D4FF00]/10'
                        : 'border-[#2D3748] bg-[#0A0E1A]/50 hover:border-[#D4FF00]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg mt-1 ${
                          selectedId === template.id
                            ? 'bg-[#D4FF00]'
                            : 'bg-[#2D3748]'
                        }`}
                      >
                        {type === 'walkthrough' ? (
                          <Building2
                            className={`w-5 h-5 ${
                              selectedId === template.id
                                ? 'text-[#0A0E1A]'
                                : 'text-[#94A3B8]'
                            }`}
                          />
                        ) : (
                          <FileText
                            className={`w-5 h-5 ${
                              selectedId === template.id
                                ? 'text-[#0A0E1A]'
                                : 'text-[#94A3B8]'
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white truncate">
                            {template.name}
                          </h3>
                          {template.category && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-[#2D3748] text-[#94A3B8] shrink-0">
                              {template.category}
                            </span>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-[#94A3B8] mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                        {template.facilityType && (
                          <p className="text-xs text-[#64748B] mt-2">
                            {template.facilityType}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {selectedId === template.id ? (
                          <div className="w-6 h-6 rounded-full bg-[#D4FF00] flex items-center justify-center">
                            <Check className="w-4 h-4 text-[#0A0E1A]" />
                          </div>
                        ) : (
                          <ChevronRight className="w-6 h-6 text-[#64748B]" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Quick Actions */}
          <div className="p-4 border-t border-[#2D3748]">
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
