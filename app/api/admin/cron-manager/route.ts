import { NextRequest, NextResponse } from 'next/server'
import { cronManager } from '@/lib/cron-scheduler'

export async function GET(req: NextRequest) {
  try {
    const status = cronManager.status()
    
    return NextResponse.json({
      message: 'Cron Job Manager',
      description: 'Automated scheduling system for trading reports and data collection',
      status: status,
      schedule: {
        dailyReport: 'Every day at 8:00 PM EST',
        marketData: 'Hourly 9 AM-4 PM EST (Mon-Fri)',
        performance: 'Daily at 5:00 PM EST (Mon-Fri)',
        portfolio: 'Daily at 5:30 PM EST (Mon-Fri)',
        healthCheck: 'Every 6 hours',
        weeklyReport: 'Sundays at 6:00 PM EST'
      },
      availableActions: {
        initialize: 'POST with {"action": "initialize"}',
        startAll: 'POST with {"action": "startAll"}',
        stopAll: 'POST with {"action": "stopAll"}',
        startJob: 'POST with {"action": "start", "job": "jobName"}',
        stopJob: 'POST with {"action": "stop", "job": "jobName"}',
        triggerDaily: 'POST with {"action": "triggerDaily"}',
        status: 'GET request (this endpoint)'
      },
      jobs: [
        'dailyReport',
        'marketData', 
        'performance',
        'portfolio',
        'healthCheck',
        'weeklyReport'
      ]
    })
  } catch (error) {
    console.error('❌ Error getting cron status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get cron job status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, job } = body

    console.log(`🔧 Cron manager action: ${action}`)

    let result
    let message

    switch (action) {
      case 'initialize':
        cronManager.initialize()
        result = { initialized: true }
        message = 'Cron jobs initialized successfully'
        break

      case 'startAll':
        cronManager.startAll()
        result = { started: 'all' }
        message = 'All cron jobs started successfully'
        break

      case 'stopAll':
        cronManager.stopAll()
        result = { stopped: 'all' }
        message = 'All cron jobs stopped successfully'
        break

      case 'start':
        if (!job) {
          return NextResponse.json({
            success: false,
            error: 'Job name required for start action'
          }, { status: 400 })
        }
        const startSuccess = cronManager.start(job)
        result = { started: job, success: startSuccess }
        message = startSuccess ? `Cron job ${job} started successfully` : `Failed to start cron job ${job}`
        break

      case 'stop':
        if (!job) {
          return NextResponse.json({
            success: false,
            error: 'Job name required for stop action'
          }, { status: 400 })
        }
        const stopSuccess = cronManager.stop(job)
        result = { stopped: job, success: stopSuccess }
        message = stopSuccess ? `Cron job ${job} stopped successfully` : `Failed to stop cron job ${job}`
        break

      case 'triggerDaily':
        result = await cronManager.triggerDaily()
        message = 'Daily report triggered manually'
        break

      case 'status':
        result = cronManager.status()
        message = 'Cron job status retrieved'
        break

      case 'schedule':
        cronManager.logSchedule()
        result = { logged: true }
        message = 'Schedule logged to console'
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: ['initialize', 'startAll', 'stopAll', 'start', 'stop', 'triggerDaily', 'status', 'schedule']
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      action: action,
      result: result,
      message: message,
      currentStatus: cronManager.status(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error managing cron jobs:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to manage cron jobs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
