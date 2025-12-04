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

  // Create Walkthrough Templates
  const officeTemplate = await prisma.walkthroughTemplate.create({
    data: {
      userId: demoUser.id,
      name: 'Standard Office Building',
      description: 'Typical office building with common areas',
      facilityType: 'Office Building',
      serviceFrequency: 'daily',
      daysPerWeek: 5,
      totalSqft: 5000,
      isPublic: true,
      isDefault: true,
      rooms: {
        create: [
          { name: 'Lobby', roomType: 'lobby', estimatedMinutes: 45, sortOrder: 1 },
          { name: 'Conference Room', roomType: 'conference', estimatedMinutes: 20, sortOrder: 2 },
          { name: 'Break Room', roomType: 'break_room', estimatedMinutes: 25, sortOrder: 3 },
          { name: "Men's Restroom", roomType: 'restroom', estimatedMinutes: 30, sortOrder: 4 },
          { name: "Women's Restroom", roomType: 'restroom', estimatedMinutes: 30, sortOrder: 5 },
          { name: 'Office Area', roomType: 'office_large', estimatedMinutes: 40, sortOrder: 6 },
          { name: 'Hallway', roomType: 'hallway', estimatedMinutes: 10, sortOrder: 7 },
        ],
      },
    },
  })

  const medicalTemplate = await prisma.walkthroughTemplate.create({
    data: {
      userId: demoUser.id,
      name: 'Medical Facility',
      description: 'Medical office or clinic',
      facilityType: 'Medical',
      serviceFrequency: 'daily',
      daysPerWeek: 5,
      totalSqft: 3000,
      isPublic: true,
      rooms: {
        create: [
          { name: 'Waiting Room', roomType: 'lobby', estimatedMinutes: 35, sortOrder: 1 },
          { name: 'Exam Room 1', roomType: 'exam_room', estimatedMinutes: 20, sortOrder: 2 },
          { name: 'Exam Room 2', roomType: 'exam_room', estimatedMinutes: 20, sortOrder: 3 },
          { name: 'Exam Room 3', roomType: 'exam_room', estimatedMinutes: 20, sortOrder: 4 },
          { name: 'Staff Break Room', roomType: 'break_room', estimatedMinutes: 20, sortOrder: 5 },
          { name: 'Restroom', roomType: 'restroom', estimatedMinutes: 30, sortOrder: 6 },
        ],
      },
    },
  })

  const retailTemplate = await prisma.walkthroughTemplate.create({
    data: {
      userId: demoUser.id,
      name: 'Retail Store',
      description: 'Small to medium retail space',
      facilityType: 'Retail',
      serviceFrequency: 'daily',
      daysPerWeek: 6,
      totalSqft: 2500,
      isPublic: true,
      rooms: {
        create: [
          { name: 'Sales Floor', roomType: 'sales_floor', estimatedMinutes: 45, sortOrder: 1 },
          { name: 'Stock Room', roomType: 'storage', estimatedMinutes: 20, sortOrder: 2 },
          { name: 'Employee Break Room', roomType: 'break_room', estimatedMinutes: 15, sortOrder: 3 },
          { name: 'Customer Restroom', roomType: 'restroom', estimatedMinutes: 25, sortOrder: 4 },
        ],
      },
    },
  })

  console.log('✅ Created 3 walkthrough templates')

  // Create Proposal Templates
  await prisma.proposalTemplate.create({
    data: {
      userId: demoUser.id,
      name: 'Standard Proposal',
      description: 'Professional standard template',
      category: 'Standard',
      layout: 'standard',
      colorScheme: 'dark',
      isDefault: true,
      isPublic: true,
      introduction:
        'Thank you for considering our professional janitorial services. We are committed to providing exceptional cleaning solutions tailored to your facility's unique needs.',
      scopeOfWork:
        'Our comprehensive cleaning services include all areas specified in the walkthrough assessment. We provide all necessary cleaning supplies, equipment, and trained personnel. Services are performed during agreed-upon hours to minimize disruption to your operations.',
      termsConditions:
        'Payment terms: Net 30 days from invoice date. Services provided on month-to-month basis with 30-day cancellation notice. All work guaranteed to meet industry standards. We maintain full liability insurance and workers compensation coverage for all employees.',
    },
  })

  await prisma.proposalTemplate.create({
    data: {
      userId: demoUser.id,
      name: 'Premium Proposal',
      description: 'Detailed premium template for high-value clients',
      category: 'Premium',
      layout: 'premium',
      colorScheme: 'dark',
      isPublic: true,
      introduction:
        'We are honored to present this comprehensive proposal for premium janitorial services. Our company brings over 15 years of experience in facility maintenance, serving businesses throughout the region. We pride ourselves on attention to detail, reliability, and exceptional customer service that exceeds expectations.',
      scopeOfWork:
        'Our premium service package includes daily cleaning of all designated areas with eco-friendly products. Services include: vacuuming/mopping all floors, dusting all surfaces, restroom sanitization, trash removal, glass cleaning, and common area maintenance. We assign dedicated team members to your facility for consistency and quality assurance. All cleaning supplies and equipment provided. Quality inspections performed weekly.',
      termsConditions:
        'Payment terms: Net 30 days. Initial contract term: 12 months, thereafter month-to-month with 60-day cancellation notice. Price guaranteed for first year. We maintain $2M general liability insurance and workers compensation for all staff. Background checks performed on all employees. 24/7 customer service hotline available.',
    },
  })

  await prisma.proposalTemplate.create({
    data: {
      userId: demoUser.id,
      name: 'Quick Quote',
      description: 'Simple template for fast quotes',
      category: 'Basic',
      layout: 'basic',
      colorScheme: 'dark',
      isPublic: true,
      introduction:
        'Thank you for your interest! Below is our quote for cleaning services based on your facility requirements.',
      scopeOfWork:
        'Daily cleaning services as outlined in the assessment. All supplies and equipment included.',
      termsConditions:
        'Payment due within 30 days. Month-to-month service. Fully insured and bonded.',
    },
  })

  console.log('✅ Created 3 proposal templates')

  // Create Content Templates
  await Promise.all([
    prisma.contentTemplate.create({
      data: {
        userId: demoUser.id,
        name: 'Green Cleaning Clause',
        category: 'scope_of_work',
        tags: ['eco-friendly', 'sustainability'],
        content:
          'We use only EPA-certified green cleaning products that are safe for the environment and building occupants. Our sustainable practices include microfiber technology to reduce water usage and proper waste segregation for recycling.',
      },
    }),
    prisma.contentTemplate.create({
      data: {
        userId: demoUser.id,
        name: 'COVID-19 Safety Protocol',
        category: 'scope_of_work',
        tags: ['health', 'safety', 'covid'],
        content:
          'All high-touch surfaces will be sanitized using EPA-approved disinfectants effective against COVID-19. Our staff follows strict health and safety protocols including proper PPE usage and health screening procedures.',
      },
    }),
    prisma.contentTemplate.create({
      data: {
        userId: demoUser.id,
        name: 'Price Lock Guarantee',
        category: 'terms_conditions',
        tags: ['pricing', 'guarantee'],
        content:
          'Your monthly rate is locked for the first 12 months of service. After the initial term, any price adjustments will be communicated 60 days in advance and will not exceed the rate of inflation or 5%, whichever is lower.',
      },
    }),
    prisma.contentTemplate.create({
      data: {
        userId: demoUser.id,
        name: 'Quality Guarantee',
        category: 'terms_conditions',
        tags: ['quality', 'guarantee'],
        content:
          'If you are not satisfied with any aspect of our service, simply notify us within 24 hours and we will return to address the issue at no additional charge. Your satisfaction is our top priority.',
      },
    }),
  ])

  console.log('✅ Created 4 content templates')

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
