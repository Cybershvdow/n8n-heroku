import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';
import { loadFilterSchema } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const validationResult = loadFilterSchema.safeParse({
      status: searchParams.get('status') ?? undefined,
      source: searchParams.get('source') ?? undefined,
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
      broker: searchParams.get('broker') ?? undefined,
      page: searchParams.get('page') ?? '1',
      limit: searchParams.get('limit') ?? '20',
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { status, source, dateFrom, dateTo, broker, page, limit } = validationResult.data;

    // Build where clause with tenant isolation
    const where = {
      organizationId: session.user.organizationId,
      ...(status && { status }),
      ...(source && { source }),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
      ...(broker && {
        brokerCarrierName: {
          contains: broker,
          mode: 'insensitive' as const,
        },
      }),
    };

    // Fetch loads with pagination
    const [loads, total] = await Promise.all([
      prisma.load.findMany({
        where,
        include: {
          emailMessage: {
            select: {
              id: true,
              fromAddress: true,
              fromName: true,
              receivedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.load.count({ where }),
    ]);

    return NextResponse.json({
      loads: loads.map((load) => ({
        id: load.id,
        source: load.source,
        status: load.status,
        brokerCarrierName: load.brokerCarrierName,
        pickupLocation: load.pickupLocation ?? `${load.pickupCity ?? ''}, ${load.pickupState ?? ''}`.trim() || null,
        pickupDateTime: load.pickupDateTime,
        dropoffLocation: load.dropoffLocation ?? `${load.dropoffCity ?? ''}, ${load.dropoffState ?? ''}`.trim() || null,
        dropoffDateTime: load.dropoffDateTime,
        rate: load.rate ? Number(load.rate) : null,
        commodity: load.commodity,
        referenceNumber: load.referenceNumber,
        aiSummary: load.aiSummary,
        confidenceScore: load.confidenceScore,
        missingFields: load.missingFields,
        createdAt: load.createdAt,
        emailMessage: load.emailMessage,
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

    console.error('List loads error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
