import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'
import { getLatestPrices, isMarketOpen } from '@/lib/alpaca-client'

export const dynamic = 'force-dynamic'

/**
 * Cron Job: Update Swing Position Prices
 * 
 * Called every 60 seconds to update prices for all active swing positions
 * Only updates stock positions (not options)
 * Uses Alpaca free API for real-time data
 * 
 * Setup in Vercel:
 * - Go to Project Settings → Cron Jobs
 * - Add cron expression for every minute
 * - URL: /api/cron/update-prices
 */
export async function GET(request: Request) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabase = createClient()
    
    // Check if market is open (optional - still update if closed for after-hours)
    const marketOpen = await isMarketOpen()
    
    // Get all active swing positions (stocks only, not options)
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select('id, ticker, position_type')
      .eq('status', 'open')
      .eq('position_type', 'stock') // Only stocks, not options
      .not('ticker', 'is', null)

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
      return NextResponse.json(
        { error: 'Failed to fetch positions', details: positionsError },
        { status: 500 }
      )
    }

    if (!positions || positions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active positions to update',
        marketOpen,
        updated: 0,
      })
    }

    // Extract unique tickers
    const tickers = [...new Set(positions.map(p => p.ticker))]
    
    console.log(`Updating prices for ${tickers.length} tickers:`, tickers)

    // Fetch latest prices from Alpaca (batch request)
    const prices = await getLatestPrices(tickers)
    
    // Update each position
    const updates = []
    const errors = []
    
    for (const position of positions) {
      const price = prices[position.ticker]
      
      if (price) {
        try {
          const { error } = await supabase
            .from('positions')
            .update({
              current_price: price,
              last_price_update: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', position.id)

          if (error) {
            errors.push({ ticker: position.ticker, error: error.message })
          } else {
            updates.push({
              ticker: position.ticker,
              price: price,
              positionId: position.id,
            })
          }
        } catch (err) {
          errors.push({
            ticker: position.ticker,
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      } else {
        console.warn(`No price data for ${position.ticker}`)
      }
    }

    console.log(`Updated ${updates.length} positions`)
    if (errors.length > 0) {
      console.error('Errors during update:', errors)
    }

    return NextResponse.json({
      success: true,
      marketOpen,
      totalPositions: positions.length,
      updated: updates.length,
      failed: errors.length,
      updates,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
