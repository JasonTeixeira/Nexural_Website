import { NextRequest, NextResponse } from 'next/server'
import { emitDeletionGateHit } from '@/lib/deletion-gate'
import { requireAdmin, requireRole } from '@/lib/admin-rbac'

// NOTE: This file is legacy/migrate. Keep typing strict enough to satisfy
// the repo's typecheck while we retain it temporarily.
type AnyRow = Record<string, any>

// This endpoint is explicitly marked MIGRATE in docs/KEEP_MIGRATE_DELETE.md.
// We keep it temporarily but emit deletion-gate telemetry so we can safely remove.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  emitDeletionGateHit('legacy.api.admin.unified-dashboard', { method: 'GET' })
  const admin = await requireAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireRole(admin, ['owner', 'support'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    // Fetch all data in parallel for performance
    const [
      ibGatewayData,
      discordData,
      newsletterData,
      membersData,
      paperTradingData,
      marketDataInfo,
      mlMonitoringData,
      revenueData,
      databaseMetrics,
      recentActivity
    ] = await Promise.all([
      getIBGatewayData(),
      getDiscordData(),
      getNewsletterData(),
      getMembersData(),
      getPaperTradingData(),
      getMarketDataInfo(),
      getMLMonitoringData(),
      getRevenueData(),
      getDatabaseMetrics(),
      getRecentActivity()
    ])

    return NextResponse.json({
      success: true,
      data: {
        ibGateway: ibGatewayData,
        discord: discordData,
        newsletter: newsletterData,
        members: membersData,
        paperTrading: paperTradingData,
        marketData: marketDataInfo,
        mlMonitoring: mlMonitoringData,
        revenue: revenueData,
        databaseMetrics: databaseMetrics,
        recentActivity: recentActivity,
        systemHealth: {
          status: 'operational',
          timestamp: new Date().toISOString()
        }
      }
    })
  } catch (error) {
    console.error('Error fetching unified dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

function getSupabaseAdminClient() {
  // Lazy import to avoid pulling server-only code into edge bundles.
  // This route must run in nodejs runtime.
  const { createClient } = require('@supabase/supabase-js')
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase credentials not configured')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// ============================================================================
// IB GATEWAY DATA
// ============================================================================
async function getIBGatewayData() {
  try {
    const supabase = getSupabaseAdminClient()

    // Check if IB Gateway is connected (from your existing system)
    const origin = requestOrigin()
    const ibStatus = await fetch(`${origin}/api/admin/ib-gateway/status`)
      .then(res => res.json())
      .catch(() => ({ connected: false }))

    // Get positions from database
    const { data: positions } = await supabase
      .from('swing_positions')
      .select('*')
      .eq('status', 'active')

    // Get recent orders
    const { data: orders } = await supabase
      .from('swing_positions')
      .select('*')
      .order('entry_date', { ascending: false })
      .limit(5)

    return {
      isConnected: ibStatus.connected || false,
      positions: positions?.length || 0,
      orders: orders?.length || 0,
      accountBalance: 0, // Real balance from IB API when connected
      uptime: ibStatus.uptime || 0,
      reconnectAttempts: 0,
      recentEvents: (orders as AnyRow[] | null | undefined)?.map((order: AnyRow) => ({
        message: `${order.symbol} ${order.direction} order`,
        timestamp: order.created_at
      })) || [],
      positionsList: positions?.slice(0, 5) || []
    }
  } catch (error) {
    console.error('Error fetching IB Gateway data:', error)
    return {
      isConnected: false,
      positions: 0,
      orders: 0,
      accountBalance: 0,
      uptime: 0,
      reconnectAttempts: 0,
      recentEvents: [],
      positionsList: []
    }
  }
}

// ============================================================================
// DISCORD SIGNALS DATA
// ============================================================================
async function getDiscordData() {
  try {
    const supabase = getSupabaseAdminClient()

    // Get today's signals
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: signalsToday, count: todayCount } = await supabase
      .from('signals')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString())

    // Get total signals
    const { count: totalSignals } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })

    // Get recent signals
    const { data: recentSignals } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get last signal time
    const lastSignal = recentSignals?.[0]

    return {
      activeChannels: 21, // Your configured channels
      signalsToday: todayCount || 0,
      totalSignals: totalSignals || 0,
      lastSignalTime: lastSignal?.created_at || null,
      recentSignals: recentSignals || []
    }
  } catch (error) {
    console.error('Error fetching Discord data:', error)
    return {
      activeChannels: 21,
      signalsToday: 0,
      totalSignals: 0,
      lastSignalTime: null,
      recentSignals: []
    }
  }
}

