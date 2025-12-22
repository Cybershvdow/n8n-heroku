import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';
import { tripStartSchema } from '@/lib/validation/schemas';
import { getClientIP } from '@/lib/auth/rate-limit';
import { createAuditLog } from '@/services/audit';

// GET /api/trips - List trips
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();

    const searchParams = request.nextUrl.searchParams;
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);

    // Build where clause
    const where: Record<string, unknown> = {
      organizationId: session.user.organizationId,
    };

    // If driver, only show their own trips
    if (session.user.role === 'DRIVER') {
      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!driverProfile) {
        return NextResponse.json({ trips: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }
      where.driverProfileId = driverProfile.id;
    } else if (driverId) {
      where.driverProfileId = driverId;
    }

    if (status) {
      where.status = status;
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          driverProfile: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.trip.count({ where }),
    ]);

    return NextResponse.json({
      trips: trips.map((trip) => ({
        id: trip.id,
        status: trip.status,
        startedAt: trip.startedAt,
        endedAt: trip.endedAt,
        durationMinutes: trip.durationMinutes,
        totalMiles: trip.totalMiles ? Number(trip.totalMiles) : null,
        purpose: trip.purpose,
        notes: trip.notes,
        driver: {
          id: trip.driverProfile.id,
          name: trip.driverProfile.user.name,
          email: trip.driverProfile.user.email,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    console.error('List trips error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

// POST /api/trips - Start a new trip
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();

    // Parse and validate input
    const body = await request.json();
    const validationResult = tripStartSchema.safeParse(body);

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

    const { purpose, notes, startLatitude, startLongitude } = validationResult.data;

    // Get or create driver profile
    let driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!driverProfile) {
      // Create driver profile
      driverProfile = await prisma.driverProfile.create({
        data: {
          userId: session.user.id,
          organizationId: session.user.organizationId,
        },
      });
    }

    // Check GPS consent
    if (!driverProfile.gpsConsentGiven) {
      return NextResponse.json(
        {
          error: {
            code: 'CONSENT_REQUIRED',
            message: 'GPS tracking consent is required to start a trip',
          },
        },
        { status: 403 }
      );
    }

    // Check for active trip
    const activeTrip = await prisma.trip.findFirst({
      where: {
        driverProfileId: driverProfile.id,
        status: 'IN_PROGRESS',
      },
    });

    if (activeTrip) {
      return NextResponse.json(
        {
          error: {
            code: 'TRIP_ACTIVE',
            message: 'You already have an active trip. End it before starting a new one.',
          },
        },
        { status: 400 }
      );
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        driverProfileId: driverProfile.id,
        organizationId: session.user.organizationId,
        purpose,
        notes,
        startLatitude,
        startLongitude,
        status: 'IN_PROGRESS',
      },
    });

    const ipAddress = await getClientIP();
    const userAgent = request.headers.get('user-agent') ?? undefined;

    // Audit log
    await createAuditLog({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      action: 'TRIP_STARTED',
      resourceType: 'Trip',
      resourceId: trip.id,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        trip: {
          id: trip.id,
          status: trip.status,
          startedAt: trip.startedAt,
          purpose: trip.purpose,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    console.error('Start trip error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
