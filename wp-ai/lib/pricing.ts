import { PricingCalculation } from './types'
import { WEEKS_PER_MONTH } from './constants'

export function calculatePricing(
  employeeHourlyWage: number,
  totalDailyMinutes: number,
  daysPerWeek: number,
  customerRate: number
): PricingCalculation {
  const totalHoursPerDay = totalDailyMinutes / 60
  const totalHoursPerMonth = totalHoursPerDay * daysPerWeek * WEEKS_PER_MONTH

  const laborCost = employeeHourlyWage * totalHoursPerMonth
  const monthlyRevenue = customerRate * totalHoursPerMonth

  const profit = monthlyRevenue - laborCost
  const profitMargin = monthlyRevenue > 0 ? (profit / monthlyRevenue) * 100 : 0

  return {
    employeeHourlyWage,
    totalDailyMinutes,
    daysPerWeek,
    customerRate,
    totalHoursPerDay,
    totalHoursPerMonth,
    laborCost,
    monthlyRevenue,
    profit,
    profitMargin,
  }
}

export function suggestCustomerRate(
  employeeHourlyWage: number,
  targetMargin: number = 0.30
): number {
  // Calculate rate needed to achieve target margin
  // Formula: customerRate = laborCost / (1 - targetMargin) / hours
  // Simplified: customerRate = employeeWage / (1 - targetMargin)
  return employeeHourlyWage / (1 - targetMargin)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatHours(hours: number): string {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (minutes === 0) {
    return `${wholeHours}h`
  }

  return `${wholeHours}h ${minutes}m`
}