// ============================================================================
// NEWSLETTER DATA
// ============================================================================
async function getNewsletterData() {
  try {
    const supabase = getSupabaseAdminClient()

    // Get total subscribers
    const { count: totalSubscribers } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get campaigns this month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { count: campaignsThisMonth } = await supabase
      .from('newsletter_campaigns')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', firstDayOfMonth.toISOString())

    // Get recent campaigns
    const { data: recentCampaigns } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(5)

    // Calculate average open rate from recent campaigns
    const campaignsWithStats = (recentCampaigns as AnyRow[] | null | undefined)?.filter((c: AnyRow) => c.sent_count > 0) || []
    const avgOpenRate = campaignsWithStats.length > 0
      ? campaignsWithStats.reduce((sum: number, c: AnyRow) => sum + ((c.opens || 0) / c.sent_count * 100), 0) / campaignsWithStats.length
      : 0

    // Get next scheduled campaign
    const { data: nextScheduled } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .single()

    return {
      totalSubscribers: totalSubscribers || 0,
      openRate: Math.round(avgOpenRate),
      campaignsThisMonth: campaignsThisMonth || 0,
      recentCampaigns: recentCampaigns || [],
      nextScheduled: nextScheduled || null
    }
  } catch (error) {
    console.error('Error fetching newsletter data:', error)
    return {
      totalSubscribers: 0,
      openRate: 0,
      campaignsThisMonth: 0,
      recentCampaigns: [],
      nextScheduled: null
    }
  }
}

// ============================================================================
// MEMBERS DATA
// ============================================================================
async function getMembersData() {
  try {
    const supabase = getSupabaseAdminClient()

    // Get total members
    const { count: total } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })

    // Get active members (with active subscription)
    const { count: active } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    // Get new members today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: newToday } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    // Calculate churn rate (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: churned } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'canceled')
      .gte('updated_at', thirtyDaysAgo.toISOString())

    const churnRate = (total || 0) > 0 ? Math.round((churned || 0) / (total || 1) * 100) : 0

    // Get recent members
    const { data: recent } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      total: total || 0,
      active: active || 0,
      newToday: newToday || 0,
      churnRate: churnRate,
      recent: recent || []
    }
  } catch (error) {
    console.error('Error fetching members data:', error)
    return {
      total: 0,
      active: 0,
      newToday: 0,
      churnRate: 0,
      recent: []
    }
  }
}

// ============================================================================
// PAPER TRADING DATA
// ============================================================================
async function getPaperTradingData() {
  try {
    const supabase = getSupabaseAdminClient()

    // Get paper trading config
    const { data: config } = await supabase
      .from('paper_trading_config')
      .select('*')
      .single()

    // Get active strategies
    const { data: strategies } = await supabase
      .from('paper_trading_config')
      .select('strategies')
      .single()

    const activeStrategies = strategies?.strategies?.filter((s: any) => s.enabled) || []

    // Get today's P&L from closed positions
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayTrades } = await supabase
      .from('swing_positions')
      .select('pnl')
      .eq('status', 'closed')
      .gte('exit_date', today.toISOString())

    const pnlToday = (todayTrades as AnyRow[] | null | undefined)?.reduce((sum: number, trade: AnyRow) => sum + (trade.pnl || 0), 0) || 0

    // Calculate win rate from all closed positions
    const { data: allTrades } = await supabase
      .from('swing_positions')
      .select('pnl')
      .eq('status', 'closed')

    const winningTrades = (allTrades as AnyRow[] | null | undefined)?.filter((trade: AnyRow) => (trade.pnl || 0) > 0) || []

    const winRate = allTrades && allTrades.length > 0
      ? Math.round((winningTrades.length / allTrades.length) * 100)
      : 0

    return {
      isEnabled: config?.enabled || false,
      activeStrategies: activeStrategies.length,
      pnlToday: Math.round(pnlToday * 100) / 100,
      winRate: winRate,
      totalTrades: allTrades?.length || 0,
      strategies: activeStrategies
    }
  } catch (error) {
    console.error('Error fetching paper trading data:', error)
    return {
      isEnabled: false,
      activeStrategies: 0,
      pnlToday: 0,
      winRate: 0,
      totalTrades: 0,
      strategies: []
    }
  }
}

