import { z } from 'zod';

// Common password rules
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '123456789', 'qwerty123', 'letmein',
  'welcome', 'admin123', 'iloveyou', 'sunshine', 'princess',
  'football', 'monkey123', 'shadow123', 'master123', 'dragon123',
]);

const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be less than 128 characters')
  .refine(
    (val) => !COMMON_PASSWORDS.has(val.toLowerCase()),
    'This password is too common. Please choose a stronger password.'
  )
  .refine(
    (val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val),
    'Password must contain uppercase, lowercase, and numbers'
  );

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100),
  organizationName: z.string().min(1, 'Organization name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

// Load schemas
export const loadFilterSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'DENIED']).optional(),
  source: z.enum(['EMAIL', 'CALL', 'MANUAL']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  broker: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const loadDecisionSchema = z.object({
  decision: z.enum(['ACCEPTED', 'DENIED']),
  reason: z.string().max(500).optional(),
});

// Email integration schemas
export const emailConnectSchema = z.object({
  provider: z.enum(['GMAIL', 'O365']),
});

// GPS schemas
export const tripStartSchema = z.object({
  purpose: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  startLatitude: z.number().min(-90).max(90),
  startLongitude: z.number().min(-180).max(180),
});

export const tripEndSchema = z.object({
  endLatitude: z.number().min(-90).max(90),
  endLongitude: z.number().min(-180).max(180),
  notes: z.string().max(500).optional(),
});

export const routePointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  accuracy: z.number().min(0).optional(),
});

export const gpsConsentSchema = z.object({
  consent: z.boolean(),
});

// Export schemas
export const exportDateRangeSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const mileageExportSchema = exportDateRangeSchema.extend({
  driverId: z.string().cuid().optional(),
});

// Organization schemas
export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  mode: z.enum(['PERSONAL', 'FLEET']).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1).max(100),
  role: z.enum(['DISPATCHER', 'VIEWER', 'DRIVER']),
});

export const updateRoleSchema = z.object({
  role: z.enum(['OWNER', 'DISPATCHER', 'VIEWER', 'DRIVER']),
});

// Notification schemas
export const notificationFilterSchema = z.object({
  isRead: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

// AI extraction output schema (strict JSON validation)
export const aiExtractionOutputSchema = z.object({
  isLoadRequest: z.boolean(),
  fields: z.object({
    brokerCarrierName: z.string().optional(),
    brokerCarrierEmail: z.string().email().optional().or(z.literal('')),
    brokerCarrierPhone: z.string().optional(),
    pickupLocation: z.string().optional(),
    pickupAddress: z.string().optional(),
    pickupCity: z.string().optional(),
    pickupState: z.string().optional(),
    pickupZip: z.string().optional(),
    pickupDateTime: z.string().optional(),
    dropoffLocation: z.string().optional(),
    dropoffAddress: z.string().optional(),
    dropoffCity: z.string().optional(),
    dropoffState: z.string().optional(),
    dropoffZip: z.string().optional(),
    dropoffDateTime: z.string().optional(),
    rate: z.number().optional(),
    commodity: z.string().optional(),
    weight: z.string().optional(),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
  }),
  summary: z.string(),
  confidenceScore: z.number().min(0).max(1),
  missingFields: z.array(z.string()),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LoadFilterInput = z.infer<typeof loadFilterSchema>;
export type LoadDecisionInput = z.infer<typeof loadDecisionSchema>;
export type TripStartInput = z.infer<typeof tripStartSchema>;
export type TripEndInput = z.infer<typeof tripEndSchema>;
export type RoutePointInput = z.infer<typeof routePointSchema>;
export type AIExtractionOutput = z.infer<typeof aiExtractionOutputSchema>;
