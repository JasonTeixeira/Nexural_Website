'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, TrendingUp, TrendingDown, Target, Clock, DollarSign, Activity } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TimeframeStats {
  timeframe: string
  totalTrades: number
  openPositions: number
  closedPositions: number
  winners: number
  losers: number
  winRate: number
  totalPnL: number
  avgPnL: number
  avgWin: number
  avgLoss: number
  avgRMultiple: number
  avgHoldDays: number
  totalRisk: number
  bestTrade: number
  worstTrade: number
  profitFactor: number
}

const COLORS = {
  swing: '#3b82f6',
  day: '#fbbf24',
  position: '#22c55e',
  default: '#6366f1'
}

const getTimeframeBadge = (timeframe: string) => {
  switch (timeframe) {
    case 'day':
      return { label: 'Day Trade', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
    case 'swing':
      return { label: 'Swing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    case 'position':
      return { label: 'Position', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    default:
      return { label: timeframe, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  }
}

export default function AnalyticsPage() {
  const [positions, setPositions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all')

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .order('entry_date', { ascending: false })

    if (error) {
      console.error('Error fetching positions:', error)
    } else {
      setPositions(data || [])
    }
    setLoading(false)
  }

  // Calculate comprehensive stats per timeframe
  const calculateTimeframeStats = (timeframe: string): TimeframeStats => {
    const filtered = timeframe === 'all' 
      ? positions 
      : positions.filter(p => p.time_frame === timeframe)

    const open = filtered.filter(p => p.status === 'open')
    const closed = filtered.filter(p => p.status === 'closed')
    
    const winners = closed.filter(p => (p.realized_pnl || 0) > 0)
    const losers = closed.filter(p => (p.realized_pnl || 0) < 0)
    
    const totalPnL = closed.reduce((sum, p) => sum + (p.realized_pnl || 0), 0)
    const avgPnL = closed.length > 0 ? totalPnL / closed.length : 0
    
    const totalWins = winners.reduce((sum, p) => sum + (p.realized_pnl || 0), 0)
    const totalLosses = Math.abs(losers.reduce((sum, p) => sum + (p.realized_pnl || 0), 0))
    const avgWin = winners.length > 0 ? totalWins / winners.length : 0
    const avgLoss = losers.length > 0 ? totalLosses / losers.length : 0
    
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0
    
    const rMultiples = closed.filter(p => p.actual_r_multiple).map(p => p.actual_r_multiple)
    const avgRMultiple = rMultiples.length > 0 
      ? rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length 
      : 0
    
    const holdDays = closed.filter(p => p.actual_hold_days).map(p => p.actual_hold_days)
    const avgHoldDays = holdDays.length > 0
      ? holdDays.reduce((sum, d) => sum + d, 0) / holdDays.length
      : 0
    
    const totalRisk = open.reduce((sum, p) => sum + (p.risk_dollars || 0), 0)
    
    const pnls = closed.map(p => p.realized_pnl || 0)
    const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0
    const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0

    return {
      timeframe,
      totalTrades: filtered.length,
      openPositions: open.length,
      closedPositions: closed.length,
      winners: winners.length,
      losers: losers.length,
      winRate: closed.length > 0 ? (winners.length / closed.length) * 100 : 0,
      totalPnL,
      avgPnL,
      avgWin,
      avgLoss,
      avgRMultiple,
      avgHoldDays,
      totalRisk,
      bestTrade,
      worstTrade,
      profitFactor
    }
  }

  const allStats = calculateTimeframeStats('all')
  const swingStats = calculateTimeframeStats('swing')
  const dayStats = calculateTimeframeStats('day')
  const positionStats = calculateTimeframeStats('position')

  // Comparison data for charts
  const comparisonData = [
    { name: 'Swing', winRate: swingStats.winRate, avgPnL: swingStats.avgPnL, trades: swingStats.closedPositions, color: COLORS.swing },
    { name: 'Day', winRate: dayStats.winRate, avgPnL: dayStats.avgPnL, trades: dayStats.closedPositions, color: COLORS.day },
    { name: 'Position', winRate: positionStats.winRate, avgPnL: positionStats.avgPnL, trades: positionStats.closedPositions, color: COLORS.position },
  ]

  const profitFactorData = [
    { name: 'Swing', value: swingStats.profitFactor, fill: COLORS.swing },
    { name: 'Day', value: dayStats.profitFactor, fill: COLORS.day },
    { name: 'Position', value: positionStats.profitFactor, fill: COLORS.position },
  ]

  const rMultipleData = [
    { name: 'Swing', rMultiple: swingStats.avgRMultiple, holdDays: swingStats.avgHoldDays },
    { name: 'Day', rMultiple: dayStats.avgRMultiple, holdDays: dayStats.avgHoldDays },
    { name: 'Position', rMultiple: positionStats.avgRMultiple, holdDays: positionStats.avgHoldDays },
  ]

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const currentStats = selectedTimeframe === 'all' ? allStats :
                       selectedTimeframe === 'swing' ? swingStats :
                       selectedTimeframe === 'day' ? dayStats : positionStats

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <Link href="/admin/positions">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Positions
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Strategy Analytics</h1>
        <p className="text-muted-foreground">
          Compare performance across different trading timeframes
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-3 mb-8">
        <Button
          variant={selectedTimeframe === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedTimeframe('all')}
        >
          All Strategies
        </Button>
        <Button
          variant={selectedTimeframe === 'swing' ? 'default' : 'outline'}
          onClick={() => setSelectedTimeframe('swing')}
          className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
        >
          Swing Trades
        </Button>
        <Button
          variant={selectedTimeframe === 'day' ? 'default' : 'outline'}
          onClick={() => setSelectedTimeframe('day')}
          className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
        >
          Day Trades
        </Button>
        <Button
          variant={selectedTimeframe === 'position' ? 'default' : 'outline'}
          onClick={() => setSelectedTimeframe('position')}
          className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
        >
          Position Trades
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.winners}W / {currentStats.losers}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {currentStats.totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentStats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${currentStats.totalPnL >= 0 ? '+' : ''}{currentStats.totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentStats.closedPositions} closed trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg R-Multiple</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentStats.avgRMultiple >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {currentStats.avgRMultiple.toFixed(2)}R
            </div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hold Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.avgHoldDays.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              days per trade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Win Rate Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Win Rate by Strategy</CardTitle>
            <CardDescription>Compare success rates across timeframes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  formatter={(value: any) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="winRate" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average P&L Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Average P&L per Trade</CardTitle>
            <CardDescription>Profitability comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  formatter={(value: any) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="avgPnL" radius={[8, 8, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* R-Multiple vs Hold Time */}
        <Card>
          <CardHeader>
            <CardTitle>R-Multiple vs Hold Time</CardTitle>
            <CardDescription>Efficiency analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rMultipleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis yAxisId="left" stroke="#888" />
                <YAxis yAxisId="right" orientation="right" stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="rMultiple" stroke="#22c55e" strokeWidth={2} name="R-Multiple" />
                <Line yAxisId="right" type="monotone" dataKey="holdDays" stroke="#3b82f6" strokeWidth={2} name="Hold Days" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Factor */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Factor by Strategy</CardTitle>
            <CardDescription>Wins vs losses ratio (higher is better)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitFactorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="name" type="category" stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  formatter={(value: any) => value.toFixed(2)}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {profitFactorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
          <CardDescription>Comprehensive breakdown by strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Strategy</th>
                  <th className="text-right py-3 px-4 font-semibold">Trades</th>
                  <th className="text-right py-3 px-4 font-semibold">Win Rate</th>
                  <th className="text-right py-3 px-4 font-semibold">Total P&L</th>
                  <th className="text-right py-3 px-4 font-semibold">Avg Win</th>
                  <th className="text-right py-3 px-4 font-semibold">Avg Loss</th>
                  <th className="text-right py-3 px-4 font-semibold">Best Trade</th>
                  <th className="text-right py-3 px-4 font-semibold">Worst Trade</th>
                  <th className="text-right py-3 px-4 font-semibold">Profit Factor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { stats: swingStats, label: 'Swing', badge: getTimeframeBadge('swing') },
                  { stats: dayStats, label: 'Day', badge: getTimeframeBadge('day') },
                  { stats: positionStats, label: 'Position', badge: getTimeframeBadge('position') },
                ].map(({ stats, label, badge }) => (
                  <tr key={label} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4">
                      <Badge className={badge.color}>{badge.label}</Badge>
                    </td>
                    <td className="text-right py-3 px-4">{stats.closedPositions}</td>
                    <td className="text-right py-3 px-4 font-semibold">{stats.winRate.toFixed(1)}%</td>
                    <td className={`text-right py-3 px-4 font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4 text-green-400">${stats.avgWin.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 text-red-400">-${stats.avgLoss.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 text-green-400">${stats.bestTrade.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 text-red-400">${stats.worstTrade.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-semibold">{stats.profitFactor.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Strategy Insights</CardTitle>
          <CardDescription>Key findings and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Best Strategy */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Best Performing Strategy
              </h3>
              <p className="text-sm text-muted-foreground">
                {swingStats.profitFactor > dayStats.profitFactor && swingStats.profitFactor > positionStats.profitFactor
                  ? `Swing trades show the highest profit factor (${swingStats.profitFactor.toFixed(2)}). Consider increasing allocation to this strategy.`
                  : dayStats.profitFactor > positionStats.profitFactor
                  ? `Day trades show the highest profit factor (${dayStats.profitFactor.toFixed(2)}). Your short-term timing is excellent.`
                  : `Position trades show the highest profit factor (${positionStats.profitFactor.toFixed(2)}). Your long-term conviction pays off.`}
              </p>
            </div>

            {/* Improvement Area */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Area for Improvement
              </h3>
              <p className="text-sm text-muted-foreground">
                {swingStats.winRate < dayStats.winRate && swingStats.winRate < positionStats.winRate
                  ? `Swing trade win rate (${swingStats.winRate.toFixed(1)}%) is lower than other strategies. Review entry criteria.`
                  : dayStats.winRate < positionStats.winRate
                  ? `Day trade win rate (${dayStats.winRate.toFixed(1)}%) could be improved. Focus on setup quality over quantity.`
                  : `Position trade win rate (${positionStats.winRate.toFixed(1)}%) needs work. Consider tighter stop losses or better entry timing.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
