import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// POST /api/ai/pricing-suggestion
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
    const { walkthroughId, proposalId } = body

    if (!walkthroughId) {
      return NextResponse.json({ error: 'Walkthrough ID required' }, { status: 400 })
    }

    // Get walkthrough details
    const walkthrough = await prisma.walkthrough.findFirst({
      where: {
        id: walkthroughId,
        userId: user.id,
      },
      include: {
        rooms: true,
        client: true,
      },
    })

    if (!walkthrough) {
      return NextResponse.json({ error: 'Walkthrough not found' }, { status: 404 })
    }

    // Get user pricing settings
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    })

    // Get historical proposals for learning
    const historicalProposals = await prisma.proposal.findMany({
      where: {
        userId: user.id,
        status: { in: ['won', 'lost', 'sent'] },
      },
      include: {
        walkthrough: {
          include: {
            rooms: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Calculate walkthrough metrics
    const totalMinutes = walkthrough.rooms.reduce(
      (sum, room) => sum + room.estimatedMinutes,
      0
    )
    const totalHoursPerDay = totalMinutes / 60
    const totalHoursPerMonth =
      totalHoursPerDay * walkthrough.daysPerWeek * 4.33

    const laborCost = (userData?.hourlyWage || 20) * totalHoursPerMonth
    const targetMargin = userData?.targetMargin || 0.3

    // Prepare context for Claude
    const context = {
      facilityType: walkthrough.facilityType || 'Unknown',
      totalSqft: walkthrough.totalSqft,
      totalRooms: walkthrough.rooms.length,
      totalHoursPerMonth,
      daysPerWeek: walkthrough.daysPerWeek,
      serviceFrequency: walkthrough.serviceFrequency,
      laborCost,
      targetMargin,
      historicalData: historicalProposals.map((p) => ({
        status: p.status,
        customerRate: p.customerRate,
        profitMargin: p.profitMargin,
        monthlyPrice: p.monthlyPrice,
        totalHours: p.totalMonthlyHours,
        facilityType: p.walkthrough.facilityType,
        roomCount: p.walkthrough.rooms.length,
      })),
    }

    // Call Claude API for pricing suggestion
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a pricing expert for janitorial services. Based on the following data, suggest an optimal customer rate ($/hour) for this proposal.

Context:
- Facility Type: ${context.facilityType}
- Total Square Feet: ${context.totalSqft || 'Unknown'}
- Number of Rooms: ${context.totalRooms}
- Service: ${context.serviceFrequency}, ${context.daysPerWeek} days/week
- Total Monthly Hours: ${context.totalHoursPerMonth.toFixed(2)}
- Labor Cost: $${context.laborCost.toFixed(2)}
- Target Profit Margin: ${(context.targetMargin * 100).toFixed(0)}%

Historical Performance:
${context.historicalData.length > 0 ? context.historicalData.map((h, i) => `${i + 1}. ${h.facilityType || 'Unknown'} - $${h.customerRate}/hr - ${h.status} (${h.profitMargin.toFixed(1)}% margin)`).join('\n') : 'No historical data available'}

Please provide:
1. Recommended customer rate ($/hour) as a single number
2. Confidence level (0-100)
3. Brief reasoning (2-3 sentences)
4. Mention 1-2 similar historical projects if available

Format your response as JSON:
{
  "suggestedRate": number,
  "confidence": number,
  "reasoning": "string",
  "similarProjects": ["string"]
}`,
        },
      ],
    })

    // Parse Claude's response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const aiResponse = JSON.parse(jsonMatch[0])

    // Calculate projected metrics with suggested rate
    const suggestedMonthlyPrice = aiResponse.suggestedRate * totalHoursPerMonth
    const suggestedProfit = suggestedMonthlyPrice - laborCost
    const suggestedMargin = (suggestedProfit / suggestedMonthlyPrice) * 100

    // Save AI suggestion to database if proposalId provided
    let savedSuggestion = null
    if (proposalId) {
      savedSuggestion = await prisma.aISuggestion.upsert({
        where: { proposalId },
        update: {
          suggestedRate: aiResponse.suggestedRate,
          confidence: aiResponse.confidence / 100,
          reasoning: aiResponse.reasoning,
          similarProjects: aiResponse.similarProjects || [],
        },
        create: {
          proposalId,
          suggestedRate: aiResponse.suggestedRate,
          confidence: aiResponse.confidence / 100,
          reasoning: aiResponse.reasoning,
          similarProjects: aiResponse.similarProjects || [],
        },
      })
    }

    return NextResponse.json({
      suggestedRate: aiResponse.suggestedRate,
      confidence: aiResponse.confidence,
      reasoning: aiResponse.reasoning,
      similarProjects: aiResponse.similarProjects || [],
      projectedMetrics: {
        monthlyPrice: suggestedMonthlyPrice,
        profit: suggestedProfit,
        profitMargin: suggestedMargin,
      },
      suggestion: savedSuggestion,
    })
  } catch (error) {
    console.error('Error getting AI pricing suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to get pricing suggestion' },
      { status: 500 }
    )
  }
}

// POST /api/ai/pricing-suggestion/feedback
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { suggestionId, accepted, feedback } = body

    const suggestion = await prisma.aISuggestion.update({
      where: { id: suggestionId },
      data: {
        userAccepted: accepted,
        userFeedback: feedback,
      },
    })

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error('Error saving feedback:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
