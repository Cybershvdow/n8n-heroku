import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/templates/content
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
    const category = searchParams.get('category')
    const includePublic = searchParams.get('includePublic') === 'true'

    const where: any = includePublic
      ? { OR: [{ userId: user.id }, { isPublic: true }] }
      : { userId: user.id }

    if (category) {
      where.category = category
    }

    const templates = await prisma.contentTemplate.findMany({
      where,
      orderBy: [{ useCount: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching content templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST /api/templates/content
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
    const { name, category, content, tags, isPublic } = body

    const template = await prisma.contentTemplate.create({
      data: {
        userId: user.id,
        name,
        category,
        content,
        tags: tags || [],
        isPublic: isPublic || false,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating content template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
