import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession, extractToken } from '@/lib/server-session-service'
import { adminDataService } from '@/lib/admin-data-service'
import { createClient } from '@supabase/supabase-js'

// Helper function to get Supabase client at runtime
function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase credentials not configured')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader)
    const auth = await requireAdminSession(token)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'

    // Calculate date range
    const now = new Date()
    const daysAgo = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    // Get revenue analytics
    const revenueData = await getRevenueAnalytics(startDate, now)
    
    // Get member analytics
    const memberData = await getMemberAnalytics(startDate, now)
    
    // Get signal analytics
    const signalData = await getSignalAnalytics(startDate, now)
    
    // Get engagement analytics
    const engagementData = await getEngagementAnalytics(startDate, now)

    return NextResponse.json({
      success: true,
      analytics: {
        revenue: revenueData,
        members: memberData,
        signals: signalData,
        engagement: engagementData
      }
    })

  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

async function getRevenueAnalytics(startDate: Date, endDate: Date) {
  try {
    const supabase = getSupabaseClient()
    
    // Get all payments in timeframe
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, created_at, status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'succeeded')

    // Calculate daily revenue
    const dailyRevenue: Record<string, number> = {}
    payments?.forEach(payment => {
      const date = new Date(payment.created_at).toISOString().split('T')[0]
      dailyRevenue[date] = (dailyRevenue[date] || 0) + payment.amount
    })

    const daily = Object.entries(dailyRevenue).map(([date, amount]) => ({
      date,
      amount: Math.round(amount / 100) // Convert cents to dollars
    }))

    // Calculate MRR (Monthly Recurring Revenue)
    const { data: activeSubscriptions } = await supabase
      .from('members')
      .select('subscription_tier, billing_cycle')
      .eq('subscription_status', 'active')

    let mrr = 0
    activeSubscriptions?.forEach(sub => {
      const tierPrices: Record<string, number> = {
        basic: 97,
        premium: 297,
        pro: 497
      }
      const price = tierPrices[sub.subscription_tier] || 0
      mrr += sub.billing_cycle === 'annual' ? price / 12 : price
    })

    // Calculate growth rate
    const lastMonthStart = new Date(endDate.getTime() - 60 * 24 * 60 * 60 * 1000)
    const lastMonthEnd = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const { data: lastMonthPayments } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString())
      .eq('status', 'succeeded')

    const lastMonthRevenue = lastMonthPayments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const thisMonthRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const growth = lastMonthRevenue > 0 
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0

    return {
      daily,
      weekly: [], // Can be calculated if needed
      monthly: [], // Can be calculated if needed
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      growth
    }
  } catch (error) {
    console.error('Error getting revenue analytics:', error)
    return {
      daily: [],
      weekly: [],
      monthly: [],
      mrr: 0,
      arr: 0,
      growth: 0
    }
  }
}

async function getMemberAnalytics(startDate: Date, endDate: Date) {
  try {
    const supabase = getSupabaseClient()
    
    // Get total members
    const { count: totalMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })

    // Get active members
    const { count: activeMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    // Get new members this month
    const monthStart = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
    const { count: newThisMonth } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString())

    // Get members by tier
    const { data: membersByTier } = await supabase
      .from('members')
      .select('subscription_tier')
      .eq('subscription_status', 'active')

    const byTier: Record<string, number> = {}
    membersByTier?.forEach(m => {
      byTier[m.subscription_tier] = (byTier[m.subscription_tier] || 0) + 1
    })

    // Calculate churn rate (simplified)
    const lastMonthStart = new Date(endDate.getTime() - 60 * 24 * 60 * 60 * 1000)
    const { count: cancelledLastMonth } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'cancelled')
      .gte('updated_at', lastMonthStart.toISOString())

    const churnRate = activeMembers ? Math.round((cancelledLastMonth || 0) / activeMembers * 100) : 0
    const retentionRate = 100 - churnRate

    // Calculate growth rate
    const lastMonthEnd = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    const { count: membersLastMonth } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', lastMonthEnd.toISOString())

    const growthRate = membersLastMonth 
      ? Math.round(((totalMembers || 0) - membersLastMonth) / membersLastMonth * 100)
      : 0

    return {
      total: totalMembers || 0,
      active: activeMembers || 0,
      new_this_month: newThisMonth || 0,
      churn_rate: churnRate,
      growth_rate: growthRate,
      by_tier: byTier,
      retention_rate: retentionRate
    }
  } catch (error) {
    console.error('Error getting member analytics:', error)
    return {
      total: 0,
      active: 0,
      new_this_month: 0,
      churn_rate: 0,
      growth_rate: 0,
      by_tier: {},
      retention_rate: 0
    }
  }
}

