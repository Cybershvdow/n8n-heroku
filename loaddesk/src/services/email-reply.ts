import { prisma } from '@/lib/db/client';
import { getEmailAdapter } from '@/lib/email';
import { decrypt } from '@/lib/crypto/encryption';
import { createAuditLog } from './audit';
import type { EmailIntegrationAccount, Load, EmailMessage } from '@prisma/client';

interface SendDecisionReplyParams {
  load: Load;
  decision: 'ACCEPTED' | 'DENIED';
  emailMessage: EmailMessage;
  integrationAccount: EmailIntegrationAccount;
  organizationId: string;
  userId: string;
  decisionId: string;
}

interface SendReplyResult {
  status: 'SENT' | 'QUEUED' | 'FAILED' | 'FALLBACK_COPY';
  messageId?: string;
  error?: string;
  copyText?: string;
}

/**
 * Send an acceptance or denial reply to the original sender.
 */
export async function sendDecisionReply(
  params: SendDecisionReplyParams
): Promise<SendReplyResult> {
  const {
    load,
    decision,
    emailMessage,
    integrationAccount,
    organizationId,
    userId,
    decisionId,
  } = params;

  // Get sender name from email or broker name
  const senderName = emailMessage.fromName ?? load.brokerCarrierName ?? 'Team';
  const originalSubject = emailMessage.subject ?? 'Load Request';

  // Build reply content
  const { subject, body } = buildReplyContent(decision, senderName, originalSubject);

  // Check if we have send permission
  const adapter = getEmailAdapter(integrationAccount.providerType as 'GMAIL' | 'O365');

  if (!adapter.hasSendPermission(integrationAccount.scopes)) {
    // No send permission - provide fallback copy
    const outboundEmail = await prisma.outboundEmail.create({
      data: {
        loadDecisionId: decisionId,
        emailIntegrationAccountId: integrationAccount.id,
        toAddress: emailMessage.fromAddress,
        subject,
        body,
        status: 'FALLBACK_COPY',
      },
    });

    return {
      status: 'FALLBACK_COPY',
      copyText: `To: ${emailMessage.fromAddress}\nSubject: ${subject}\n\n${body}`,
    };
  }

  // Decrypt access token
  let accessToken: string;
  try {
    if (!integrationAccount.encryptedAccessToken) {
      throw new Error('No access token available');
    }
    accessToken = decrypt(integrationAccount.encryptedAccessToken);
  } catch (error) {
    console.error('Failed to decrypt access token:', error);
    return { status: 'FAILED', error: 'Token decryption failed' };
  }

  // Check if token is expired and refresh if needed
  if (integrationAccount.tokenExpiresAt && integrationAccount.tokenExpiresAt < new Date()) {
    try {
      if (!integrationAccount.encryptedRefreshToken) {
        throw new Error('No refresh token available');
      }
      const refreshToken = decrypt(integrationAccount.encryptedRefreshToken);
      const newTokens = await adapter.refreshAccessToken(refreshToken);
      accessToken = newTokens.accessToken;

      // Update stored tokens
      await prisma.emailIntegrationAccount.update({
        where: { id: integrationAccount.id },
        data: {
          tokenExpiresAt: newTokens.expiresAt,
        },
      });
    } catch (error) {
      console.error('Failed to refresh token:', error);

      // Mark integration as token expired
      await prisma.emailIntegrationAccount.update({
        where: { id: integrationAccount.id },
        data: { status: 'TOKEN_EXPIRED' },
      });

      return { status: 'FAILED', error: 'Token refresh failed' };
    }
  }

  // Create outbound email record
  const outboundEmail = await prisma.outboundEmail.create({
    data: {
      loadDecisionId: decisionId,
      emailIntegrationAccountId: integrationAccount.id,
      toAddress: emailMessage.fromAddress,
      subject,
      body,
      status: 'QUEUED',
    },
  });

  try {
    // Send the reply
    const result = await adapter.sendReply(accessToken, {
      toAddress: emailMessage.fromAddress,
      toName: emailMessage.fromName ?? undefined,
      subject,
      body,
      threadId: emailMessage.threadId ?? undefined,
      inReplyTo: emailMessage.providerMessageId,
    });

    // Update outbound email record
    await prisma.outboundEmail.update({
      where: { id: outboundEmail.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        providerMessageId: result.messageId,
      },
    });

    // Audit log
    await createAuditLog({
      organizationId,
      userId,
      action: 'REPLY_SENT',
      resourceType: 'OutboundEmail',
      resourceId: outboundEmail.id,
      metadata: {
        loadId: load.id,
        decision,
        toAddress: emailMessage.fromAddress,
      },
    });

    return { status: 'SENT', messageId: result.messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update outbound email with error
    await prisma.outboundEmail.update({
      where: { id: outboundEmail.id },
      data: {
        status: 'FAILED',
        errorMessage,
        retryCount: { increment: 1 },
      },
    });

    // Audit log
    await createAuditLog({
      organizationId,
      userId,
      action: 'REPLY_FAILED',
      resourceType: 'OutboundEmail',
      resourceId: outboundEmail.id,
      metadata: {
        loadId: load.id,
        decision,
        error: errorMessage,
      },
    });

    return { status: 'FAILED', error: errorMessage };
  }
}

/**
 * Build reply email content based on decision.
 */
function buildReplyContent(
  decision: 'ACCEPTED' | 'DENIED',
  senderName: string,
  originalSubject: string
): { subject: string; body: string } {
  const cleanSubject = originalSubject.replace(/^(Re:\s*)+/i, '');

  if (decision === 'ACCEPTED') {
    return {
      subject: `Re: ${cleanSubject} — Load Accepted`,
      body: `Hi ${senderName},

Thanks for sending this over. We reviewed the details and can confirm we're accepting this load.

If there are any updates or additional requirements, please reply to this email.

Best regards`,
    };
  } else {
    return {
      subject: `Re: ${cleanSubject} — Load Declined`,
      body: `Hi ${senderName},

Thanks for sending this over. After review, we're unable to accept this load at this time.

Please feel free to send future opportunities.

Best regards`,
    };
  }
}
