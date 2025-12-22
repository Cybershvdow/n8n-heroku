import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { verifyPassword, needsRehash, hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import {
  rateLimit,
  getClientIP,
  RateLimitError,
  trackLoginAttempt,
  initLoginAttemptTracking,
} from '@/lib/auth/rate-limit';
import { loginSchema } from '@/lib/validation/schemas';
import { createAuditLog } from '@/services/audit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitHeaders = await rateLimit('auth');

    // Parse and validate input
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

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

    const { email, password } = validationResult.data;
    const normalizedEmail = email.toLowerCase();

    // Initialize login attempt tracking
    await initLoginAttemptTracking(normalizedEmail);

    // Check if account is locked
    const lockStatus = await trackLoginAttempt(normalizedEmail, false);
    if (lockStatus.locked) {
      return NextResponse.json(
        {
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account temporarily locked due to too many failed attempts. Please try again later.',
          },
        },
        { status: 423, headers: rateLimitHeaders }
      );
    }

    // Find user with password credential
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        passwordCredential: true,
        roleMemberships: {
          select: { role: true, organizationId: true },
        },
      },
    });

    // Generic error message to prevent user enumeration
    const invalidCredentialsResponse = () =>
      NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401, headers: rateLimitHeaders }
      );

    if (!user || !user.passwordCredential) {
      // Track failed attempt even for non-existent users (timing attack mitigation)
      await trackLoginAttempt(normalizedEmail, false);
      return invalidCredentialsResponse();
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordCredential.passwordHash);

    if (!isValid) {
      const ipAddress = await getClientIP();
      const userAgent = request.headers.get('user-agent') ?? undefined;

      // Track failed attempt
      await trackLoginAttempt(normalizedEmail, false);

      // Audit failed login
      await createAuditLog({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'USER_LOGIN_FAILED',
        resourceType: 'User',
        resourceId: user.id,
        ipAddress,
        userAgent,
        metadata: { reason: 'invalid_password' },
      });

      return invalidCredentialsResponse();
    }

    // Successful login - reset attempt tracking
    await trackLoginAttempt(normalizedEmail, true);

    // Check if password hash needs upgrade
    if (needsRehash(user.passwordCredential.passwordHash)) {
      const newHash = await hashPassword(password);
      await prisma.passwordCredential.update({
        where: { userId: user.id },
        data: { passwordHash: newHash, updatedAt: new Date() },
      });
    }

    // Create session
    const ipAddress = await getClientIP();
    const userAgent = request.headers.get('user-agent') ?? undefined;
    await createSession(user.id, ipAddress, userAgent);

    // Audit successful login
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
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

    console.error('Login error:', error);
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
