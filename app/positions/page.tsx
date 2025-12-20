'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Shield,
  Calendar,
  Eye,
  ExternalLink,
  CircleDot,
  Plus,
  Minus,
  XCircle,
  DoorClosed,
  FileText,
  PieChart,
  GitBranch,
  Bell,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { PortfolioHeatmap } from '@/components/positions/portfolio-heatmap'
import { EquityCurve } from '@/components/positions/equity-curve'
import { PositionSizingHeatmap } from '@/components/positions/position-sizing-heatmap'
import { PositionTimeline } from '@/components/positions/position-timeline'
import { TradingCalendar } from '@/components/positions/trading-calendar'
import { WatchlistCompact } from '@/components/positions/watchlist-compact'
import { WatchlistFull } from '@/components/positions/watchlist-full'

interface PortfolioSummary {
  portfolio: {
    totalEquity: number
    cash: number
    buyingPower: number
    totalPositionsValue: number
    dailyPnL: number
    dailyPnLPct: number
    cumulativePnL: number
    cumulativePnLPct: number
    drawdownFromPeak: number
  }
  positions: {
    activeCount: number
    totalValue: number
    unrealizedPnL: number
    unrealizedPnLPct: number
    avgRMultiple: number
  }
  performance: {
    totalTrades: number
    winRate: number
    expectancy: number
    profitFactor: number
  }
  sectors: Record<string, number>
}

interface Position {
  id: string
  ticker: string
  company_name: string
  direction: string
  status: 'open' | 'closed'
  entry_date: string
  exit_date: string | null
  entry_price: number
  current_price: number
  current_avg_price: number
  shares_contracts: number
  shares: number
  position_value: number
  portfolio_weight_pct: number
  portfolio_percentage: number
  stop_loss: number
  target_1: number
  target_2: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  r_multiple_current: number
  realized_pnl?: number
  realized_pnl_pct?: number
  sector: string
  setup_type: string
  conviction_level: string
  thesis: string
  daysHeld: number
}

interface RecentEvent {
  id: string
  type: string
  ticker: string
  companyName: string
  timeAgo: string
  price: number
  note: string
}

