import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const load = await prisma.load.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        emailMessage: {
          select: {
            id: true,
            providerMessageId: true,
            fromAddress: true,
            fromName: true,
            subject: true,
            bodyPreview: true,
            receivedAt: true,
          },
        },
        decisions: {
          include: {
            decidedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!load) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Load not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      load: {
        id: load.id,
        source: load.source,
        status: load.status,
        brokerCarrierName: load.brokerCarrierName,
        brokerCarrierEmail: load.brokerCarrierEmail,
        brokerCarrierPhone: load.brokerCarrierPhone,
        pickupLocation: load.pickupLocation,
        pickupAddress: load.pickupAddress,
        pickupCity: load.pickupCity,
        pickupState: load.pickupState,
        pickupZip: load.pickupZip,
        pickupDateTime: load.pickupDateTime,
        dropoffLocation: load.dropoffLocation,
        dropoffAddress: load.dropoffAddress,
        dropoffCity: load.dropoffCity,
        dropoffState: load.dropoffState,
        dropoffZip: load.dropoffZip,
        dropoffDateTime: load.dropoffDateTime,
        rate: load.rate ? Number(load.rate) : null,
        rateCurrency: load.rateCurrency,
        commodity: load.commodity,
        weight: load.weight,
        referenceNumber: load.referenceNumber,
        notes: load.notes,
        aiSummary: load.aiSummary,
        confidenceScore: load.confidenceScore,
        missingFields: load.missingFields,
        extractionModel: load.extractionModel,
        createdAt: load.createdAt,
        emailMessage: load.emailMessage,
        decisions: load.decisions.map((d) => ({
          id: d.id,
          decision: d.decision,
          decidedBy: d.decidedBy,
          reason: d.reason,
          createdAt: d.createdAt,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    console.error('Get load error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
