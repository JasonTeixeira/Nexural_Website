import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/positions/stats
 * Returns aggregate performance statistics
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all_time'

    const supabase = createClient()

    // Get stats for requested period
    const { data: stats, error } = await supabase
      .from('aggregate_stats')
      .select('*')
      .eq('period', period)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    // If no stats exist, return default values
    if (!stats) {
      return NextResponse.json({
        period,
        stats: {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          breakevenTrades: 0,
          winRate: 0,
          avgWinPct: 0,
          avgLossPct: 0,
          avgWinR: 0,
          avgLossR: 0,
          expectancy: 0,
          profitFactor: 0,
          avgHoldDaysWinners: 0,
          avgHoldDaysLosers: 0,
          avgHoldDaysAll: 0,
          largestWin: 0,
          largestLoss: 0,
          largestWinR: 0,
          largestLossR: 0,
          maxDrawdown: 0,
          maxDrawdownPct: 0,
          sharpeEstimate: 0,
          bestSetupType: null,
          worstSetupType: null,
          bestSector: null,
          worstSector: null,
          totalGrossPnL: 0,
          totalNetPnL: 0,
        },
        lastUpdated: null,
      })
    }

    return NextResponse.json({
      period,
      stats: {
        totalTrades: stats.total_trades || 0,
        winningTrades: stats.winning_trades || 0,
        losingTrades: stats.losing_trades || 0,
        breakevenTrades: stats.breakeven_trades || 0,
        winRate: stats.win_rate || 0,
        avgWinPct: stats.avg_win_pct || 0,
        avgLossPct: stats.avg_loss_pct || 0,
        avgWinR: stats.avg_win_r || 0,
        avgLossR: stats.avg_loss_r || 0,
        expectancy: stats.expectancy || 0,
        profitFactor: stats.profit_factor || 0,
        avgHoldDaysWinners: stats.avg_hold_days_winners || 0,
        avgHoldDaysLosers: stats.avg_hold_days_losers || 0,
        avgHoldDaysAll: stats.avg_hold_days_all || 0,
        largestWin: stats.largest_win || 0,
        largestLoss: stats.largest_loss || 0,
        largestWinR: stats.largest_win_r || 0,
        largestLossR: stats.largest_loss_r || 0,
        maxDrawdown: stats.max_drawdown || 0,
        maxDrawdownPct: stats.max_drawdown_pct || 0,
        sharpeEstimate: stats.sharpe_estimate || 0,
        bestSetupType: stats.best_setup_type,
        worstSetupType: stats.worst_setup_type,
        bestSector: stats.best_sector,
        worstSector: stats.worst_sector,
        totalGrossPnL: stats.total_gross_pnl || 0,
        totalNetPnL: stats.total_net_pnl || 0,
      },
      lastUpdated: stats.updated_at,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Unexpected error in /api/positions/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
