import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch dashboard stats from the view we created
    const { data: stats, error: statsError } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single()

    if (statsError) {
      console.error('Error fetching dashboard stats:', statsError)
    }

    // Fetch open positions with details
    const { data: openPositions, error: positionsError } = await supabase
      .from('positions')
      .select(`
        id,
        symbol,
        direction,
        position_type,
        entry_price,
        current_price,
        quantity,
        stop_loss,
        target_price,
        status,
        unrealized_pnl,
        unrealized_pnl_pct,
        risk_dollars,
        risk_percent,
        actual_r_multiple,
        setup_type,
        time_frame,
        tags,
        opened_at
      `)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(20)

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
    }

    // Fetch recent closed positions
    const { data: recentClosed, error: closedError } = await supabase
      .from('positions')
      .select(`
        id,
        symbol,
        direction,
        position_type,
        entry_price,
        exit_price,
        quantity,
        realized_pnl,
        realized_pnl_pct,
        actual_r_multiple,
        setup_type,
        trade_grade,
        opened_at,
        closed_at
      `)
      .eq('status', 'closed')
      .order('closed_at', { ascending: false })
      .limit(10)

    if (closedError) {
      console.error('Error fetching closed positions:', closedError)
    }

    // Fetch recent members
    const { data: recentMembers, error: membersError } = await supabase
      .from('members')
      .select('id, name, email, subscription_status, tier, role, created_at, discord_access')
      .order('created_at', { ascending: false })
      .limit(10)

    if (membersError) {
      console.error('Error fetching members:', membersError)
    }

    // Fetch recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('position_activity')
      .select(`
        id,
        position_id,
        activity_type,
        description,
        timestamp,
        positions (symbol)
      `)
      .order('timestamp', { ascending: false })
      .limit(20)

    if (activityError) {
      console.error('Error fetching activity:', activityError)
    }

    // Calculate additional metrics
    const portfolioHeatPercent = stats?.portfolio_heat_dollars 
      ? ((stats.portfolio_heat_dollars / 100000) * 100).toFixed(2) // Assuming $100k account
      : '0.00'

    // Format the response
    const dashboardData = {
      stats: {
        members: {
          total: stats?.total_members || 0,
          active: stats?.active_members || 0,
          premium: stats?.premium_members || 0,
          newThisWeek: stats?.new_members_week || 0,
          newThisMonth: stats?.new_members_month || 0,
        },
        positions: {
          open: stats?.open_positions || 0,
          swings: stats?.open_swings || 0,
          options: stats?.open_options || 0,
          closed: stats?.closed_positions || 0,
        },
        performance: {
          totalUnrealizedPnl: stats?.total_unrealized_pnl || 0,
          todayPnl: stats?.today_pnl || 0,
          weekPnl: stats?.week_pnl || 0,
          monthPnl: stats?.month_pnl || 0,
          winRate: stats?.overall_win_rate || 0,
        },
        risk: {
          portfolioHeatDollars: stats?.portfolio_heat_dollars || 0,
          portfolioHeatPercent: parseFloat(portfolioHeatPercent),
          avgRiskPercent: stats?.avg_risk_percent || 0,
        },
        activity: {
          last24h: stats?.activity_last_24h || 0,
          notesLast24h: stats?.notes_last_24h || 0,
        },
      },
      openPositions: openPositions || [],
      recentClosed: recentClosed || [],
      recentMembers: recentMembers || [],
      recentActivity: (recentActivity || []).map((activity: any) => ({
        id: activity.id,
        type: activity.activity_type,
        symbol: activity.positions?.symbol || 'N/A',
        message: activity.description,
        timestamp: activity.timestamp,
      })),
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Admin dashboard API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
