import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const proposal = await prisma.proposal.findFirst({
      where: {
        id,
        userId: user.id,
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

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json(proposal)
  } catch (error) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, title, introduction, scopeOfWork, termsConditions, customerRate } = body

    const updateData: any = {}

    if (status !== undefined) {
      updateData.status = status
      if (status === 'sent' && !updateData.sentAt) {
        updateData.sentAt = new Date()
      } else if (status === 'won' && !updateData.signedAt) {
        updateData.signedAt = new Date()
      }
    }

    if (title !== undefined) updateData.title = title
    if (introduction !== undefined) updateData.introduction = introduction
    if (scopeOfWork !== undefined) updateData.scopeOfWork = scopeOfWork
    if (termsConditions !== undefined) updateData.termsConditions = termsConditions

    // Recalculate pricing if customerRate changed
    if (customerRate !== undefined) {
      const proposal = await prisma.proposal.findFirst({
        where: { id, userId: user.id },
      })

      if (proposal) {
        updateData.customerRate = customerRate
        updateData.monthlyPrice = customerRate * proposal.totalMonthlyHours
        const profit = updateData.monthlyPrice - proposal.laborCost
        updateData.profitMargin = (profit / updateData.monthlyPrice) * 100
      }
    }

    const proposal = await prisma.proposal.update({
      where: {
        id,
        userId: user.id,
      },
      data: updateData,
      include: {
        client: true,
        walkthrough: {
          include: {
            rooms: true,
          },
        },
      },
    })

    return NextResponse.json(proposal)
  } catch (error) {
    console.error('Error updating proposal:', error)
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.proposal.delete({
      where: {
        id,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting proposal:', error)
    return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 })
  }
}
