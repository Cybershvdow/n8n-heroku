import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { rateLimit, getClientIP, RateLimitError } from '@/lib/auth/rate-limit';
import { registerSchema } from '@/lib/validation/schemas';
import { createAuditLog } from '@/services/audit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitHeaders = await rateLimit('auth');

    // Parse and validate input
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

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

    const { email, password, name, organizationName } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_EXISTS',
            message: 'An account with this email already exists',
          },
        },
        { status: 409, headers: rateLimitHeaders }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create organization and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          mode: 'PERSONAL',
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          organizationId: organization.id,
          passwordCredential: {
            create: {
              passwordHash,
              algorithm: 'argon2id',
            },
          },
        },
      });

      // Assign OWNER role
      await tx.roleMembership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'OWNER',
        },
      });

      return { user, organization };
    });

    // Create session
    const ipAddress = await getClientIP();
    const userAgent = request.headers.get('user-agent') ?? undefined;
    await createSession(result.user.id, ipAddress, userAgent);

    // Audit log
    await createAuditLog({
      organizationId: result.organization.id,
      userId: result.user.id,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: result.user.id,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          mode: result.organization.mode,
        },
      },
      { status: 201, headers: rateLimitHeaders }
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

    console.error('Registration error:', error);
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
