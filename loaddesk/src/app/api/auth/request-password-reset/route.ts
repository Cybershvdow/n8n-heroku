import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { generateSecureToken, hashToken } from '@/lib/crypto/encryption';
import { rateLimit, getClientIP, RateLimitError } from '@/lib/auth/rate-limit';
import { requestPasswordResetSchema } from '@/lib/validation/schemas';
import { createAuditLog } from '@/services/audit';

const TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: NextRequest) {
  try {
    // Strict rate limiting for password reset
    const rateLimitHeaders = await rateLimit('passwordReset');

    // Parse and validate input
    const body = await request.json();
    const validationResult = requestPasswordResetSchema.safeParse(body);

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

    const { email } = validationResult.data;
    const normalizedEmail = email.toLowerCase();

    // Always return success to prevent user enumeration
    const successResponse = () =>
      NextResponse.json(
        {
          message: 'If an account with that email exists, a password reset link has been sent.',
        },
        { status: 200, headers: rateLimitHeaders }
      );

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Return success even if user doesn't exist
      return successResponse();
    }

    // Invalidate any existing reset tokens
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(), // Mark as used
      },
    });

    // Generate new token
    const token = generateSecureToken(32);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store hashed token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const ipAddress = await getClientIP();
    const userAgent = request.headers.get('user-agent') ?? undefined;

    // Audit log
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    // TODO: Send email with reset link
    // In production, integrate with email service (SendGrid, SES, etc.)
    // The reset link would be: ${APP_URL}/reset-password?token=${token}
    console.log(`Password reset token for ${email}: ${token}`);

    return successResponse();
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many password reset requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: { 'Retry-After': String(error.retryAfter) },
        }
      );
    }

    console.error('Password reset request error:', error);
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
