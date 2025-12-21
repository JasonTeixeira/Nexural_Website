import { NextResponse } from 'next/server'
import { getMLSignalGenerator } from '@/lib/ml-signal-generator'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🤖 ML Signal Generation Started')
    console.log('Time:', new Date().toISOString())

    // Generate signals
    const generator = getMLSignalGenerator({
      minConfidence: 0.7,
      minProbability: 0.6,
      symbols: ['ES', 'NQ', 'YM', 'RTY'],
      enabled: true
    })

    const signals = await generator.generateSignals()

    console.log(`✅ Generated ${signals.length} signals`)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      signals_generated: signals.length,
      signals: signals.map(s => ({
        symbol: s.symbol,
        direction: s.direction,
        entry: s.entry_price,
        confidence: s.confidence,
        probability: s.probability
      }))
    })
  } catch (error: any) {
    console.error('❌ ML signal generation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