async function getSignalAnalytics(startDate: Date, endDate: Date) {
  try {
    const supabase = getSupabaseClient()
    
    // Get all signals in timeframe
    const { data: signals } = await supabase
      .from('trading_signals')
      .select('symbol, status, entry_price, exit_price, realized_pnl')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const total = signals?.length || 0
    const closedSignals = signals?.filter(s => s.status === 'CLOSED') || []
    const winningSignals = closedSignals.filter(s => (s.realized_pnl || 0) > 0)
    
    const winRate = closedSignals.length > 0 
      ? Math.round((winningSignals.length / closedSignals.length) * 100)
      : 0

    const avgProfit = winningSignals.length > 0
      ? Math.round(winningSignals.reduce((sum, s) => sum + (s.realized_pnl || 0), 0) / winningSignals.length)
      : 0

    // Performance by symbol
    const symbolStats: Record<string, { count: number; wins: number }> = {}
    closedSignals.forEach(signal => {
      if (!symbolStats[signal.symbol]) {
        symbolStats[signal.symbol] = { count: 0, wins: 0 }
      }
      symbolStats[signal.symbol].count++
      if ((signal.realized_pnl || 0) > 0) {
        symbolStats[signal.symbol].wins++
      }
    })

    const bySymbol = Object.entries(symbolStats).map(([symbol, stats]) => ({
      symbol,
      count: stats.count,
      win_rate: Math.round((stats.wins / stats.count) * 100)
    }))

    return {
      total,
      win_rate: winRate,
      avg_profit: avgProfit,
      by_symbol: bySymbol,
      performance_trend: [] // Can be calculated if needed
    }
  } catch (error) {
    console.error('Error getting signal analytics:', error)
    return {
      total: 0,
      win_rate: 0,
      avg_profit: 0,
      by_symbol: [],
      performance_trend: []
    }
  }
}

async function getEngagementAnalytics(startDate: Date, endDate: Date) {
  try {
    const supabase = getSupabaseClient()
    
    // Get daily active users (members who logged in today)
    const today = new Date().toISOString().split('T')[0]
    const { count: dailyActiveUsers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', today)

    // Get average session duration (simplified - would need session tracking)
    const avgSessionDuration = 15 // Default 15 minutes

    // Get signals per user
    const { data: signals } = await supabase
      .from('trading_signals')
      .select('id')
      .gte('created_at', startDate.toISOString())

    const { count: activeMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    const signalsPerUser = activeMembers && signals 
      ? Math.round(signals.length / activeMembers)
      : 0

    // Discord engagement (members with discord_id)
    const { count: membersWithDiscord } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .not('discord_id', 'is', null)
      .eq('subscription_status', 'active')

    const discordEngagement = activeMembers && membersWithDiscord
      ? Math.round((membersWithDiscord / activeMembers) * 100)
      : 0

    return {
      daily_active_users: dailyActiveUsers || 0,
      avg_session_duration: avgSessionDuration,
      signals_per_user: signalsPerUser,
      discord_engagement: discordEngagement
    }
  } catch (error) {
    console.error('Error getting engagement analytics:', error)
    return {
      daily_active_users: 0,
      avg_session_duration: 0,
      signals_per_user: 0,
      discord_engagement: 0
    }
  }
}
