import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// POST /api/proposals/[id]/send - Send proposal via email
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, message } = body

    // Get proposal with all relations
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        client: true,
        user: true,
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Generate public URL if not exists
    let publicUrl = proposal.publicUrl
    if (!publicUrl) {
      const { nanoid } = await import('nanoid')
      publicUrl = nanoid(12)

      await prisma.proposal.update({
        where: { id: proposal.id },
        data: { publicUrl },
      })
    }

    const proposalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${publicUrl}`
    const recipientEmail = email || proposal.client.email

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'No email address provided' },
        { status: 400 }
      )
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: `${proposal.user.name} <onboarding@resend.dev>`, // Change to your verified domain
      to: recipientEmail,
      subject: `Proposal: ${proposal.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1a1f2e;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .company {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 8px;
              }
              .subtitle {
                color: #94a3b8;
                font-size: 14px;
              }
              .content {
                background: white;
                border: 1px solid #e2e8f0;
                border-top: none;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .greeting {
                font-size: 16px;
                margin-bottom: 20px;
              }
              .message {
                background: #f8fafc;
                padding: 20px;
                border-left: 4px solid #d4ff00;
                margin: 20px 0;
              }
              .price-box {
                background: linear-gradient(135deg, #d4ff00 0%, #b8e600 100%);
                color: #0a0e1a;
                padding: 25px;
                border-radius: 8px;
                text-align: center;
                margin: 25px 0;
              }
              .price {
                font-size: 36px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .price-label {
                font-size: 14px;
                opacity: 0.8;
              }
              .cta-button {
                display: inline-block;
                background: #0a0e1a;
                color: white !important;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                color: #64748b;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
              }
              .contact-info {
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
              }
              .contact-label {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company">${proposal.user.company || proposal.user.name}</div>
              <div class="subtitle">Professional Janitorial Services</div>
            </div>

            <div class="content">
              <div class="greeting">
                Hello${proposal.client.contactName ? ` ${proposal.client.contactName}` : ''},
              </div>

              <p>Thank you for your interest in our services. We are pleased to present our proposal for ${proposal.client.name}.</p>

              ${message ? `<div class="message">${message}</div>` : ''}

              <div class="price-box">
                <div class="price">$${proposal.monthlyPrice.toLocaleString()}</div>
                <div class="price-label">per month</div>
              </div>

              <p style="text-align: center;">
                <a href="${proposalUrl}" class="cta-button">View Full Proposal</a>
              </p>

              <p>This proposal includes:</p>
              <ul>
                <li>${proposal.totalMonthlyHours.toFixed(0)} hours of service per month</li>
                <li>${proposal.walkthrough.daysPerWeek} days per week</li>
                <li>All necessary cleaning supplies and equipment</li>
                <li>Professional, trained staff</li>
              </ul>

              <div class="contact-info">
                <div class="contact-label">Questions? Contact us:</div>
                <div><strong>${proposal.user.email}</strong></div>
                ${proposal.user.phone ? `<div><strong>${proposal.user.phone}</strong></div>` : ''}
              </div>
            </div>

            <div class="footer">
              <p>This proposal is valid for 30 days from the date issued.</p>
              <p>Powered by W&P AI</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    // Update proposal status
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    })

    // Track activity
    await prisma.proposalActivity.create({
      data: {
        proposalId: proposal.id,
        activityType: 'sent',
        metadata: {
          sentTo: recipientEmail,
          sentAt: new Date().toISOString(),
          emailId: data?.id,
        },
      },
    })

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      proposalUrl,
    })
  } catch (error) {
    console.error('Error sending proposal:', error)
    return NextResponse.json({ error: 'Failed to send proposal' }, { status: 500 })
  }
}
