import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const proposals = await prisma.proposal.findMany({
      where: {
        userId: user.id,
        ...(status && status !== 'all' ? { status } : {}),
      },
      include: {
        client: true,
        walkthrough: {
          include: {
            rooms: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(proposals)
  } catch (error) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      walkthroughId,
      clientId,
      customerRate,
      totalMonthlyHours,
      laborCost,
      monthlyPrice,
      profitMargin,
    } = body

    // Get client info for title
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const proposal = await prisma.proposal.create({
      data: {
        walkthroughId,
        clientId,
        userId: user.id,
        title: `${client.name} - Janitorial Services Proposal`,
        customerRate,
        totalMonthlyHours,
        laborCost,
        monthlyPrice,
        profitMargin,
        status: 'draft',
        introduction: `We are pleased to present this proposal for professional janitorial services for ${client.name}. Our team is committed to maintaining the highest standards of cleanliness and professionalism.`,
        scopeOfWork: `Our comprehensive janitorial services include regular cleaning and maintenance as detailed in the walkthrough assessment. Services will be provided ${totalMonthlyHours > 80 ? 'on a regular schedule' : 'as specified'} to ensure your facility remains clean and presentable.`,
        termsConditions: `Payment is due within 30 days of invoice date. Services are provided on a month-to-month basis with 30 days notice for cancellation. All work is guaranteed to meet your satisfaction.`,
      },
      include: {
        client: true,
        walkthrough: {
          include: {
            rooms: true,
          },
        },
      },
    })

    return NextResponse.json(proposal, { status: 201 })
  } catch (error) {
    console.error('Error creating proposal:', error)
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
  }
}
