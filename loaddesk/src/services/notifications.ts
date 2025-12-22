import { prisma } from '@/lib/db/client';
import type { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  organizationId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Create a notification for a user or organization.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notifications should not break operations
  }
}

/**
 * Get notifications for a user with pagination.
 */
export async function getNotifications(
  organizationId: string,
  userId: string,
  options: {
    isRead?: boolean;
    page?: number;
    limit?: number;
  } = {}
) {
  const { isRead, page = 1, limit = 20 } = options;

  const where = {
    organizationId,
    OR: [
      { userId }, // User-specific
      { userId: null }, // Org-wide
    ],
    ...(isRead !== undefined && { isRead }),
  };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
      data: n.data,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount(
  organizationId: string,
  userId: string
): Promise<number> {
  return prisma.notification.count({
    where: {
      organizationId,
      OR: [{ userId }, { userId: null }],
      isRead: false,
    },
  });
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(
  notificationId: string,
  organizationId: string
): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      organizationId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications as read.
 */
export async function markAllAsRead(
  organizationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      organizationId,
      OR: [{ userId }, { userId: null }],
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Create notification when a new load is created.
 */
export async function notifyNewLoad(
  organizationId: string,
  loadId: string,
  brokerName: string | null,
  confidenceScore: number | null,
  missingFields: string[]
): Promise<void> {
  // Main notification
  await createNotification({
    organizationId,
    type: 'LOAD_CREATED',
    title: 'New Load Request',
    message: `Load from ${brokerName ?? 'Unknown sender'}`,
    data: { loadId },
  });

  // Low confidence notification
  if (confidenceScore !== null && confidenceScore < 0.6) {
    await createNotification({
      organizationId,
      type: 'LOAD_LOW_CONFIDENCE',
      title: 'Low Confidence Extraction',
      message: `Load extraction confidence is ${Math.round(confidenceScore * 100)}%. Manual review recommended.`,
      data: { loadId, confidenceScore },
    });
  }

  // Missing fields notification
  if (missingFields.length >= 3) {
    await createNotification({
      organizationId,
      type: 'LOAD_MISSING_FIELDS',
      title: 'Missing Load Information',
      message: `${missingFields.length} fields could not be extracted: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}`,
      data: { loadId, missingFields },
    });
  }
}