// ============================================================================
// MARKET DATA INFO
// ============================================================================
async function getMarketDataInfo() {
  try {
    const supabase = getSupabaseAdminClient()

    // Get data points today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: dataPointsToday } = await supabase
      .from('multi_timeframe_data')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    // Get unique symbols
    const { data: symbolsData } = await supabase
      .from('multi_timeframe_data')
      .select('symbol')
      .limit(1000)

    const uniqueSymbols = symbolsData ? [...new Set((symbolsData as AnyRow[]).map((d: AnyRow) => d.symbol))] : []

    return {
      isConnected: true, // Databento connection
      symbols: uniqueSymbols.length,
      dataPointsToday: dataPointsToday || 0,
      provider: 'Databento',
      symbolsList: uniqueSymbols.slice(0, 20)
    }
  } catch (error) {
    console.error('Error fetching market data info:', error)
    return {
      isConnected: false,
      symbols: 0,
      dataPointsToday: 0,
      provider: 'Databento',
      symbolsList: []
    }
  }
}

// ============================================================================
// ML MONITORING DATA
// ============================================================================
async function getMLMonitoringData() {
  try {
    const supabase = getSupabaseAdminClient()

    // Get model metadata from database
    const { data: models } = await supabase
      .from('ml_model_metadata')
      .select('*')
      .order('created_at', { ascending: false })

    // Get active models (most recent version per symbol)
    const activeModels = (models as AnyRow[] | null | undefined)?.filter((m: AnyRow) => m.is_active) || []

    // Calculate average accuracy
    const avgAccuracy = activeModels.length > 0
      ? Math.round(activeModels.reduce((sum: number, m: AnyRow) => sum + (m.accuracy || 0), 0) / activeModels.length)
      : 0

    // Check if training is in progress
    const isTraining = (models as AnyRow[] | null | undefined)?.some((m: AnyRow) => m.training_status === 'training') || false

    // Get recent models
    const recentModels = (models as AnyRow[] | null | undefined)?.slice(0, 5).map((m: AnyRow) => ({
      name: m.model_name,
      accuracy: Math.round((m.accuracy || 0) * 100),
      version: m.version,
      trained_at: m.created_at
    })) || []

    return {
      activeModels: activeModels.length,
      totalModels: models?.length || 0,
      accuracy: avgAccuracy,
      lastTrained: models?.[0]?.created_at || null,
      trainingStatus: isTraining ? 'Training' : 'Idle',
      isTraining: isTraining,
      queueSize: 0,
      recentModels: recentModels
    }
  } catch (error) {
    console.error('Error fetching ML monitoring data:', error)
    return {
      activeModels: 0,
      totalModels: 0,
      accuracy: 0,
      lastTrained: null,
      trainingStatus: 'Idle',
      isTraining: false,
      queueSize: 0,
      recentModels: []
    }
  }
}

// ============================================================================
// REVENUE DATA
// ============================================================================
async function getRevenueData() {
  try {
    const supabase = getSupabaseAdminClient()

    // Get active subscriptions for MRR
    const { data: activeSubscriptions } = await supabase
      .from('members')
      .select('subscription_tier, subscription_price')
      .eq('subscription_status', 'active')

    const mrr = (activeSubscriptions as AnyRow[] | null | undefined)?.reduce(
      (sum: number, sub: AnyRow) => sum + (sub.subscription_price || 0),
      0
    ) || 0

    // Get today's revenue
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayPayments } = await supabase
      .from('members')
      .select('subscription_price')
      .eq('subscription_status', 'active')
      .gte('subscription_start_date', today.toISOString())

    const todayRevenue = (todayPayments as AnyRow[] | null | undefined)?.reduce(
      (sum: number, p: AnyRow) => sum + (p.subscription_price || 0),
      0
    ) || 0

    // Get failed payments this month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { count: failedPayments } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'past_due')
      .gte('updated_at', firstDayOfMonth.toISOString())

    // Get subscription breakdown
    const { data: allSubscriptions } = await supabase
      .from('members')
      .select('subscription_tier, subscription_price')
      .eq('subscription_status', 'active')

    const breakdown = (allSubscriptions as AnyRow[] | null | undefined)?.reduce((acc: any, sub: AnyRow) => {
      const tier = sub.subscription_tier || 'free'
      if (!acc[tier]) {
        acc[tier] = { plan: tier, count: 0, revenue: 0 }
      }
      acc[tier].count++
      acc[tier].revenue += sub.subscription_price || 0
      return acc
    }, {})

    const subscriptionBreakdown = Object.values(breakdown || {})

    // Calculate total revenue (all time)
    const totalRevenue = (activeSubscriptions as AnyRow[] | null | undefined)?.reduce(
      (sum: number, sub: AnyRow) => sum + (sub.subscription_price || 0),
      0
    ) || 0

    return {
      mrr: Math.round(mrr),
      todayRevenue: Math.round(todayRevenue),
      todayPayments: todayPayments?.length || 0,
      failedPayments: failedPayments || 0,
      subscriptionBreakdown: subscriptionBreakdown,
      totalRevenue: Math.round(totalRevenue)
    }
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return {
      mrr: 0,
      todayRevenue: 0,
      todayPayments: 0,
      failedPayments: 0,
      subscriptionBreakdown: [],
      totalRevenue: 0
    }
  }
}

