/**
 * Newsletter Sequence Cron Job
 * Runs hourly to send scheduled emails
 * 
 * Setup with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/newsletter-sequences",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { processNewsletterSequences } from '@/lib/newsletter-automation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // SSOT: standardize cron auth on x-cron-token
    const token = request.headers.get('x-cron-token')
    if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('🚀 Newsletter cron job started')
    const startTime = Date.now()
    
    // Process all newsletter sequences
    const result = await processNewsletterSequences()
    
    const duration = Date.now() - startTime
    
    console.log(`✅ Newsletter cron job completed in ${duration}ms`)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      ...result
    })
    
  } catch (error) {
    console.error('❌ Newsletter cron job failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
