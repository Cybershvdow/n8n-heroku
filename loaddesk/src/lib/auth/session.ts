import { cookies } from 'next/headers';
import { getIronSession, IronSession } from 'iron-session';
import { prisma } from '@/lib/db/client';
import type { SessionData, SessionUser, Role } from '@/types';

const SESSION_COOKIE_NAME = 'loaddesk_session';
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

interface SessionPayload {
  userId: string;
  sessionId: string;
}

function getSessionOptions() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters');
  }

  return {
    password: secret,
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const,
      maxAge: SESSION_TTL,
    },
  };
}

/**
 * Get the current session from cookies.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionPayload>(cookieStore, getSessionOptions());

  if (!session.userId || !session.sessionId) {
    return null;
  }

  // Verify session exists in database and is not expired
  const dbSession = await prisma.session.findUnique({
    where: { id: session.sessionId },
    include: {
      user: {
        include: {
          roleMemberships: {
            select: { role: true },
          },
        },
      },
    },
  });

  if (!dbSession || dbSession.expiresAt < new Date()) {
    // Session expired or doesn't exist
    await destroySession();
    return null;
  }

  // Update last active time
  await prisma.session.update({
    where: { id: session.sessionId },
    data: { lastActiveAt: new Date() },
  });

  const role = dbSession.user.roleMemberships[0]?.role ?? 'VIEWER';

  return {
    user: {
      id: dbSession.user.id,
      email: dbSession.user.email,
      name: dbSession.user.name,
      organizationId: dbSession.user.organizationId,
      role: role as Role,
    },
    createdAt: dbSession.createdAt.getTime(),
    expiresAt: dbSession.expiresAt.getTime(),
  };
}

/**
 * Create a new session for a user.
 */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<SessionData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roleMemberships: {
        select: { role: true },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const expiresAt = new Date(Date.now() + SESSION_TTL * 1000);

  // Create session in database
  const dbSession = await prisma.session.create({
    data: {
      userId,
      token: crypto.randomUUID(), // Used for lookup
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  // Set session cookie
  const cookieStore = await cookies();
  const session = await getIronSession<SessionPayload>(cookieStore, getSessionOptions());
  session.userId = userId;
  session.sessionId = dbSession.id;
  await session.save();

  const role = user.roleMemberships[0]?.role ?? 'VIEWER';

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      role: role as Role,
    },
    createdAt: dbSession.createdAt.getTime(),
    expiresAt: expiresAt.getTime(),
  };
}

/**
 * Destroy the current session.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionPayload>(cookieStore, getSessionOptions());

  if (session.sessionId) {
    // Delete from database
    await prisma.session.delete({
      where: { id: session.sessionId },
    }).catch(() => {
      // Ignore if already deleted
    });
  }

  session.destroy();
}

/**
 * Get the current user from session.
 * Throws if not authenticated.
 */
export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

/**
 * Check if user has required role.
 */
export function hasRole(user: SessionUser, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(user.role);
}

/**
 * Require specific roles.
 * Throws if user doesn't have required role.
 */
export async function requireRole(requiredRoles: Role[]): Promise<SessionData> {
  const session = await requireSession();
  if (!hasRole(session.user, requiredRoles)) {
    throw new Error('Forbidden');
  }
  return session;
}
