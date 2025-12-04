'use client'

import { useState, useEffect } from 'react'
import { calculatePricing, formatCurrency, formatHours, suggestCustomerRate } from '@/lib/pricing'
import { RATE_MULTIPLIERS } from '@/lib/constants'
import { TrendingUp, DollarSign, Clock, Percent } from 'lucide-react'

interface PricingCalculatorProps {
  totalDailyMinutes: number
  daysPerWeek: number
  employeeWage: number
  onRateChange: (rate: number) => void
}

export function PricingCalculator({
  totalDailyMinutes,
  daysPerWeek,
  employeeWage,
  onRateChange,
}: PricingCalculatorProps) {
  const [customerRate, setCustomerRate] = useState(employeeWage * 2)

  useEffect(() => {
    onRateChange(customerRate)
  }, [customerRate, onRateChange])

  const pricing = calculatePricing(employeeWage, totalDailyMinutes, daysPerWeek, customerRate)

  const suggestedRate = suggestCustomerRate(employeeWage, 0.30)

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-accent-blue" />
            <span className="text-text-muted text-sm">Monthly Hours</span>
          </div>
          <p className="text-2xl font-bold">{formatHours(pricing.totalHoursPerMonth)}</p>
          <p className="text-xs text-text-muted mt-1">
            {formatHours(pricing.totalHoursPerDay)} × {daysPerWeek} days/wk
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-accent-orange" />
            <span className="text-text-muted text-sm">Labor Cost</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(pricing.laborCost)}</p>
          <p className="text-xs text-text-muted mt-1">${employeeWage}/hr employee wage</p>
        </div>
      </div>

      {/* Customer Rate Slider */}
      <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Customer Rate ($/hour)</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={customerRate}
              onChange={(e) => setCustomerRate(parseFloat(e.target.value) || 0)}
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent text-2xl font-bold"
              min={employeeWage}
              step="0.5"
            />
            <span className="text-text-muted">/hr</span>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="range"
            value={customerRate}
            onChange={(e) => setCustomerRate(parseFloat(e.target.value))}
            min={employeeWage}
            max={employeeWage * 3}
            step="0.5"
            className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-neon-lime"
          />
          <div className="flex justify-between text-xs text-text-muted mt-2">
            <span>${employeeWage}/hr</span>
            <span>${(employeeWage * 3).toFixed(0)}/hr</span>
          </div>
        </div>

        {/* Quick Rate Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {RATE_MULTIPLIERS.map((multiplier) => (
            <button
              key={multiplier.value}
              onClick={() => setCustomerRate(employeeWage * multiplier.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                Math.abs(customerRate - employeeWage * multiplier.value) < 0.1
                  ? 'border-neon-lime bg-neon-lime/10 text-neon-lime'
                  : 'border-border bg-card hover:border-border/50'
              }`}
            >
              {multiplier.label}
            </button>
          ))}
        </div>

        {customerRate < suggestedRate && (
          <div className="mt-4 bg-accent-orange/10 border border-accent-orange rounded-lg p-3">
            <p className="text-sm text-accent-orange">
              ⚠️ Below suggested rate of ${suggestedRate.toFixed(2)}/hr for 30% margin
            </p>
          </div>
        )}
      </div>

      {/* Pricing Summary */}
      <div className="bg-gradient-to-br from-neon-lime/20 to-accent-green/20 border border-neon-lime rounded-xl p-6">
        <h3 className="text-lg font-heading font-semibold mb-4">Monthly Pricing Summary</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Monthly Revenue</span>
            <span className="text-2xl font-bold text-neon-lime">
              {formatCurrency(pricing.monthlyRevenue)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">- Labor Cost</span>
            <span className="text-text-muted">{formatCurrency(pricing.laborCost)}</span>
          </div>

          <div className="h-px bg-border"></div>

          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Monthly Profit</span>
            <span className="text-xl font-bold text-accent-green">
              {formatCurrency(pricing.profit)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-accent-purple" />
              <span className="text-text-secondary">Profit Margin</span>
            </div>
            <span
              className={`text-xl font-bold ${
                pricing.profitMargin >= 30
                  ? 'text-accent-green'
                  : pricing.profitMargin >= 20
                  ? 'text-accent-blue'
                  : 'text-accent-orange'
              }`}
            >
              {pricing.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-card/50 border border-border rounded-xl p-4">
        <h4 className="text-sm font-semibold mb-3 text-text-secondary">Calculation Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Hours per day</span>
            <span>{formatHours(pricing.totalHoursPerDay)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Days per week</span>
            <span>{daysPerWeek} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Weeks per month</span>
            <span>4.33 weeks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Total monthly hours</span>
            <span className="font-semibold">{formatHours(pricing.totalHoursPerMonth)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
