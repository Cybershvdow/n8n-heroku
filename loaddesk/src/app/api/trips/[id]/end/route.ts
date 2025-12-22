import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';
import { tripEndSchema } from '@/lib/validation/schemas';
import { getClientIP } from '@/lib/auth/rate-limit';
import { createAuditLog } from '@/services/audit';
import { createNotification } from '@/services/notifications';

// POST /api/trips/[id]/end - End a trip
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    // Parse and validate input
    const body = await request.json();
    const validationResult = tripEndSchema.safeParse(body);

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

    const { endLatitude, endLongitude, notes } = validationResult.data;

    // Get driver profile
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Driver profile not found' } },
        { status: 404 }
      );
    }

    // Find the trip
    const trip = await prisma.trip.findFirst({
      where: {
        id,
        driverProfileId: driverProfile.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Trip not found' } },
        { status: 404 }
      );
    }

    if (trip.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: { code: 'TRIP_NOT_ACTIVE', message: 'Trip is not in progress' } },
        { status: 400 }
      );
    }

    // Calculate duration
    const endedAt = new Date();
    const durationMinutes = Math.round(
      (endedAt.getTime() - trip.startedAt.getTime()) / (1000 * 60)
    );

    // Calculate distance (simplified - in production, use route points or mapping API)
    let totalMiles: number | null = null;
    if (
      trip.startLatitude &&
      trip.startLongitude &&
      endLatitude &&
      endLongitude
    ) {
      totalMiles = calculateDistance(
        Number(trip.startLatitude),
        Number(trip.startLongitude),
        endLatitude,
        endLongitude
      );
    }

    // Update trip
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt,
        endLatitude,
        endLongitude,
        durationMinutes,
        totalMiles,
        notes: notes ?? trip.notes,
      },
    });

    const ipAddress = await getClientIP();
    const userAgent = request.headers.get('user-agent') ?? undefined;

    // Audit log
    await createAuditLog({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      action: 'TRIP_ENDED',
      resourceType: 'Trip',
      resourceId: id,
      metadata: {
        durationMinutes,
        totalMiles,
      },
      ipAddress,
      userAgent,
    });

    // Notification
    await createNotification({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      type: 'TRIP_ENDED',
      title: 'Trip Completed',
      message: `Trip completed: ${totalMiles?.toFixed(1) ?? '?'} miles in ${formatDuration(durationMinutes)}`,
      data: { tripId: id },
    });

    return NextResponse.json({
      trip: {
        id: updatedTrip.id,
        status: updatedTrip.status,
        startedAt: updatedTrip.startedAt,
        endedAt: updatedTrip.endedAt,
        durationMinutes: updatedTrip.durationMinutes,
        totalMiles: updatedTrip.totalMiles ? Number(updatedTrip.totalMiles) : null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    console.error('End trip error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in miles.
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
}
