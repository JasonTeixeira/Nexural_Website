import { NextRequest, NextResponse } from 'next/server'
import { NewsletterScheduler } from '@/lib/newsletter-scheduler'

// POST - Automated cron job for processing scheduled campaigns
export async function POST(request: NextRequest) {
  try {
    // SSOT: standardize cron auth on x-cron-token
    const token = request.headers.get('x-cron-token')
    if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
      console.error('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Processing scheduled newsletter campaigns...')
    
    const result = await NewsletterScheduler.processScheduledCampaigns()

    // Log the results
    if (result.processed > 0) {
      console.log(`Newsletter scheduler processed ${result.processed} campaigns:`)
      console.log(`- Successful: ${result.successful}`)
      console.log(`- Failed: ${result.failed}`)
      
      if (result.errors.length > 0) {
        console.error('Scheduler errors:', result.errors)
      }
    } else {
      console.log('No scheduled campaigns to process')
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} campaigns`,
      timestamp: new Date().toISOString(),
      result: {
        processed: result.processed,
        successful: result.successful,
        failed: result.failed,
        hasErrors: result.errors.length > 0
      }
    })

  } catch (error) {
    console.error('Cron newsletter scheduler error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET - Health check for the cron job
export async function GET(request: NextRequest) {
  try {
    // SSOT: standardize cron auth on x-cron-token
    const token = request.headers.get('x-cron-token')
    if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const summary = await NewsletterScheduler.getScheduledCampaignsSummary()
    
    return NextResponse.json({
      success: true,
      message: 'Newsletter scheduler is healthy',
      timestamp: new Date().toISOString(),
      summary: {
        total_scheduled: summary.total,
        upcoming: summary.upcoming,
        overdue: summary.overdue
      }
    })

  } catch (error) {
    console.error('Newsletter scheduler health check error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
