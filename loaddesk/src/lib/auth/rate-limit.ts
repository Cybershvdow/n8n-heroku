import { headers } from 'next/headers';

// In-memory store for development (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit for an identifier (IP or user ID).
 */
export async function checkRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[limitType];
  const key = `${limitType}:${identifier}`;
  const now = Date.now();

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  let entry = rateLimitStore.get(key);

  // Reset if window has passed
  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }

  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    retryAfter: allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Get client IP address from headers.
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // Check common proxy headers
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headersList.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return 'unknown';
}

/**
 * Rate limit middleware helper.
 * Returns response headers if allowed, throws if rate limited.
 */
export async function rateLimit(
  limitType: keyof typeof RATE_LIMITS,
  identifier?: string
): Promise<Record<string, string>> {
  const id = identifier ?? await getClientIP();
  const result = await checkRateLimit(id, limitType);

  const responseHeaders: Record<string, string> = {
    'X-RateLimit-Limit': String(RATE_LIMITS[limitType].maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };

  if (!result.allowed) {
    responseHeaders['Retry-After'] = String(result.retryAfter);
    throw new RateLimitError(result.retryAfter ?? 60);
  }

  return responseHeaders;
}

export class RateLimitError extends Error {
  public retryAfter: number;

  constructor(retryAfter: number) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Track failed login attempts for account lockout.
 */
const loginAttemptStore = new Map<string, { count: number; lockedUntil: number }>();

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function trackLoginAttempt(
  email: string,
  success: boolean
): Promise<{ locked: boolean; attemptsRemaining: number }> {
  const key = `login:${email.toLowerCase()}`;
  const now = Date.now();

  let entry = loginAttemptStore.get(key);

  // Check if currently locked
  if (entry && entry.lockedUntil > now) {
    return {
      locked: true,
      attemptsRemaining: 0,
    };
  }

  // Reset if lock has expired or on successful login
  if (success || !entry || entry.lockedUntil <= now) {
    if (success) {
      loginAttemptStore.delete(key);
    }
    return {
      locked: false,
      attemptsRemaining: LOCKOUT_THRESHOLD,
    };
  }

  // Increment failed attempts
  entry.count++;

  if (entry.count >= LOCKOUT_THRESHOLD) {
    entry.lockedUntil = now + LOCKOUT_DURATION;
    loginAttemptStore.set(key, entry);
    return {
      locked: true,
      attemptsRemaining: 0,
    };
  }

  loginAttemptStore.set(key, entry);
  return {
    locked: false,
    attemptsRemaining: LOCKOUT_THRESHOLD - entry.count,
  };
}

export async function initLoginAttemptTracking(email: string): Promise<void> {
  const key = `login:${email.toLowerCase()}`;
  if (!loginAttemptStore.has(key)) {
    loginAttemptStore.set(key, { count: 0, lockedUntil: 0 });
  }
}
