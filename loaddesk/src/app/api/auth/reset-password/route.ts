import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { hashPassword } from '@/lib/auth/password';
import { verifyTokenHash } from '@/lib/crypto/encryption';
import { rateLimit, getClientIP, RateLimitError } from '@/lib/auth/rate-limit';
import { resetPasswordSchema } from '@/lib/validation/schemas';
import { createAuditLog } from '@/services/audit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitHeaders = await rateLimit('auth');

    // Parse and validate input
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const { token, password } = validationResult.data;

    // Find all unused, non-expired reset tokens
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    // Find matching token (timing-safe comparison)
    let matchingToken = null;
    for (const resetToken of resetTokens) {
      if (verifyTokenHash(token, resetToken.tokenHash)) {
        matchingToken = resetToken;
        break;
      }
    }

    if (!matchingToken) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired reset token',
          },
        },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password and mark token as used in transaction
    await prisma.$transaction([
      prisma.passwordCredential.upsert({
        where: { userId: matchingToken.userId },
        update: {
          passwordHash,
          algorithm: 'argon2id',
          updatedAt: new Date(),
        },
        create: {
          userId: matchingToken.userId,
          passwordHash,
          algorithm: 'argon2id',
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: matchingToken.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all sessions for this user (force re-login)
      prisma.session.deleteMany({
        where: { userId: matchingToken.userId },
      }),
    ]);

    const ipAddress = await getClientIP();
    const userAgent = request.headers.get('user-agent') ?? undefined;

    // Audit log
    await createAuditLog({
      organizationId: matchingToken.user.organizationId,
      userId: matchingToken.userId,
      action: 'PASSWORD_RESET_COMPLETED',
      resourceType: 'User',
      resourceId: matchingToken.userId,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        message: 'Password has been reset successfully. Please log in with your new password.',
      },
      { status: 200, headers: rateLimitHeaders }
    );
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: { 'Retry-After': String(error.retryAfter) },
        }
      );
    }

    console.error('Password reset error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
