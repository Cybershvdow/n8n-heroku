import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { ProposalPDF } from '@/lib/pdf/proposal-pdf'
import { nanoid } from 'nanoid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/proposals/[id]/pdf - Generate and download PDF
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get proposal with all relations
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        client: true,
        user: true,
        walkthrough: {
          include: {
            rooms: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      ProposalPDF({
        proposal,
        client: proposal.client,
        user: proposal.user,
        walkthrough: proposal.walkthrough,
      })
    )

    // Upload PDF to Supabase Storage
    const fileName = `${user.id}/${proposal.id}/${nanoid()}.pdf`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('proposal-pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('PDF upload error:', uploadError)
    }

    // Get public URL
    let pdfUrl = null
    if (uploadData) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('proposal-pdfs').getPublicUrl(fileName)
      pdfUrl = publicUrl

      // Update proposal with PDF URL
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: { pdfUrl },
      })
    }

    // Increment download count
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        downloadCount: { increment: 1 },
      },
    })

    // Track activity
    await prisma.proposalActivity.create({
      data: {
        proposalId: proposal.id,
        activityType: 'downloaded',
        metadata: {
          downloadedAt: new Date().toISOString(),
        },
      },
    })

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${proposal.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
