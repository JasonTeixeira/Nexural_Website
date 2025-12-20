'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Target, Award, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface PerformanceStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  breakevenTrades: number
  winRate: number
  avgWinPct: number
  avgLossPct: number
  avgWinR: number
  avgLossR: number
  expectancy: number
  profitFactor: number
  avgHoldDaysWinners: number
  avgHoldDaysLosers: number
  largestWin: number
  largestLoss: number
  largestWinR: number
  largestLossR: number
  maxDrawdown: number
}

export function PerformanceAnalytics() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceStats()
  }, [])

  const fetchPerformanceStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/positions/stats?period=all_time')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching performance stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="premium-card">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  // Win/Loss Distribution
  const winLossData = [
    { name: 'Wins', value: stats.winningTrades, color: '#10b981' },
    { name: 'Losses', value: stats.losingTrades, color: '#ef4444' },
    { name: 'Breakeven', value: stats.breakevenTrades, color: '#6b7280' },
  ]

  // R-Multiple Distribution (mock data for now)
  const rMultipleData = [
    { range: '<-2R', count: 2, color: '#dc2626' },
    { range: '-2R to -1R', count: 5, color: '#ef4444' },
    { range: '-1R to 0R', count: 8, color: '#f97316' },
    { range: '0R to 1R', count: 12, color: '#fbbf24' },
    { range: '1R to 2R', count: 15, color: '#84cc16' },
    { range: '2R to 3R', count: 10, color: '#22c55e' },
    { range: '>3R', count: 8, color: '#10b981' },
  ]

  // Setup Type Performance (mock data)
  const setupPerformance = [
    { name: 'Breakout', winRate: 65, avgR: 1.8, trades: 25 },
    { name: 'Pullback', winRate: 58, avgR: 1.5, trades: 18 },
    { name: 'Momentum', winRate: 72, avgR: 2.1, trades: 15 },
    { name: 'Mean Reversion', winRate: 45, avgR: 2.8, trades: 12 },
    { name: 'Earnings', winRate: 55, avgR: 1.2, trades: 8 },
  ]

  // Sector Performance (mock data)
  const sectorPerformance = [
    { name: 'Technology', winRate: 68, avgR: 1.9, pnl: 12500 },
    { name: 'Healthcare', winRate: 52, avgR: 1.3, pnl: 3200 },
    { name: 'Financial', winRate: 61, avgR: 1.6, pnl: 8100 },
    { name: 'Consumer', winRate: 45, avgR: 0.8, pnl: -2400 },
    { name: 'Energy', winRate: 75, avgR: 2.4, pnl: 6800 },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-bold text-white mb-2">{data.name || data.range}</p>
          {data.value !== undefined && (
            <p className="text-sm text-muted-foreground">Trades: {data.value}</p>
          )}
          {data.count !== undefined && (
            <p className="text-sm text-muted-foreground">Count: {data.count}</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-primary" />
              <Badge variant={stats.winRate >= 50 ? 'default' : 'destructive'}>
                {stats.winRate >= 50 ? 'Profitable' : 'Needs Work'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
            <p className="text-3xl font-bold text-white data-value">
              {stats.winRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.winningTrades}W / {stats.losingTrades}L / {stats.breakevenTrades}BE
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-green-400" />
              <Badge variant="outline">Edge</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Expectancy</p>
            <p className={`text-3xl font-bold data-value ${
              stats.expectancy >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats.expectancy >= 0 ? '+' : ''}{stats.expectancy.toFixed(2)}R
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Per trade average
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <Badge variant="outline">Ratio</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Profit Factor</p>
            <p className="text-3xl font-bold text-white data-value">
              {stats.profitFactor.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Wins / Losses ratio
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <Badge variant="destructive">Risk</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Max Drawdown</p>
            <p className="text-3xl font-bold text-red-400 data-value">
              {formatCurrency(Math.abs(stats.maxDrawdown))}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Largest loss streak
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win/Loss Distribution */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
            <CardDescription>Breakdown of trade outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Avg Win</p>
                <p className="text-green-400 font-bold data-value">
                  +{stats.avgWinR.toFixed(2)}R
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.avgWinPct.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Avg Loss</p>
                <p className="text-red-400 font-bold data-value">
                  {stats.avgLossR.toFixed(2)}R
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.avgLossPct.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Ratio</p>
                <p className="text-white font-bold data-value">
                  {(Math.abs(stats.avgWinR / stats.avgLossR)).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Win/Loss</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* R-Multiple Distribution */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle>R-Multiple Distribution</CardTitle>
            <CardDescription>Trade outcomes by risk multiples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rMultipleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="range"
                    stroke="#9ca3af"
                    style={{ fontSize: '11px' }}
                    tick={{ fill: '#9ca3af' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {rMultipleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-center text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Best Trade</p>
                <p className="text-green-400 font-bold data-value">
                  +{stats.largestWinR.toFixed(2)}R
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.largestWin)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Worst Trade</p>
                <p className="text-red-400 font-bold data-value">
                  {stats.largestLossR.toFixed(2)}R
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.largestLoss)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Type Performance */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle>Setup Type Performance</CardTitle>
          <CardDescription>Win rate and avg R by setup type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {setupPerformance.map((setup) => (
              <div key={setup.name} className="glass-card p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-white">{setup.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {setup.trades} trades
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className={`font-bold data-value ${
                        setup.winRate >= 50 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {setup.winRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Avg R</p>
                      <p className={`font-bold data-value ${
                        setup.avgR >= 1 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {setup.avgR.toFixed(1)}R
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`rounded-full h-2 transition-all ${
                      setup.winRate >= 60 ? 'bg-green-500' : setup.winRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${setup.winRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sector Performance */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle>Sector Performance</CardTitle>
          <CardDescription>Win rate, avg R, and total P&L by sector</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectorPerformance
              .sort((a, b) => b.pnl - a.pnl)
              .map((sector) => (
                <div key={sector.name} className="glass-card p-4 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-2">{sector.name}</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Win Rate</p>
                          <p className={`font-semibold data-value ${
                            sector.winRate >= 50 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {sector.winRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg R</p>
                          <p className="font-semibold text-white data-value">
                            {sector.avgR.toFixed(1)}R
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total P&L</p>
                          <p className={`font-semibold data-value ${
                            sector.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {sector.pnl >= 0 ? '+' : ''}{formatCurrency(sector.pnl)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Hold Time Analysis */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle>Hold Time Analysis</CardTitle>
          <CardDescription>Average days held for winners vs losers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Winners</p>
              <p className="text-3xl font-bold text-green-400 data-value">
                {stats.avgHoldDaysWinners.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">days avg</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Losers</p>
              <p className="text-3xl font-bold text-red-400 data-value">
                {stats.avgHoldDaysLosers.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">days avg</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Ratio</p>
              <p className="text-3xl font-bold text-white data-value">
                {(stats.avgHoldDaysWinners / stats.avgHoldDaysLosers).toFixed(2)}x
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.avgHoldDaysWinners > stats.avgHoldDaysLosers ? 'Letting winners run ✓' : 'Cutting losers quick ✓'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
