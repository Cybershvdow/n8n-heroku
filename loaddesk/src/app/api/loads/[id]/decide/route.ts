import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { getClientIP } from '@/lib/auth/rate-limit';
import { prisma } from '@/lib/db/client';
import { loadDecisionSchema } from '@/lib/validation/schemas';
import { createAuditLog } from '@/services/audit';
import { sendDecisionReply } from '@/services/email-reply';
import { createNotification } from '@/services/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only Owner and Dispatcher can make decisions
    const session = await requireRole(['OWNER', 'DISPATCHER']);
    const { id } = await params;

    // Parse and validate input
    const body = await request.json();
    const validationResult = loadDecisionSchema.safeParse(body);

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

    const { decision, reason } = validationResult.data;

    // Find load with email integration info
    const load = await prisma.load.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        emailMessage: {
          include: {
            emailIntegrationAccount: true,
          },
        },
      },
    });

    if (!load) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Load not found' } },
        { status: 404 }
      );
    }

    // Check if already decided
    if (load.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_DECIDED',
            message: `Load has already been ${load.status.toLowerCase()}`,
          },
        },
        { status: 400 }
      );
    }

    // Create decision and update load in transaction
    const [updatedLoad, loadDecision] = await prisma.$transaction([
      prisma.load.update({
        where: { id },
        data: { status: decision },
      }),
      prisma.loadDecision.create({
        data: {
          loadId: id,
          decision,
          decidedById: session.user.id,
          reason,
        },
      }),
    ]);

    const ipAddress = await getClientIP();
    const userAgent = request.headers.get('user-agent') ?? undefined;

    // Audit log
    await createAuditLog({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      action: decision === 'ACCEPTED' ? 'LOAD_ACCEPTED' : 'LOAD_DENIED',
      resourceType: 'Load',
      resourceId: id,
      metadata: { reason },
      ipAddress,
      userAgent,
    });

    // Send email reply
    let replyStatus = 'NO_EMAIL';

    if (load.emailMessage?.emailIntegrationAccount) {
      try {
        const result = await sendDecisionReply({
          load: updatedLoad,
          decision,
          emailMessage: load.emailMessage,
          integrationAccount: load.emailMessage.emailIntegrationAccount,
          organizationId: session.user.organizationId,
          userId: session.user.id,
          decisionId: loadDecision.id,
        });

        replyStatus = result.status;

        if (result.status === 'FAILED') {
          // Create notification for failed reply
          await createNotification({
            organizationId: session.user.organizationId,
            type: 'REPLY_SEND_FAILED',
            title: 'Reply Failed to Send',
            message: `Could not send ${decision.toLowerCase()} reply for load from ${load.brokerCarrierName ?? 'Unknown'}`,
            data: { loadId: id, error: result.error },
          });
        }
      } catch (error) {
        console.error('Failed to send decision reply:', error);
        replyStatus = 'FAILED';
      }
    }

    return NextResponse.json({
      load: {
        id: updatedLoad.id,
        status: updatedLoad.status,
      },
      decision: {
        id: loadDecision.id,
        decision: loadDecision.decision,
        decidedBy: {
          id: session.user.id,
          name: session.user.name,
        },
        createdAt: loadDecision.createdAt,
      },
      replyStatus,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
          { status: 401 }
        );
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: 'Not authorized to make decisions' } },
          { status: 403 }
        );
      }
    }

    console.error('Load decision error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
