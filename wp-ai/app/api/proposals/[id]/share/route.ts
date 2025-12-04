import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// POST /api/proposals/[id]/share - Generate public URL
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get proposal and verify ownership
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Generate public URL if it doesn't exist
    let publicUrl = proposal.publicUrl
    if (!publicUrl) {
      publicUrl = nanoid(12)

      await prisma.proposal.update({
        where: { id: params.id },
        data: { publicUrl },
      })
    }

    const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${publicUrl}`

    return NextResponse.json({
      publicUrl,
      fullUrl,
    })
  } catch (error) {
    console.error('Error generating public URL:', error)
    return NextResponse.json({ error: 'Failed to generate public URL' }, { status: 500 })
  }
}

// DELETE /api/proposals/[id]/share - Revoke public access
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.proposal.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        publicUrl: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking public access:', error)
    return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 })
  }
}
