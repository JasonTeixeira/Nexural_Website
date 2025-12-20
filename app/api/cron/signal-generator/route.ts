import { NextRequest, NextResponse } from 'next/server'
import { getSignalGenerator, startSignalGeneration } from '@/lib/signal-generator'

// POST - Automated cron job to ensure signal generator is running
export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'nexural_cron_secret_2024'
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request for signal generator')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Signal generator cron job running...')
    
    const generator = getSignalGenerator()
    const status = generator.getStatus()

    // If the generator is not running and should be enabled, start it
    if (!status.isRunning && status.config.enabled) {
      console.log('🚀 Starting signal generator via cron job...')
      await startSignalGeneration()
      
      return NextResponse.json({
        success: true,
        message: 'Signal generator started by cron job',
        timestamp: new Date().toISOString(),
        action: 'started',
        status: generator.getStatus()
      })
    }

    // If running, just return status
    if (status.isRunning) {
      console.log('✅ Signal generator is running normally')
      return NextResponse.json({
        success: true,
        message: 'Signal generator is running normally',
        timestamp: new Date().toISOString(),
        action: 'monitoring',
        status: status
      })
    }

    // If disabled, acknowledge but don't start
    console.log('⏸️ Signal generator is disabled')
    return NextResponse.json({
      success: true,
      message: 'Signal generator is disabled',
      timestamp: new Date().toISOString(),
      action: 'disabled',
      status: status
    })

  } catch (error) {
    console.error('Cron signal generator error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET - Health check for the signal generator cron job
export async function GET(request: NextRequest) {
  try {
    const generator = getSignalGenerator()
    const status = generator.getStatus()
    
    return NextResponse.json({
      success: true,
      message: 'Signal generator cron job is healthy',
      timestamp: new Date().toISOString(),
      status: {
        isRunning: status.isRunning,
        enabled: status.config.enabled,
        symbols: status.config.symbols.length,
        recentSignals: Object.values(status.recentSignalCounts).reduce((a, b) => a + b, 0),
        tradingHours: status.config.tradingHours
      }
    })

  } catch (error) {
    console.error('Signal generator cron health check error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
