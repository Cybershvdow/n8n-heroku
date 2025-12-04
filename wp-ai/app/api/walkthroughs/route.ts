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

    const walkthroughs = await prisma.walkthrough.findMany({
      where: { userId: user.id },
      include: {
        client: true,
        rooms: true,
        proposal: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(walkthroughs)
  } catch (error) {
    console.error('Error fetching walkthroughs:', error)
    return NextResponse.json({ error: 'Failed to fetch walkthroughs' }, { status: 500 })
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
      clientId,
      propertyAddress,
      totalSqft,
      facilityType,
      serviceFrequency,
      daysPerWeek,
      rooms,
    } = body

    const walkthrough = await prisma.walkthrough.create({
      data: {
        clientId,
        propertyAddress,
        totalSqft: totalSqft || null,
        facilityType: facilityType || null,
        serviceFrequency: serviceFrequency || 'daily',
        daysPerWeek: daysPerWeek || 5,
        userId: user.id,
        rooms: {
          create: rooms.map((room: any) => ({
            name: room.name,
            roomType: room.roomType,
            squareFeet: room.squareFeet || null,
            floorType: room.floorType || null,
            estimatedMinutes: room.estimatedMinutes,
            specialNotes: room.specialNotes || null,
          })),
        },
      },
      include: {
        client: true,
        rooms: true,
      },
    })

    return NextResponse.json(walkthrough, { status: 201 })
  } catch (error) {
    console.error('Error creating walkthrough:', error)
    return NextResponse.json({ error: 'Failed to create walkthrough' }, { status: 500 })
  }
}
