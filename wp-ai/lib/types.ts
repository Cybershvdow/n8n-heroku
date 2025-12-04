import { ROOM_DEFAULTS } from './constants'

export type RoomType = keyof typeof ROOM_DEFAULTS

export interface PricingCalculation {
  employeeHourlyWage: number
  totalDailyMinutes: number
  daysPerWeek: number
  customerRate: number
  totalHoursPerDay: number
  totalHoursPerMonth: number
  laborCost: number
  monthlyRevenue: number
  profit: number
  profitMargin: number
}

export interface RoomData {
  id?: string
  name: string
  roomType: string
  squareFeet?: number
  floorType?: string
  estimatedMinutes: number
  specialNotes?: string
  photos?: string[]
}

export interface WalkthroughData {
  id?: string
  clientId: string
  propertyAddress: string
  totalSqft?: number
  facilityType?: string
  serviceFrequency: string
  daysPerWeek: number
  status: string
  rooms: RoomData[]
}
