import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// POST /api/upload/voice
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
    const fileExt = file.name.split('.').pop() || 'webm'
    const fileName = `${user.id}/${walkthroughId}/${nanoid()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-notes')
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
    } = supabase.storage.from('voice-notes').getPublicUrl(fileName)

    // Transcribe audio with OpenAI Whisper
    let transcription = null
    try {
      // Create a File object for OpenAI from the buffer
      const audioFile = new File([buffer], file.name, { type: file.type })

      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
      })

      transcription = response.text
    } catch (error) {
      console.error('Whisper transcription error:', error)
      // Continue without transcription if it fails
    }

    // Calculate duration (if available from file metadata)
    const duration = file.size ? Math.round(file.size / 16000) : null

    // Save voice note to database
    const voiceNote = await prisma.voiceNote.create({
      data: {
        walkthroughId,
        audioUrl: publicUrl,
        transcription,
        duration,
      },
    })

    return NextResponse.json(voiceNote, { status: 201 })
  } catch (error) {
    console.error('Error uploading voice note:', error)
    return NextResponse.json({ error: 'Failed to upload voice note' }, { status: 500 })
  }
}

// DELETE /api/upload/voice
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
    const voiceNoteId = searchParams.get('id')

    if (!voiceNoteId) {
      return NextResponse.json({ error: 'Voice note ID required' }, { status: 400 })
    }

    // Get voice note and verify ownership
    const voiceNote = await prisma.voiceNote.findFirst({
      where: { id: voiceNoteId },
      include: {
        walkthrough: true,
      },
    })

    if (!voiceNote || voiceNote.walkthrough.userId !== user.id) {
      return NextResponse.json({ error: 'Voice note not found' }, { status: 404 })
    }

    // Extract file path from URL
    const url = new URL(voiceNote.audioUrl)
    const filePath = url.pathname.split('/').slice(-3).join('/')

    // Delete from Supabase Storage
    await supabase.storage.from('voice-notes').remove([filePath])

    // Delete from database
    await prisma.voiceNote.delete({
      where: { id: voiceNoteId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting voice note:', error)
    return NextResponse.json({ error: 'Failed to delete voice note' }, { status: 500 })
  }
}
