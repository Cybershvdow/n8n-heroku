import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/templates/walkthrough - Get all walkthrough templates
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includePublic = searchParams.get('includePublic') === 'true'

    const templates = await prisma.walkthroughTemplate.findMany({
      where: includePublic
        ? {
            OR: [{ userId: user.id }, { isPublic: true }],
          }
        : { userId: user.id },
      include: {
        rooms: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { useCount: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching walkthrough templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST /api/templates/walkthrough - Create new walkthrough template
export async function POST(request: Request) {
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
      name,
      description,
      facilityType,
      serviceFrequency,
      daysPerWeek,
      totalSqft,
      rooms,
      isPublic,
      isDefault,
    } = body

    const template = await prisma.walkthroughTemplate.create({
      data: {
        userId: user.id,
        name,
        description,
        facilityType,
        serviceFrequency: serviceFrequency || 'daily',
        daysPerWeek: daysPerWeek || 5,
        totalSqft,
        isPublic: isPublic || false,
        isDefault: isDefault || false,
        rooms: rooms
          ? {
              create: rooms.map((room: any, index: number) => ({
                name: room.name,
                roomType: room.roomType,
                estimatedMinutes: room.estimatedMinutes,
                floorType: room.floorType,
                squareFeet: room.squareFeet,
                specialNotes: room.specialNotes,
                sortOrder: room.sortOrder || index,
              })),
            }
          : undefined,
      },
      include: {
        rooms: true,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating walkthrough template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
