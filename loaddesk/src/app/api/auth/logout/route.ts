import { NextRequest, NextResponse } from 'next/server';
import { getSession, destroySession } from '@/lib/auth/session';
import { getClientIP } from '@/lib/auth/rate-limit';
import { createAuditLog } from '@/services/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (session) {
      const ipAddress = await getClientIP();
      const userAgent = request.headers.get('user-agent') ?? undefined;

      // Audit logout
      await createAuditLog({
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: 'USER_LOGOUT',
        resourceType: 'User',
        resourceId: session.user.id,
        ipAddress,
        userAgent,
      });
    }

    await destroySession();

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    // Always destroy session even on error
    await destroySession().catch(() => {});

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  }
}