// ============================================================================
// DATABASE METRICS
// ============================================================================
async function getDatabaseMetrics() {
  try {
    const supabase = getSupabaseAdminClient()

    // Get database size (approximate from row counts)
    const tables = [
      'members', 'signals', 'swing_positions', 'discord_connections'
    ]

    let totalRows = 0
    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      totalRows += count || 0
    }

    // Estimate size (rough approximation: 1KB per row)
    const estimatedSizeMB = Math.round(totalRows / 1024)
    const size = estimatedSizeMB > 1024 
      ? `${(estimatedSizeMB / 1024).toFixed(2)} GB`
      : `${estimatedSizeMB} MB`

    // Get last backup info
    const { data: lastBackup } = await supabase
      .from('backup_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get recent backups
    const { data: recentBackups } = await supabase
      .from('backup_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      size: size,
      tables: tables.length,
      queriesPerSecond: 0, // Would need real-time monitoring
      avgQueryTime: 0, // Would need real-time monitoring
      lastBackup: lastBackup?.created_at || null,
      backupSize: lastBackup?.size || 'N/A',
      isHealthy: true,
      activeConnections: 0, // Would need Supabase API
      maxConnections: 100,
      connectionUsage: 0,
      recentBackups: recentBackups || [],
      autoBackupEnabled: true
    }
  } catch (error) {
    console.error('Error fetching database metrics:', error)
    return {
      size: 'N/A',
      tables: 0,
      queriesPerSecond: 0,
      avgQueryTime: 0,
      lastBackup: null,
      backupSize: 'N/A',
      isHealthy: true,
      activeConnections: 0,
      maxConnections: 100,
      connectionUsage: 0,
      recentBackups: [],
      autoBackupEnabled: true
    }
  }
}

// ============================================================================
// RECENT ACTIVITY
// ============================================================================
async function getRecentActivity() {
  try {
    const supabase = getSupabaseAdminClient()

    const activities: any[] = []

    // Get recent signals
    const { data: signals } = await supabase
      .from('signals')
      .select('symbol, direction, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    ;(signals as AnyRow[] | null | undefined)?.forEach((signal: AnyRow) => {
      activities.push({
        type: 'signal',
        message: `${signal.symbol} ${signal.direction} signal sent`,
        timestamp: signal.created_at
      })
    })

    // Get recent members
    const { data: members } = await supabase
      .from('members')
      .select('email, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    ;(members as AnyRow[] | null | undefined)?.forEach((member: AnyRow) => {
      activities.push({
        type: 'member',
        message: `New member: ${member.email}`,
        timestamp: member.created_at
      })
    })

    // Get recent newsletter campaigns
    const { data: campaigns } = await supabase
      .from('newsletter_campaigns')
      .select('subject, sent_at')
      .order('sent_at', { ascending: false })
      .limit(3)

    ;(campaigns as AnyRow[] | null | undefined)?.forEach((campaign: AnyRow) => {
      activities.push({
        type: 'newsletter',
        message: `Newsletter sent: ${campaign.subject}`,
        timestamp: campaign.sent_at
      })
    })

    // Sort by timestamp and return top 20
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

function requestOrigin(): string {
  // Prefer APP_URL/SITE_URL, but fall back to localhost.
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  )
}
