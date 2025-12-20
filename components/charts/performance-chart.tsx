'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Position {
  id: string
  symbol: string
  entry_date: string
  exit_date: string | null
  status: string
  pnl: number | null
  pnl_percentage: number | null
}

interface PerformanceChartProps {
  positions: Position[]
}

interface EquityPoint {
  date: string
  value: number
  trades: number
  label: string
}

interface MonthlyData {
  month: string
  profit: number
  loss: number
  net: number
  trades: number
}

export function PerformanceChart({ positions }: PerformanceChartProps) {
  const { equityData, monthlyData, stats } = useMemo(() => 
    calculateChartData(positions), 
    [positions]
  )

  if (positions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-500" />
            Performance Analytics
          </CardTitle>
          <CardDescription>Visual performance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">No trading data available yet</p>
            <p className="text-sm text-gray-500 mt-1">Charts will appear once you have positions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-500" />
          Performance Analytics
        </CardTitle>
        <CardDescription>
          Equity curve and monthly performance breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-white/5 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Total Trades</div>
            <div className="text-xl font-bold">{stats.totalTrades}</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Win Rate</div>
            <div className="text-xl font-bold text-purple-400">{stats.winRate.toFixed(0)}%</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Profit Factor</div>
            <div className="text-xl font-bold text-green-400">
              {stats.profitFactor.toFixed(2)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Net P&L</div>
            <div className={`text-xl font-bold ${stats.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Equity Curve */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Equity Curve
            </h3>
            <Badge variant="secondary" className="text-xs">
              {equityData.length} data points
            </Badge>
          </div>
          
          <div className="relative h-48 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <svg viewBox="0 0 800 160" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 40, 80, 120, 160].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="800"
                  y2={y}
                  stroke="rgb(55, 65, 81)"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
              ))}
              
              {/* Equity curve path */}
              <polyline
                points={equityData.map((point, i) => {
                  const x = (i / Math.max(1, equityData.length - 1)) * 800
                  const minVal = Math.min(...equityData.map(p => p.value), 0)
                  const maxVal = Math.max(...equityData.map(p => p.value), 100)
                  const range = maxVal - minVal || 1
                  const y = 160 - ((point.value - minVal) / range) * 150 - 5
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="rgb(34, 211, 238)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Area fill */}
              <polygon
                points={`
                  0,160
                  ${equityData.map((point, i) => {
                    const x = (i / Math.max(1, equityData.length - 1)) * 800
                    const minVal = Math.min(...equityData.map(p => p.value), 0)
                    const maxVal = Math.max(...equityData.map(p => p.value), 100)
                    const range = maxVal - minVal || 1
                    const y = 160 - ((point.value - minVal) / range) * 150 - 5
                    return `${x},${y}`
                  }).join(' ')}
                  800,160
                `}
                fill="url(#gradient)"
                opacity="0.3"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pr-2">
              <span>${Math.max(...equityData.map(p => p.value)).toFixed(0)}</span>
              <span>$0</span>
              <span>${Math.min(...equityData.map(p => p.value), 0).toFixed(0)}</span>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>{equityData[0]?.label || 'Start'}</span>
            <span className="text-cyan-400">
              {stats.netPnL >= 0 ? '+' : ''}{stats.netPnL.toFixed(2)} Total
            </span>
            <span>{equityData[equityData.length - 1]?.label || 'Now'}</span>
          </div>
        </div>

        {/* Monthly Performance Bars */}
        <div className="space-y-3 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            Monthly Performance
          </h3>
          
          <div className="space-y-2">
            {monthlyData.slice(0, 6).map((data) => (
              <div key={data.month} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{data.month}</span>
                  <div className="flex items-center gap-3">
                    <span className={data.net >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {data.net >= 0 ? '+' : ''}${data.net.toFixed(0)}
                    </span>
                    <span className="text-gray-500">{data.trades} trades</span>
                  </div>
                </div>
                <div className="flex gap-1 h-6">
                  {/* Profit bar */}
                  {data.profit > 0 && (
                    <div
                      className="bg-green-500/30 border-l-2 border-green-400 rounded flex items-center justify-end px-2"
                      style={{
                        width: `${(data.profit / (Math.abs(data.profit) + Math.abs(data.loss) || 1)) * 100}%`
                      }}
                    >
                      <span className="text-xs text-green-400">
                        +${data.profit.toFixed(0)}
                      </span>
                    </div>
                  )}
                  {/* Loss bar */}
                  {data.loss < 0 && (
                    <div
                      className="bg-red-500/30 border-l-2 border-red-400 rounded flex items-center px-2"
                      style={{
                        width: `${(Math.abs(data.loss) / (Math.abs(data.profit) + Math.abs(data.loss) || 1)) * 100}%`
                      }}
                    >
                      <span className="text-xs text-red-400">
                        ${data.loss.toFixed(0)}
                      </span>
                    </div>
                  )}
                  {data.profit === 0 && data.loss === 0 && (
                    <div className="w-full bg-gray-700/30 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">No trades</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Win/Loss Distribution */}
        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Win/Loss Distribution
          </h3>
          <div className="flex gap-2 h-16">
            <div
              className="bg-green-500/20 border border-green-500/30 rounded flex flex-col items-center justify-center"
              style={{ width: `${stats.winRate}%` }}
            >
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-xs text-green-400 mt-1">
                {stats.wins} wins
              </span>
            </div>
            <div
              className="bg-red-500/20 border border-red-500/30 rounded flex flex-col items-center justify-center"
              style={{ width: `${100 - stats.winRate}%` }}
            >
              <TrendingDown className="h-5 w-5 text-red-400" />
              <span className="text-xs text-red-400 mt-1">
                {stats.losses} losses
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{stats.winRate.toFixed(1)}% Win Rate</span>
            <span>{(100 - stats.winRate).toFixed(1)}% Loss Rate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to calculate all chart data
function calculateChartData(positions: Position[]) {
  const closedPositions = positions
    .filter(p => p.status === 'closed' && p.pnl !== null && p.exit_date)
    .sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime())

  // Calculate equity curve
  let runningTotal = 0
  const equityData: EquityPoint[] = closedPositions.map((position, index) => {
    runningTotal += position.pnl || 0
    return {
      date: position.exit_date!,
      value: runningTotal,
      trades: index + 1,
      label: new Date(position.exit_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  })

  // Add starting point
  if (equityData.length > 0) {
    equityData.unshift({
      date: closedPositions[0]?.entry_date || new Date().toISOString(),
      value: 0,
      trades: 0,
      label: 'Start'
    })
  }

  // Calculate monthly data
  const monthlyMap = new Map<string, MonthlyData>()
  
  closedPositions.forEach(position => {
    const date = new Date(position.exit_date!)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthLabel,
        profit: 0,
        loss: 0,
        net: 0,
        trades: 0
      })
    }
    
    const monthData = monthlyMap.get(monthKey)!
    const pnl = position.pnl || 0
    
    if (pnl > 0) {
      monthData.profit += pnl
    } else if (pnl < 0) {
      monthData.loss += pnl
    }
    
    monthData.net += pnl
    monthData.trades++
  })

  const monthlyData = Array.from(monthlyMap.values()).reverse()

  // Calculate stats
  const wins = closedPositions.filter(p => (p.pnl || 0) > 0)
  const losses = closedPositions.filter(p => (p.pnl || 0) < 0)
  const totalProfit = wins.reduce((sum, p) => sum + (p.pnl || 0), 0)
  const totalLoss = Math.abs(losses.reduce((sum, p) => sum + (p.pnl || 0), 0))
  
  const stats = {
    totalTrades: closedPositions.length,
    wins: wins.length,
    losses: losses.length,
    winRate: closedPositions.length > 0 ? (wins.length / closedPositions.length) * 100 : 0,
    netPnL: runningTotal,
    profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0
  }

  return { equityData, monthlyData, stats }
}
