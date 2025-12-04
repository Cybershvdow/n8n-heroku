import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get original proposal
    const original = await prisma.proposal.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        client: true,
      },
    })

    if (!original) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Create duplicate proposal
    const duplicate = await prisma.proposal.create({
      data: {
        walkthroughId: original.walkthroughId,
        clientId: original.clientId,
        userId: user.id,
        title: `${original.title} (Copy)`,
        customerRate: original.customerRate,
        totalMonthlyHours: original.totalMonthlyHours,
        laborCost: original.laborCost,
        monthlyPrice: original.monthlyPrice,
        profitMargin: original.profitMargin,
        introduction: original.introduction,
        scopeOfWork: original.scopeOfWork,
        termsConditions: original.termsConditions,
        status: 'draft',
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

    return NextResponse.json(duplicate, { status: 201 })
  } catch (error) {
    console.error('Error duplicating proposal:', error)
    return NextResponse.json({ error: 'Failed to duplicate proposal' }, { status: 500 })
  }
}
