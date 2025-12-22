import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Trucking Co',
      mode: 'PERSONAL',
    },
  });

  console.log('Created organization:', org.name);

  // Create demo user
  const passwordHash = await hash('DemoPassword123!');

  const user = await prisma.user.create({
    data: {
      email: 'demo@loaddesk.app',
      name: 'Demo User',
      organizationId: org.id,
      passwordCredential: {
        create: {
          passwordHash,
          algorithm: 'argon2id',
        },
      },
    },
  });

  console.log('Created user:', user.email);

  // Assign owner role
  await prisma.roleMembership.create({
    data: {
      userId: user.id,
      organizationId: org.id,
      role: 'OWNER',
    },
  });

  console.log('Assigned OWNER role');

  // Create demo loads
  const loads = [
    {
      organizationId: org.id,
      source: 'EMAIL' as const,
      status: 'PENDING' as const,
      brokerCarrierName: 'ABC Logistics',
      brokerCarrierEmail: 'dispatch@abclogistics.com',
      pickupLocation: 'Los Angeles, CA',
      pickupCity: 'Los Angeles',
      pickupState: 'CA',
      pickupDateTime: new Date('2024-01-15T08:00:00Z'),
      dropoffLocation: 'Phoenix, AZ',
      dropoffCity: 'Phoenix',
      dropoffState: 'AZ',
      dropoffDateTime: new Date('2024-01-15T16:00:00Z'),
      rate: 2500,
      commodity: 'Electronics',
      referenceNumber: 'REF-123456',
      aiSummary: '• 500 mile haul from LA to Phoenix\n• Electronics shipment, handle with care\n• Same-day delivery required\n• Good rate for the lane',
      confidenceScore: 0.92,
      missingFields: ['weight'],
    },
    {
      organizationId: org.id,
      source: 'EMAIL' as const,
      status: 'PENDING' as const,
      brokerCarrierName: 'XYZ Freight',
      brokerCarrierEmail: 'loads@xyzfreight.com',
      pickupLocation: 'San Diego, CA',
      pickupCity: 'San Diego',
      pickupState: 'CA',
      pickupDateTime: new Date('2024-01-16T06:00:00Z'),
      dropoffLocation: 'Las Vegas, NV',
      dropoffCity: 'Las Vegas',
      dropoffState: 'NV',
      dropoffDateTime: new Date('2024-01-16T12:00:00Z'),
      rate: 1800,
      commodity: 'General Freight',
      referenceNumber: 'XYZ-789',
      aiSummary: '• 330 mile run to Vegas\n• General freight, no special requirements\n• Morning pickup requested',
      confidenceScore: 0.85,
      missingFields: ['weight', 'commodity_details'],
    },
    {
      organizationId: org.id,
      source: 'EMAIL' as const,
      status: 'ACCEPTED' as const,
      brokerCarrierName: 'FastHaul Inc',
      brokerCarrierEmail: 'ops@fasthaul.com',
      pickupLocation: 'Fresno, CA',
      pickupCity: 'Fresno',
      pickupState: 'CA',
      pickupDateTime: new Date('2024-01-14T10:00:00Z'),
      dropoffLocation: 'Sacramento, CA',
      dropoffCity: 'Sacramento',
      dropoffState: 'CA',
      dropoffDateTime: new Date('2024-01-14T14:00:00Z'),
      rate: 950,
      commodity: 'Produce',
      referenceNumber: 'FH-2024-001',
      aiSummary: '• Short haul, 170 miles\n• Refrigerated produce\n• Time-sensitive delivery',
      confidenceScore: 0.95,
      missingFields: [],
    },
  ];

  for (const loadData of loads) {
    await prisma.load.create({ data: loadData });
  }

  console.log(`Created ${loads.length} demo loads`);

  // Create demo notifications
  await prisma.notification.createMany({
    data: [
      {
        organizationId: org.id,
        type: 'LOAD_CREATED',
        title: 'New Load Request',
        message: 'Load from ABC Logistics: Los Angeles to Phoenix',
        isRead: false,
      },
      {
        organizationId: org.id,
        type: 'LOAD_CREATED',
        title: 'New Load Request',
        message: 'Load from XYZ Freight: San Diego to Las Vegas',
        isRead: false,
      },
    ],
  });

  console.log('Created demo notifications');

  console.log('');
  console.log('=================================');
  console.log('Seeding complete!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Email: demo@loaddesk.app');
  console.log('  Password: DemoPassword123!');
  console.log('=================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
