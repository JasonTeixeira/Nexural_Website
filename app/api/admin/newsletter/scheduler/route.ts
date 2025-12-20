import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { NewsletterScheduler } from '@/lib/newsletter-scheduler'

// GET - Get scheduled campaigns summary
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const summary = await NewsletterScheduler.getScheduledCampaignsSummary()

    return NextResponse.json({
      success: true,
      summary
    })

  } catch (error) {
    console.error('Scheduler summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Process scheduled campaigns (manual trigger)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await NewsletterScheduler.processScheduledCampaigns()

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} campaigns. ${result.successful} successful, ${result.failed} failed.`,
      result
    })

  } catch (error) {
    console.error('Scheduler processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
