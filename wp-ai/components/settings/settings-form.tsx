'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, Percent } from 'lucide-react'

interface SettingsFormProps {
  userId: string
  hourlyWage: number
  targetMargin: number
}

export function SettingsForm({ userId, hourlyWage, targetMargin }: SettingsFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    hourlyWage,
    targetMargin: targetMargin * 100, // Convert to percentage
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hourlyWage: formData.hourlyWage,
          targetMargin: formData.targetMargin / 100, // Convert back to decimal
        }),
      })

      if (response.ok) {
        setMessage('Settings saved successfully!')
        router.refresh()
      } else {
        setMessage('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6">
      <h2 className="text-lg font-heading font-semibold mb-4">Pricing Defaults</h2>
      <p className="text-sm text-text-secondary mb-6">
        These values are used as defaults when calculating proposal pricing
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Employee Hourly Wage
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="number"
              value={formData.hourlyWage}
              onChange={(e) => setFormData({ ...formData, hourlyWage: parseFloat(e.target.value) || 0 })}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
              min="0"
              step="0.50"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">/hr</span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Average hourly wage you pay your cleaning staff
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Target Profit Margin
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="number"
              value={formData.targetMargin}
              onChange={(e) => setFormData({ ...formData, targetMargin: parseFloat(e.target.value) || 0 })}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
              min="0"
              max="100"
              step="1"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">%</span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Target profit margin for proposals (recommended: 30%)
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('successfully')
              ? 'bg-accent-green/10 border border-accent-green text-accent-green'
              : 'bg-accent-orange/10 border border-accent-orange text-accent-orange'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-neon-lime text-background font-semibold py-3 rounded-lg hover:bg-neon-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
