import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';
import { gpsConsentSchema } from '@/lib/validation/schemas';
import { getClientIP } from '@/lib/auth/rate-limit';
import { createAuditLog } from '@/services/audit';

// PATCH /api/drivers/[id]/consent - Update GPS consent
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    // Parse and validate input
    const body = await request.json();
    const validationResult = gpsConsentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { consent } = validationResult.data;

    // Find driver profile
    const driverProfile = await prisma.driverProfile.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        user: {
          select: { id: true },
        },
      },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Driver profile not found' } },
        { status: 404 }
      );
    }

    // Only the driver themselves or an Owner can update consent
    const isOwn = driverProfile.user.id === session.user.id;
    const isOwner = session.user.role === 'OWNER';

    if (!isOwn && !isOwner) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not authorized to update consent' } },
        { status: 403 }
      );
    }

    // Update consent
    const updated = await prisma.driverProfile.update({
      where: { id },
      data: {
        gpsConsentGiven: consent,
        gpsConsentAt: consent ? new Date() : null,
      },
    });

    const ipAddress = await getClientIP();
    const userAgent = request.headers.get('user-agent') ?? undefined;

    // Audit log
    await createAuditLog({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      action: consent ? 'GPS_CONSENT_GRANTED' : 'GPS_CONSENT_REVOKED',
      resourceType: 'DriverProfile',
      resourceId: id,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      driverProfile: {
        id: updated.id,
        gpsConsentGiven: updated.gpsConsentGiven,
        gpsConsentAt: updated.gpsConsentAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    console.error('Update consent error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
