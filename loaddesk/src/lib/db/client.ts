import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances in development
export const prisma = globalThis.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Tenant-scoped query helpers.
 * ALWAYS use these for queries to ensure tenant isolation.
 */
export function withOrganization<T extends { organizationId: string }>(
  organizationId: string,
  where: Omit<T, 'organizationId'>
): T {
  return {
    ...where,
    organizationId,
  } as T;
}

/**
 * Creates a tenant-scoped Prisma client extension.
 * Use this for all database operations to enforce tenant isolation.
 */
export function createTenantClient(organizationId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, operation, args, query }) {
          // Inject organizationId for models that have it
          if (hasOrganizationId(model)) {
            args.where = {
              ...args.where,
              organizationId,
            };
          }
          return query(args);
        },
        async findFirst({ model, operation, args, query }) {
          if (hasOrganizationId(model)) {
            args.where = {
              ...args.where,
              organizationId,
            };
          }
          return query(args);
        },
        async findUnique({ model, operation, args, query }) {
          // For findUnique, we verify after fetch
          const result = await query(args);
          if (result && hasOrganizationId(model)) {
            if ((result as { organizationId?: string }).organizationId !== organizationId) {
              return null; // Tenant mismatch
            }
          }
          return result;
        },
        async create({ model, operation, args, query }) {
          if (hasOrganizationId(model)) {
            args.data = {
              ...args.data,
              organizationId,
            };
          }
          return query(args);
        },
        async update({ model, operation, args, query }) {
          if (hasOrganizationId(model)) {
            args.where = {
              ...args.where,
              organizationId,
            };
          }
          return query(args);
        },
        async delete({ model, operation, args, query }) {
          if (hasOrganizationId(model)) {
            // Verify ownership before delete
            const existing = await prisma[model as keyof typeof prisma].findFirst({
              where: {
                ...args.where,
                organizationId,
              },
            });
            if (!existing) {
              throw new Error('Record not found or access denied');
            }
          }
          return query(args);
        },
      },
    },
  });
}

// Models that have organizationId field
const TENANT_SCOPED_MODELS = new Set([
  'User',
  'RoleMembership',
  'EmailIntegrationAccount',
  'EmailMessage',
  'Load',
  'DriverProfile',
  'Trip',
  'Notification',
  'AuditLog',
]);

function hasOrganizationId(model: string): boolean {
  return TENANT_SCOPED_MODELS.has(model);
}

export type TenantPrismaClient = ReturnType<typeof createTenantClient>;
