'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PricingCalculator } from './pricing-calculator'
import { calculatePricing } from '@/lib/pricing'
import { FileText, ArrowRight } from 'lucide-react'

interface PricingActionsProps {
  walkthroughId: string
  clientId: string
  totalDailyMinutes: number
  daysPerWeek: number
  employeeWage: number
}

export function PricingActions({
  walkthroughId,
  clientId,
  totalDailyMinutes,
  daysPerWeek,
  employeeWage,
}: PricingActionsProps) {
  const router = useRouter()
  const [customerRate, setCustomerRate] = useState(employeeWage * 2)
  const [generating, setGenerating] = useState(false)

  const handleGenerateProposal = async () => {
    setGenerating(true)

    try {
      const pricing = calculatePricing(employeeWage, totalDailyMinutes, daysPerWeek, customerRate)

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walkthroughId,
          clientId,
          customerRate,
          totalMonthlyHours: pricing.totalHoursPerMonth,
          laborCost: pricing.laborCost,
          monthlyPrice: pricing.monthlyRevenue,
          profitMargin: pricing.profitMargin,
        }),
      })

      if (response.ok) {
        const proposal = await response.json()
        router.push(`/proposals/${proposal.id}`)
      } else {
        alert('Failed to generate proposal')
      }
    } catch (error) {
      console.error('Error generating proposal:', error)
      alert('Failed to generate proposal')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <PricingCalculator
        totalDailyMinutes={totalDailyMinutes}
        daysPerWeek={daysPerWeek}
        employeeWage={employeeWage}
        onRateChange={setCustomerRate}
      />

      <button
        onClick={handleGenerateProposal}
        disabled={generating}
        className="w-full bg-neon-lime text-background font-semibold py-4 rounded-xl hover:bg-neon-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FileText className="w-5 h-5" />
        {generating ? 'Generating Proposal...' : 'Generate Proposal'}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )
}