export default function PositionsPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch portfolio summary
      const summaryRes = await fetch('/api/positions/summary')
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      }

      // Fetch open positions
      const positionsRes = await fetch('/api/positions/open')
      if (positionsRes.ok) {
        const positionsData = await positionsRes.json()
        setPositions(positionsData.positions || [])
      }

      // Fetch recent events
      const eventsRes = await fetch('/api/positions/events/recent?limit=10')
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setRecentEvents(eventsData.events || [])
      }
    } catch (error) {
      console.error('Error fetching positions data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getRMultipleBadgeColor = (rMultiple: number) => {
    if (rMultiple < 0) return 'bg-red-500/20 text-red-400 border-red-500/30'
    if (rMultiple < 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    if (rMultiple < 2) return 'bg-green-500/20 text-green-400 border-green-500/30'
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  }

  const getEventIcon = (type: string) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'entered':
        return <CircleDot className={`${iconClass} text-green-400`} />
      case 'added':
        return <Plus className={`${iconClass} text-blue-400`} />
      case 'trimmed':
        return <Minus className={`${iconClass} text-yellow-400`} />
      case 'stopped_out':
        return <XCircle className={`${iconClass} text-red-400`} />
      case 'target_hit':
        return <Target className={`${iconClass} text-emerald-400`} />
      case 'closed':
        return <DoorClosed className={`${iconClass} text-gray-400`} />
      default:
        return <FileText className={`${iconClass} text-gray-400`} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading positions...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Portfolio Positions</h1>
          <p className="text-muted-foreground text-lg">
            Real-time transparency into every trade — see exactly what I'm holding, why I entered, and how it's performing.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Equity Card */}
          <Card className="premium-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Equity</p>
                  <p className="text-2xl font-bold text-white data-value">
                    {formatCurrency(summary?.portfolio.totalEquity || 0)}
                  </p>
                  <div className={`flex items-center mt-2 text-sm ${
                    (summary?.portfolio.dailyPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(summary?.portfolio.dailyPnL || 0) >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    <span className="data-value">
                      {formatCurrency(Math.abs(summary?.portfolio.dailyPnL || 0))} Today
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Positions Card */}
          <Card className="premium-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Positions</p>
                  <p className="text-2xl font-bold text-white data-value">
                    {summary?.positions.activeCount || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatCurrency(summary?.positions.totalValue || 0)} deployed
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unrealized P&L Card */}
          <Card className="premium-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Unrealized P&L</p>
                  <p className={`text-2xl font-bold data-value ${
                    (summary?.positions.unrealizedPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(summary?.positions.unrealizedPnL || 0)}
                  </p>
                  <p className={`text-sm mt-2 ${
                    (summary?.positions.unrealizedPnLPct || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPercent(summary?.positions.unrealizedPnLPct || 0)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  (summary?.positions.unrealizedPnL || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  <TrendingUp className={`w-6 h-6 ${
                    (summary?.positions.unrealizedPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Win Rate Card */}
          <Card className="premium-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                  <p className="text-2xl font-bold text-white data-value">
                    {(summary?.performance.winRate || 0).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {summary?.performance.totalTrades || 0} total trades
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Watchlist - Integrated */}
        <WatchlistCompact />

        {/* Section Divider */}
        <div className="flex items-center gap-4 my-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <h2 className="text-2xl font-semibold text-white">Portfolio Analysis</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid bg-card border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="heatmaps">Heatmaps</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Equity Curve */}
            <EquityCurve />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Open Positions List */}
              <div className="lg:col-span-2">
                <Card className="premium-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-primary" />
                          Open Positions
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Currently holding {positions.length} position{positions.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      <Link href="/positions/open">
                        <Button variant="outline" size="sm">
                          View All <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {positions.slice(0, 5).map((position) => (
                        <Link
                          key={position.id}
                          href={`/positions/${position.id}`}
                          className="block"
                        >
                          <div className="glass-card p-4 hover:bg-card/60 transition-all cursor-pointer border border-white/5 hover:border-white/10">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-lg font-bold text-white">
                                    {position.ticker}
                                  </h4>
                                  <Badge
                                    variant={position.direction === 'long' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {position.direction.toUpperCase()}
                                  </Badge>
                                  <Badge
                                    className={getRMultipleBadgeColor(position.r_multiple_current || 0)}
                                  >
                                    {(position.r_multiple_current || 0).toFixed(2)}R
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {position.company_name}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-lg font-bold data-value ${
                                  (position.unrealized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {formatCurrency(position.unrealized_pnl || 0)}
                                </p>
                                <p className={`text-sm ${
                                  (position.unrealized_pnl_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {formatPercent(position.unrealized_pnl_pct || 0)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Entry</span>
                                <p className="text-white font-semibold data-value">
                                  ${position.entry_price.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Current</span>
                                <p className="text-white font-semibold data-value">
                                  ${(position.current_price || 0).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Target</span>
                                <p className="text-green-400 font-semibold data-value">
                                  ${position.target_1.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}

                      {positions.length === 0 && (
                        <div className="text-center py-12">
                          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">No active positions</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Check back later for new trades
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Performance Stats */}
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="w-5 h-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Win Rate</span>
                        <span className="font-bold text-white data-value">
                          {(summary?.performance.winRate || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Expectancy</span>
                        <span className="font-bold text-white data-value">
                          +{(summary?.performance.expectancy || 0).toFixed(2)}R
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Profit Factor</span>
                        <span className="font-bold text-white data-value">
                          {(summary?.performance.profitFactor || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg R-Multiple</span>
                        <span className="font-bold text-white data-value">
                          {(summary?.positions.avgRMultiple || 0).toFixed(2)}R
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sector Allocation */}
                {summary?.sectors && Object.keys(summary.sectors).length > 0 && (
                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Sector Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(summary.sectors)
                          .sort((a, b) => b[1] - a[1])
                          .map(([sector, percentage]) => (
                            <div key={sector}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">{sector}</span>
                                <span className="text-white font-semibold data-value">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary rounded-full h-2 transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist">
            <WatchlistFull />
          </TabsContent>

          {/* Heatmaps Tab */}
          <TabsContent value="heatmaps" className="space-y-6">
            {positions.length > 0 ? (
              <>
                <PortfolioHeatmap positions={positions} />
                <PositionSizingHeatmap positions={positions} />
              </>
            ) : (
              <Card className="premium-card">
                <CardContent className="p-12 text-center">
                  <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No positions to visualize</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <PositionTimeline positions={positions} />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <TradingCalendar />
          </TabsContent>

          {/* Activity Feed Tab */}
          <TabsContent value="activity">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest position updates and trades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 glass-card border border-white/5"
                    >
                      <div className="flex-shrink-0">{getEventIcon(event.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white uppercase text-sm">
                            {event.type.replace('_', ' ')}
                          </span>
                          <span className="text-muted-foreground">—</span>
                          <span className="text-white font-semibold">{event.ticker}</span>
                        </div>
                        {event.note && (
                          <p className="text-sm text-muted-foreground mb-2">{event.note}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{event.timeAgo}</span>
                          {event.price && (
                            <span className="data-value">@ ${event.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {recentEvents.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
