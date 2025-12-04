import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/templates/proposal
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

    const templates = await prisma.proposalTemplate.findMany({
      where: includePublic
        ? {
            OR: [{ userId: user.id }, { isPublic: true }],
          }
        : { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { useCount: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching proposal templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST /api/templates/proposal
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
      category,
      layout,
      colorScheme,
      headerStyle,
      introduction,
      scopeOfWork,
      termsConditions,
      isPublic,
      isDefault,
    } = body

    const template = await prisma.proposalTemplate.create({
      data: {
        userId: user.id,
        name,
        description,
        category,
        layout: layout || 'standard',
        colorScheme: colorScheme || 'dark',
        headerStyle: headerStyle || 'default',
        introduction,
        scopeOfWork,
        termsConditions,
        isPublic: isPublic || false,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating proposal template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
