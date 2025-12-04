import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/proposals/[id]/sign - Sign a proposal (public access via publicUrl)
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { signatureDataUrl, signerName, signerEmail, publicUrl } = body

    if (!signatureDataUrl || !signerName || !signerEmail) {
      return NextResponse.json(
        { error: 'Signature, name, and email required' },
        { status: 400 }
      )
    }

    // Find proposal by ID or publicUrl
    const proposal = publicUrl
      ? await prisma.proposal.findUnique({
          where: { publicUrl },
        })
      : await prisma.proposal.findUnique({
          where: { id: params.id },
        })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    if (proposal.signedAt) {
      return NextResponse.json(
        { error: 'Proposal already signed' },
        { status: 400 }
      )
    }

    // Upload signature to Supabase Storage
    const supabase = await createClient()

    // Convert data URL to buffer
    const base64Data = signatureDataUrl.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    const fileName = `signatures/${proposal.id}/${nanoid()}.png`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('proposal-signatures')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Signature upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload signature' },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl: signatureUrl },
    } = supabase.storage.from('proposal-signatures').getPublicUrl(fileName)

    // Update proposal with signature
    const updatedProposal = await prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        status: 'won',
        signedAt: new Date(),
        signatureUrl,
        signerName,
        signerEmail,
      },
    })

    // Track activity
    await prisma.proposalActivity.create({
      data: {
        proposalId: proposal.id,
        activityType: 'signed',
        metadata: {
          signedBy: signerName,
          signedAt: new Date().toISOString(),
          signerEmail,
        },
      },
    })

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
    })
  } catch (error) {
    console.error('Error signing proposal:', error)
    return NextResponse.json({ error: 'Failed to sign proposal' }, { status: 500 })
  }
}

// GET /api/proposals/[id]/sign - Get signature status
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const publicUrl = searchParams.get('publicUrl')

    const proposal = publicUrl
      ? await prisma.proposal.findUnique({
          where: { publicUrl },
          select: {
            id: true,
            signedAt: true,
            signerName: true,
            signerEmail: true,
            signatureUrl: true,
            status: true,
          },
        })
      : await prisma.proposal.findUnique({
          where: { id: params.id },
          select: {
            id: true,
            signedAt: true,
            signerName: true,
            signerEmail: true,
            signatureUrl: true,
            status: true,
          },
        })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json({
      signed: !!proposal.signedAt,
      signedAt: proposal.signedAt,
      signerName: proposal.signerName,
      signerEmail: proposal.signerEmail,
      signatureUrl: proposal.signatureUrl,
      status: proposal.status,
    })
  } catch (error) {
    console.error('Error getting signature status:', error)
    return NextResponse.json(
      { error: 'Failed to get signature status' },
      { status: 500 }
    )
  }
}
