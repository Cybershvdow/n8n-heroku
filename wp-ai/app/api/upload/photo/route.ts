import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/upload/photo
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const walkthroughId = formData.get('walkthroughId') as string
    const roomId = formData.get('roomId') as string | null
    const caption = formData.get('caption') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!walkthroughId) {
      return NextResponse.json({ error: 'Walkthrough ID required' }, { status: 400 })
    }

    // Verify walkthrough belongs to user
    const walkthrough = await prisma.walkthrough.findFirst({
      where: {
        id: walkthroughId,
        userId: user.id,
      },
    })

    if (!walkthrough) {
      return NextResponse.json({ error: 'Walkthrough not found' }, { status: 404 })
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${walkthroughId}/${nanoid()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('walkthrough-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('walkthrough-photos').getPublicUrl(fileName)

    // Save photo record to database
    const photo = await prisma.photo.create({
      data: {
        walkthroughId,
        roomId,
        url: publicUrl,
        caption,
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}

// DELETE /api/upload/photo
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('id')

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })
    }

    // Get photo and verify ownership
    const photo = await prisma.photo.findFirst({
      where: { id: photoId },
      include: {
        walkthrough: true,
      },
    })

    if (!photo || photo.walkthrough.userId !== user.id) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Extract file path from URL
    const url = new URL(photo.url)
    const filePath = url.pathname.split('/').slice(-3).join('/')

    // Delete from Supabase Storage
    await supabase.storage.from('walkthrough-photos').remove([filePath])

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
