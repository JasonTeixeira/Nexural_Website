'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, Activity, BarChart3 } from 'lucide-react'
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
  stock: '#3b82f6',
  option: '#fbbf24',
  crypto: '#22c55e',
  default: '#6366f1'
}

export default function MemberAnalyticsPage() {
  const [positions, setPositions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    loadPositions()
  }, [])

  const loadPositions = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })

      if (error) {
        console.error('Error fetching positions:', error)
      } else {
        // Calculate P&L for each position
        const positionsWithPnL = (data || []).map(pos => {
          const currentPrice = pos.current_price || pos.entry_price
          const entryValue = pos.entry_price * pos.quantity
          const currentValue = currentPrice * pos.quantity
          const pnl = pos.direction === 'long' 
            ? currentValue - entryValue
            : entryValue - currentValue
          const pnlPercentage = (pnl / entryValue) * 100

          // Calculate hold days
          const entryDate = new Date(pos.entry_date)
          const exitDate = pos.exit_date ? new Date(pos.exit_date) : new Date()
          const holdDays = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

          // Calculate R-multiple (if stop loss is set)
          let rMultiple = null
          if (pos.stop_loss) {
            const riskPerShare = Math.abs(pos.entry_price - pos.stop_loss)
            const actualPnLPerShare = pos.status === 'closed' 
              ? (pos.exit_price || currentPrice) - pos.entry_price
              : currentPrice - pos.entry_price
            rMultiple = riskPerShare > 0 ? actualPnLPerShare / riskPerShare : null
          }

          return {
            ...pos,
            realized_pnl: pos.status === 'closed' ? (pos.realized_pnl || pnl) : null,
            unrealized_pnl: pos.status === 'open' ? pnl : null,
            pnl_percentage: pos.status === 'closed' ? (pos.realized_pnl_pct || pnlPercentage) : pnlPercentage,
            hold_days: holdDays,
            r_multiple: rMultiple
          }
        })
        setPositions(positionsWithPnL)
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  // Calculate comprehensive stats per filter
  const calculateStats = (filter: string): TimeframeStats => {
    const filtered = filter === 'all' 
      ? positions 
      : positions.filter(p => p.type === filter)

    const open = filtered.filter(p => p.status === 'open')
    const closed = filtered.filter(p => p.status === 'closed')
    
    const winners = closed.filter(p => (p.realized_pnl || 0) > 0)
    const losers = closed.filter(p => (p.realized_pnl || 0) <= 0)
    
    const totalPnL = closed.reduce((sum, p) => sum + (p.realized_pnl || 0), 0)
    const avgPnL = closed.length > 0 ? totalPnL / closed.length : 0
    
    const totalWins = winners.reduce((sum, p) => sum + (p.realized_pnl || 0), 0)
    const totalLosses = Math.abs(losers.reduce((sum, p) => sum + (p.realized_pnl || 0), 0))
    const avgWin = winners.length > 0 ? totalWins / winners.length : 0
    const avgLoss = losers.length > 0 ? totalLosses / losers.length : 0
    
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0
    
    const rMultiples = closed.filter(p => p.r_multiple !== null).map(p => p.r_multiple)
    const avgRMultiple = rMultiples.length > 0 
      ? rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length 
      : 0
    
    const holdDays = closed.filter(p => p.hold_days).map(p => p.hold_days)
    const avgHoldDays = holdDays.length > 0
      ? holdDays.reduce((sum, d) => sum + d, 0) / holdDays.length
      : 0
    
    const totalRisk = open.reduce((sum, p) => {
      if (p.stop_loss) {
        const risk = Math.abs(p.entry_price - p.stop_loss) * p.quantity
        return sum + risk
      }
      return sum
    }, 0)
    
    const pnls = closed.map(p => p.realized_pnl || 0)
    const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0
    const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0

    return {
      timeframe: filter,
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

  const allStats = calculateStats('all')
  const stockStats = calculateStats('stock')
  const optionStats = calculateStats('option')
  const cryptoStats = calculateStats('crypto')

  // Comparison data for charts
  const comparisonData = [
    { name: 'Stocks', winRate: stockStats.winRate, avgPnL: stockStats.avgPnL, trades: stockStats.closedPositions, color: COLORS.stock },
    { name: 'Options', winRate: optionStats.winRate, avgPnL: optionStats.avgPnL, trades: optionStats.closedPositions, color: COLORS.option },
    { name: 'Crypto', winRate: cryptoStats.winRate, avgPnL: cryptoStats.avgPnL, trades: cryptoStats.closedPositions, color: COLORS.crypto },
  ]

  const profitFactorData = [
    { name: 'Stocks', value: stockStats.profitFactor, fill: COLORS.stock },
    { name: 'Options', value: optionStats.profitFactor, fill: COLORS.option },
    { name: 'Crypto', value: cryptoStats.profitFactor, fill: COLORS.crypto },
  ]

  const rMultipleData = [
    { name: 'Stocks', rMultiple: stockStats.avgRMultiple, holdDays: stockStats.avgHoldDays },
    { name: 'Options', rMultiple: optionStats.avgRMultiple, holdDays: optionStats.avgHoldDays },
    { name: 'Crypto', rMultiple: cryptoStats.avgRMultiple, holdDays: cryptoStats.avgHoldDays },
  ]

  const currentStats = selectedFilter === 'all' ? allStats :
                       selectedFilter === 'stock' ? stockStats :
                       selectedFilter === 'option' ? optionStats : cryptoStats

  if (loading) {
    return (
      <MemberPortalLayoutNew>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </MemberPortalLayoutNew>
    )
  }

  return (
    <MemberPortalLayoutNew>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-cyan-400" />
            Performance Analytics
          </h1>
          <p className="text-gray-400">
            Comprehensive analysis of your trading performance
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('all')}
            className={selectedFilter === 'all' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : ''}
          >
            All Trades
          </Button>
          <Button
            variant={selectedFilter === 'stock' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('stock')}
            className={selectedFilter === 'stock' ? 'bg-blue-500' : ''}
          >
            Stocks
          </Button>
          <Button
            variant={selectedFilter === 'option' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('option')}
            className={selectedFilter === 'option' ? 'bg-yellow-500 text-black' : ''}
          >
            Options
          </Button>
          <Button
            variant={selectedFilter === 'crypto' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('crypto')}
            className={selectedFilter === 'crypto' ? 'bg-green-500' : ''}
          >
            Crypto
          </Button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats.winRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-400 mt-1">
                {currentStats.winners}W / {currentStats.losers}L
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total P&L</CardTitle>
              {currentStats.totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentStats.totalPnL >= 0 ? '+' : ''}${currentStats.totalPnL.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {currentStats.closedPositions} closed trades
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg R-Multiple</CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentStats.avgRMultiple >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentStats.avgRMultiple.toFixed(2)}R
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Risk-adjusted return
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Hold Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats.avgHoldDays.toFixed(1)}</div>
              <p className="text-xs text-gray-400 mt-1">
                days per trade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Win Rate Comparison */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Win Rate by Asset Type</CardTitle>
              <CardDescription>Compare success rates across different assets</CardDescription>
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
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* R-Multiple vs Hold Time */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
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
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Profit Factor by Asset Type</CardTitle>
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
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Detailed Performance Metrics</CardTitle>
            <CardDescription>Comprehensive breakdown by asset type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Asset Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-300">Trades</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-300">Win Rate</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-300">Total P&L</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-300">Avg Win</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-300">Avg Loss</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-300">Best Trade</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-300">Worst Trade</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-300">Profit Factor</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { stats: stockStats, label: 'Stocks', color: 'bg-blue-500' },
                    { stats: optionStats, label: 'Options', color: 'bg-yellow-500' },
                    { stats: cryptoStats, label: 'Crypto', color: 'bg-green-500' },
                  ].map(({ stats, label, color }) => (
                    <tr key={label} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <Badge className={`${color} text-white border-0`}>{label}</Badge>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-300">{stats.closedPositions}</td>
                      <td className="text-right py-3 px-4 font-semibold text-white">{stats.winRate.toFixed(1)}%</td>
                      <td className={`text-right py-3 px-4 font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4 text-green-400">${stats.avgWin.toFixed(2)}</td>
                      <td className="text-right py-3 px-4 text-red-400">-${stats.avgLoss.toFixed(2)}</td>
                      <td className="text-right py-3 px-4 text-green-400">${stats.bestTrade.toFixed(2)}</td>
                      <td className="text-right py-3 px-4 text-red-400">${stats.worstTrade.toFixed(2)}</td>
                      <td className="text-right py-3 px-4 font-semibold text-white">{stats.profitFactor.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Insights & Recommendations */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key findings and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Best Strategy */}
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Best Performing Asset Type
                </h3>
                <p className="text-sm text-gray-300">
                  {stockStats.profitFactor > optionStats.profitFactor && stockStats.profitFactor > cryptoStats.profitFactor
                    ? `Stocks show the highest profit factor (${stockStats.profitFactor.toFixed(2)}). Consider increasing allocation to stock trades.`
                    : optionStats.profitFactor > cryptoStats.profitFactor
                    ? `Options show the highest profit factor (${optionStats.profitFactor.toFixed(2)}). Your options strategy is working well.`
                    : `Crypto trades show the highest profit factor (${cryptoStats.profitFactor.toFixed(2)}). Your crypto timing is excellent.`}
                </p>
              </div>

              {/* Improvement Area */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Area for Improvement
                </h3>
                <p className="text-sm text-gray-300">
                  {stockStats.winRate < optionStats.winRate && stockStats.winRate < cryptoStats.winRate
                    ? `Stock trade win rate (${stockStats.winRate.toFixed(1)}%) is lower than other asset types. Review entry criteria.`
                    : optionStats.winRate < cryptoStats.winRate
                    ? `Options win rate (${optionStats.winRate.toFixed(1)}%) could be improved. Focus on setup quality over quantity.`
                    : `Crypto win rate (${cryptoStats.winRate.toFixed(1)}%) needs work. Consider tighter stop losses or better entry timing.`}
                </p>
              </div>

              {/* Overall Performance */}
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <h3 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Overall Performance Summary
                </h3>
                <p className="text-sm text-gray-300">
                  You have completed {allStats.closedPositions} trades with a {allStats.winRate.toFixed(1)}% win rate and a total P&L of ${allStats.totalPnL.toFixed(2)}. 
                  {allStats.avgRMultiple > 1 ? ' Your average R-Multiple is positive, indicating good risk management.' : ' Focus on improving your risk-reward ratio.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberPortalLayoutNew>
  )
}
