// Room types and their default cleaning times (in minutes)
export const ROOM_DEFAULTS = {
  kitchen: 30,
  restroom: 30,
  office_small: 15,
  office_medium: 25,
  office_large: 40,
  lobby: 45,
  conference: 20,
  hallway: 10,
  break_room: 25,
  storage: 15,
  warehouse: 60,
  reception: 20,
  server_room: 20,
  custom: 20,
} as const

export const ROOM_TYPES = [
  { value: 'kitchen', label: 'Kitchen', icon: '🍽️' },
  { value: 'restroom', label: 'Restroom', icon: '🚻' },
  { value: 'office_small', label: 'Office (Small)', icon: '🏢' },
  { value: 'office_medium', label: 'Office (Medium)', icon: '🏢' },
  { value: 'office_large', label: 'Office (Large)', icon: '🏢' },
  { value: 'lobby', label: 'Lobby', icon: '🚪' },
  { value: 'conference', label: 'Conference Room', icon: '📊' },
  { value: 'hallway', label: 'Hallway', icon: '🚶' },
  { value: 'break_room', label: 'Break Room', icon: '☕' },
  { value: 'storage', label: 'Storage', icon: '📦' },
  { value: 'warehouse', label: 'Warehouse', icon: '🏭' },
  { value: 'reception', label: 'Reception', icon: '💼' },
  { value: 'server_room', label: 'Server Room', icon: '🖥️' },
  { value: 'custom', label: 'Custom', icon: '⚙️' },
] as const

export const FACILITY_TYPES = [
  'Office Building',
  'Medical Facility',
  'Retail Store',
  'Warehouse',
  'School',
  'Restaurant',
  'Gym/Fitness Center',
  'Hotel',
  'Other',
] as const

export const SERVICE_FREQUENCIES = [
  { value: 'daily', label: 'Daily', daysPerWeek: 5 },
  { value: 'bi_weekly', label: 'Bi-Weekly (2x/week)', daysPerWeek: 2 },
  { value: 'tri_weekly', label: 'Tri-Weekly (3x/week)', daysPerWeek: 3 },
  { value: 'weekly', label: 'Weekly', daysPerWeek: 1 },
  { value: 'custom', label: 'Custom', daysPerWeek: 5 },
] as const

export const PROPOSAL_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'text-text-muted' },
  { value: 'sent', label: 'Sent', color: 'text-accent-blue' },
  { value: 'viewed', label: 'Viewed', color: 'text-accent-purple' },
  { value: 'won', label: 'Won', color: 'text-accent-green' },
  { value: 'lost', label: 'Lost', color: 'text-accent-orange' },
] as const

// Pricing calculation constants
export const WEEKS_PER_MONTH = 4.33
export const DEFAULT_HOURLY_WAGE = 20.00
export const DEFAULT_TARGET_MARGIN = 0.30

// Suggested customer rate multipliers
export const RATE_MULTIPLIERS = [
  { label: '2.0x', value: 2.0 },
  { label: '1.75x', value: 1.75 },
  { label: '1.5x', value: 1.5 },
  { label: '1.35x', value: 1.35 },
] as const
