import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@wpai.app' },
    update: {},
    create: {
      id: 'demo-user-id',
      email: 'demo@wpai.app',
      name: 'Demo User',
      company: 'Clean Pro Services',
      phone: '(555) 123-4567',
      hourlyWage: 20.0,
      targetMargin: 0.3,
    },
  })

  console.log('✅ Created demo user:', demoUser.email)

  // Create demo clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'Acme Corporation',
        contactName: 'John Smith',
        email: 'john@acme.com',
        phone: '(555) 234-5678',
        address: '123 Business Blvd, Suite 100, San Francisco, CA 94103',
        userId: demoUser.id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'Tech Startup Inc',
        contactName: 'Jane Doe',
        email: 'jane@techstartup.com',
        phone: '(555) 345-6789',
        address: '456 Innovation Dr, Palo Alto, CA 94301',
        userId: demoUser.id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'Medical Center',
        contactName: 'Dr. Sarah Johnson',
        email: 'sjohnson@medcenter.org',
        phone: '(555) 456-7890',
        address: '789 Health Way, Oakland, CA 94612',
        userId: demoUser.id,
      },
    }),
  ])

  console.log(`✅ Created ${clients.length} demo clients`)

  // Create demo walkthrough with rooms
  const walkthrough = await prisma.walkthrough.create({
    data: {
      clientId: clients[0].id,
      userId: demoUser.id,
      propertyAddress: '123 Business Blvd, Suite 100, San Francisco, CA 94103',
      totalSqft: 5000,
      facilityType: 'Office Building',
      serviceFrequency: 'daily',
      daysPerWeek: 5,
      status: 'completed',
      rooms: {
        create: [
          {
            name: 'Main Lobby',
            roomType: 'lobby',
            squareFeet: 800,
            estimatedMinutes: 45,
            floorType: 'Tile',
          },
          {
            name: 'Conference Room A',
            roomType: 'conference',
            squareFeet: 400,
            estimatedMinutes: 20,
            floorType: 'Carpet',
          },
          {
            name: 'Break Room',
            roomType: 'break_room',
            squareFeet: 300,
            estimatedMinutes: 25,
            floorType: 'Tile',
            specialNotes: 'Microwave and refrigerator need cleaning',
          },
          {
            name: "Men's Restroom",
            roomType: 'restroom',
            estimatedMinutes: 30,
            floorType: 'Tile',
          },
          {
            name: "Women's Restroom",
            roomType: 'restroom',
            estimatedMinutes: 30,
            floorType: 'Tile',
          },
          {
            name: 'Office 101',
            roomType: 'office_medium',
            squareFeet: 200,
            estimatedMinutes: 25,
            floorType: 'Carpet',
          },
          {
            name: 'Office 102',
            roomType: 'office_medium',
            squareFeet: 200,
            estimatedMinutes: 25,
            floorType: 'Carpet',
          },
          {
            name: 'Main Hallway',
            roomType: 'hallway',
            squareFeet: 600,
            estimatedMinutes: 10,
            floorType: 'Tile',
          },
        ],
      },
    },
  })

  console.log('✅ Created demo walkthrough with 8 rooms')

  // Calculate total minutes for proposal
  const rooms = await prisma.room.findMany({
    where: { walkthroughId: walkthrough.id },
  })

  const totalMinutes = rooms.reduce((sum, room) => sum + room.estimatedMinutes, 0)
  const totalHoursPerDay = totalMinutes / 60
  const totalHoursPerMonth = totalHoursPerDay * 5 * 4.33

  const customerRate = 40 // $40/hr
  const laborCost = demoUser.hourlyWage * totalHoursPerMonth
  const monthlyPrice = customerRate * totalHoursPerMonth
  const profit = monthlyPrice - laborCost
  const profitMargin = (profit / monthlyPrice) * 100

  // Create demo proposal
  const proposal = await prisma.proposal.create({
    data: {
      walkthroughId: walkthrough.id,
      clientId: clients[0].id,
      userId: demoUser.id,
      title: 'Acme Corporation - Janitorial Services Proposal',
      customerRate,
      totalMonthlyHours: totalHoursPerMonth,
      laborCost,
      monthlyPrice,
      profitMargin,
      status: 'sent',
      introduction:
        'We are pleased to present this comprehensive proposal for professional janitorial services at your facility. Our team is committed to maintaining the highest standards of cleanliness and professionalism.',
      scopeOfWork:
        'Our services include daily cleaning of all office spaces, restrooms, common areas, and hallways. We will provide all necessary cleaning supplies and equipment. Services will be performed Monday through Friday during off-hours to minimize disruption to your business operations.',
      termsConditions:
        'Payment is due within 30 days of invoice date. Services are provided on a month-to-month basis with 30 days notice for cancellation. All work is guaranteed to meet your satisfaction. We maintain full liability insurance and workers compensation coverage.',
      sentAt: new Date(),
    },
  })

  console.log('✅ Created demo proposal:', proposal.title)

  // Create a few more quick proposals for stats
  await prisma.proposal.create({
    data: {
      walkthroughId: walkthrough.id,
      clientId: clients[1].id,
      userId: demoUser.id,
      title: 'Tech Startup Inc - Cleaning Services Quote',
      customerRate: 35,
      totalMonthlyHours: 45,
      laborCost: 900,
      monthlyPrice: 1575,
      profitMargin: 42.86,
      status: 'won',
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      signedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  })

  await prisma.proposal.create({
    data: {
      walkthroughId: walkthrough.id,
      clientId: clients[2].id,
      userId: demoUser.id,
      title: 'Medical Center - Janitorial Services',
      customerRate: 45,
      totalMonthlyHours: 80,
      laborCost: 1600,
      monthlyPrice: 3600,
      profitMargin: 55.56,
      status: 'draft',
    },
  })

  console.log('✅ Created additional demo proposals')

  console.log('\n🎉 Seeding completed!')
  console.log('\n📧 Demo login credentials:')
  console.log('   Email: demo@wpai.app')
  console.log('   Password: (Set up in Supabase Auth)\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
