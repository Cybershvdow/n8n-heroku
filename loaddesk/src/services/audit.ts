import { prisma } from '@/lib/db/client';
import type { AuditAction } from '@prisma/client';

interface CreateAuditLogParams {
  organizationId: string;
  userId?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry.
 * Automatically redacts sensitive PII from metadata.
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  const { metadata, ...rest } = params;

  // Redact sensitive fields from metadata
  const redactedMetadata = metadata ? redactPII(metadata) : undefined;

  try {
    await prisma.auditLog.create({
      data: {
        ...rest,
        metadata: redactedMetadata,
      },
    });
  } catch (error) {
    // Log but don't throw - audit logging should not break operations
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Redact PII from metadata object.
 */
function redactPII(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'ssn',
    'socialSecurityNumber',
    'creditCard',
    'cardNumber',
  ];

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      redacted[key] = redactPII(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Query audit logs for an organization.
 */
export async function getAuditLogs(
  organizationId: string,
  options: {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    resourceId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  } = {}
) {
  const { page = 1, limit = 50, ...filters } = options;

  const where = {
    organizationId,
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.action && { action: filters.action }),
    ...(filters.resourceType && { resourceType: filters.resourceType }),
    ...(filters.resourceId && { resourceId: filters.resourceId }),
    ...(filters.dateFrom || filters.dateTo
      ? {
          createdAt: {
            ...(filters.dateFrom && { gte: filters.dateFrom }),
            ...(filters.dateTo && { lte: filters.dateTo }),
          },
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
