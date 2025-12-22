// Core type definitions for LoadDesk

export type OrganizationMode = 'PERSONAL' | 'FLEET';

export type Role = 'OWNER' | 'DISPATCHER' | 'VIEWER' | 'DRIVER';

export type LoadStatus = 'PENDING' | 'ACCEPTED' | 'DENIED';

export type LoadSource = 'EMAIL' | 'CALL' | 'MANUAL';

export type DecisionType = 'ACCEPTED' | 'DENIED';

export type EmailProviderType = 'GMAIL' | 'O365' | 'IMAP_READY';

export type EmailIntegrationStatus = 'ACTIVE' | 'DISCONNECTED' | 'TOKEN_EXPIRED' | 'ERROR';

export type EmailClassification = 'LOAD_REQUEST' | 'NOT_LOAD' | 'UNCERTAIN';

export type TripStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type NotificationType =
  | 'LOAD_CREATED'
  | 'LOAD_MISSING_FIELDS'
  | 'LOAD_LOW_CONFIDENCE'
  | 'EMAIL_INTEGRATION_ERROR'
  | 'EMAIL_DISCONNECTED'
  | 'EMAIL_TOKEN_EXPIRED'
  | 'REPLY_SEND_FAILED'
  | 'EXPORT_COMPLETED'
  | 'TRIP_ENDED';

// Session types
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  organizationId: string;
  role: Role;
}

export interface SessionData {
  user: SessionUser;
  createdAt: number;
  expiresAt: number;
}

// API response types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Load types
export interface LoadSummary {
  id: string;
  source: LoadSource;
  status: LoadStatus;
  brokerCarrierName: string | null;
  pickupLocation: string | null;
  pickupDateTime: Date | null;
  dropoffLocation: string | null;
  dropoffDateTime: Date | null;
  rate: number | null;
  commodity: string | null;
  referenceNumber: string | null;
  aiSummary: string | null;
  confidenceScore: number | null;
  missingFields: string[];
  createdAt: Date;
}

export interface LoadDetail extends LoadSummary {
  brokerCarrierEmail: string | null;
  brokerCarrierPhone: string | null;
  pickupAddress: string | null;
  pickupCity: string | null;
  pickupState: string | null;
  pickupZip: string | null;
  dropoffAddress: string | null;
  dropoffCity: string | null;
  dropoffState: string | null;
  dropoffZip: string | null;
  weight: string | null;
  notes: string | null;
  extractionModel: string | null;
  emailMessage?: {
    id: string;
    fromAddress: string;
    fromName: string | null;
    subject: string;
    receivedAt: Date;
    bodyPreview: string | null;
  };
  decisions: LoadDecisionRecord[];
}

export interface LoadDecisionRecord {
  id: string;
  decision: DecisionType;
  decidedBy: {
    id: string;
    name: string | null;
    email: string;
  };
  reason: string | null;
  createdAt: Date;
}

// AI extraction types
export interface ExtractedLoadFields {
  brokerCarrierName?: string;
  brokerCarrierEmail?: string;
  brokerCarrierPhone?: string;
  pickupLocation?: string;
  pickupAddress?: string;
  pickupCity?: string;
  pickupState?: string;
  pickupZip?: string;
  pickupDateTime?: string;
  dropoffLocation?: string;
  dropoffAddress?: string;
  dropoffCity?: string;
  dropoffState?: string;
  dropoffZip?: string;
  dropoffDateTime?: string;
  rate?: number;
  commodity?: string;
  weight?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface AIExtractionResult {
  fields: ExtractedLoadFields;
  summary: string;
  confidenceScore: number;
  missingFields: string[];
  isLoadRequest: boolean;
}

// Trip types
export interface TripSummary {
  id: string;
  status: TripStatus;
  startedAt: Date;
  endedAt: Date | null;
  durationMinutes: number | null;
  totalMiles: number | null;
  purpose: string | null;
  notes: string | null;
}

export interface DriverSummary {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  gpsConsentGiven: boolean;
  hasActiveTrip: boolean;
  todayMiles: number;
}

// Notification types
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
}

// Email provider adapter interface
export interface EmailProviderAdapter {
  connect(authCode: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }>;
  fetchMessages(accessToken: string, since?: Date): Promise<IngestedEmail[]>;
  sendReply(accessToken: string, options: SendReplyOptions): Promise<{ messageId: string }>;
  disconnect(accessToken: string): Promise<void>;
}

export interface IngestedEmail {
  providerMessageId: string;
  threadId?: string;
  fromAddress: string;
  fromName?: string;
  subject: string;
  body: string;
  snippet?: string;
  receivedAt: Date;
}

export interface SendReplyOptions {
  toAddress: string;
  toName?: string;
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
}
