import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/positions/summary
 * Returns portfolio overview with key metrics
 */
export async function GET() {
  try {
    const supabase = createClient()

    // Get all active positions
    const { data: positions, error: positionsError } = await supabase
      .from('trading_positions')
      .select('*')
      .in('status', ['entered', 'scaling', 'trimming'])
      .order('entry_date', { ascending: false })

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
      return NextResponse.json(
        { error: 'Failed to fetch positions' },
        { status: 500 }
      )
    }

    // Get aggregate stats
    const { data: stats, error: statsError } = await supabase
      .from('aggregate_stats')
      .select('*')
      .eq('period', 'all_time')
      .single()

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error fetching stats:', statsError)
    }

    // Get latest portfolio snapshot
    const { data: snapshot, error: snapshotError } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single()

    if (snapshotError && snapshotError.code !== 'PGRST116') {
      console.error('Error fetching snapshot:', snapshotError)
    }

    // Calculate portfolio metrics
    const activePositions = positions || []
    const totalPositionValue = activePositions.reduce(
      (sum, pos) => sum + (pos.position_value || 0),
      0
    )
    const totalUnrealizedPnL = activePositions.reduce(
      (sum, pos) => sum + (pos.unrealized_pnl || 0),
      0
    )
    const avgRMultiple =
      activePositions.length > 0
        ? activePositions.reduce((sum, pos) => sum + (pos.r_multiple_current || 0), 0) /
          activePositions.length
        : 0

    // Sector allocation
    const sectorAllocation: Record<string, number> = {}
    activePositions.forEach((pos) => {
      const sector = pos.sector || 'Other'
      sectorAllocation[sector] = (sectorAllocation[sector] || 0) + (pos.position_value || 0)
    })

    // Convert to percentage
    const sectorAllocationPct: Record<string, number> = {}
    Object.keys(sectorAllocation).forEach((sector) => {
      sectorAllocationPct[sector] = totalPositionValue > 0 
        ? (sectorAllocation[sector] / totalPositionValue) * 100 
        : 0
    })

    const summary = {
      portfolio: {
        totalEquity: snapshot?.total_equity || 0,
        cash: snapshot?.cash || 0,
        buyingPower: snapshot?.buying_power || 0,
        totalPositionsValue: totalPositionValue,
        dailyPnL: snapshot?.daily_pnl || 0,
        dailyPnLPct: snapshot?.daily_pnl_pct || 0,
        cumulativePnL: snapshot?.cumulative_pnl || 0,
        cumulativePnLPct: snapshot?.cumulative_pnl_pct || 0,
        drawdownFromPeak: snapshot?.drawdown_from_peak || 0,
        peakEquity: snapshot?.peak_equity || 0,
      },
      positions: {
        activeCount: activePositions.length,
        totalValue: totalPositionValue,
        unrealizedPnL: totalUnrealizedPnL,
        unrealizedPnLPct: totalPositionValue > 0 
          ? (totalUnrealizedPnL / (totalPositionValue - totalUnrealizedPnL)) * 100 
          : 0,
        avgRMultiple: avgRMultiple,
      },
      performance: {
        totalTrades: stats?.total_trades || 0,
        winningTrades: stats?.winning_trades || 0,
        losingTrades: stats?.losing_trades || 0,
        winRate: stats?.win_rate || 0,
        expectancy: stats?.expectancy || 0,
        profitFactor: stats?.profit_factor || 0,
        avgWinPct: stats?.avg_win_pct || 0,
        avgLossPct: stats?.avg_loss_pct || 0,
        largestWin: stats?.largest_win || 0,
        largestLoss: stats?.largest_loss || 0,
        maxDrawdown: stats?.max_drawdown || 0,
      },
      sectors: sectorAllocationPct,
      lastUpdate: new Date().toISOString(),
    }

    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Unexpected error in /api/positions/summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
