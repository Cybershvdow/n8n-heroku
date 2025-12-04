'use client'

import { useState } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import { TemplateSelector } from './template-selector'

interface UseTemplateButtonProps {
  type: 'proposal' | 'walkthrough'
  onTemplateSelect: (template: any) => void
  variant?: 'primary' | 'secondary'
  className?: string
}

export function UseTemplateButton({
  type,
  onTemplateSelect,
  variant = 'secondary',
  className = '',
}: UseTemplateButtonProps) {
  const [showSelector, setShowSelector] = useState(false)

  const handleSelect = async (template: any) => {
    try {
      // Fetch full template details
      const endpoint =
        type === 'proposal'
          ? `/api/templates/proposal/${template.id}`
          : `/api/templates/walkthrough/${template.id}`

      const response = await fetch(endpoint)
      const fullTemplate = await response.json()

      onTemplateSelect(fullTemplate)
    } catch (error) {
      console.error('Error loading template:', error)
    }
  }

  const buttonClasses =
    variant === 'primary'
      ? 'w-full py-4 px-6 bg-gradient-to-r from-[#D4FF00] to-[#B8E600] text-[#0A0E1A] font-bold rounded-xl hover:from-[#B8E600] hover:to-[#D4FF00] transition-all active:scale-98 shadow-lg shadow-[#D4FF00]/20'
      : 'w-full py-3 px-4 bg-[#1A1F2E] border-2 border-[#2D3748] text-white font-medium rounded-xl hover:border-[#D4FF00] transition-colors active:scale-98'

  return (
    <>
      <button
        onClick={() => setShowSelector(true)}
        className={`${buttonClasses} ${className}`}
      >
        <div className="flex items-center justify-center gap-2">
          {variant === 'primary' ? (
            <Sparkles className="w-5 h-5" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
          <span>Use Template</span>
        </div>
      </button>

      <TemplateSelector
        type={type}
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={handleSelect}
      />
    </>
  )
}
