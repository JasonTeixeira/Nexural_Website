'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react'

interface Position {
  id: string
  symbol: string
  direction: string
  entry_date: string
  exit_date: string | null
  status: string
  pnl: number | null
  pnl_percentage: number | null
}

interface RecentActivityStats {
  last7Days: {
    totalTrades: number
    openedTrades: number
    closedTrades: number
    totalPnL: number
    avgPnL: number
    winRate: number
    bestTrade: { symbol: string; pnl: number } | null
    worstTrade: { symbol: string; pnl: number } | null
  }
  comparison: {
    tradesVsPrevious: number
    pnlVsPrevious: number
  }
}

interface RecentActivityWidgetProps {
  positions: Position[]
}

export function RecentActivityWidget({ positions }: RecentActivityWidgetProps) {
  const stats = React.useMemo(() => calculateRecentActivity(positions), [positions])

  if (stats.last7Days.totalTrades === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-500" />
            Recent Activity
          </CardTitle>
          <CardDescription>Last 7 days performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">No activity in the last 7 days</p>
            <p className="text-sm text-gray-500 mt-1">Start trading to see your recent performance</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-500" />
          Recent Activity
        </CardTitle>
        <CardDescription>Last 7 days performance summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-white/5 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Total Trades</div>
            <div className="text-xl font-bold">{stats.last7Days.totalTrades}</div>
            {stats.comparison.tradesVsPrevious !== 0 && (
              <div className={`text-xs mt-1 ${stats.comparison.tradesVsPrevious > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.comparison.tradesVsPrevious > 0 ? '+' : ''}{stats.comparison.tradesVsPrevious} vs prev
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Opened</div>
            <div className="text-xl font-bold text-green-400">{stats.last7Days.openedTrades}</div>
            <div className="text-xs text-gray-500 mt-1">New positions</div>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Closed</div>
            <div className="text-xl font-bold text-blue-400">{stats.last7Days.closedTrades}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Win Rate</div>
            <div className="text-xl font-bold text-purple-400">{stats.last7Days.winRate.toFixed(0)}%</div>
            <div className="text-xs text-gray-500 mt-1">Success rate</div>
          </div>
        </div>

        {/* P&L Summary */}
        <div className="p-4 rounded-lg border border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total P&L (7 days)</span>
            {stats.comparison.pnlVsPrevious !== 0 && (
              <Badge variant={stats.comparison.pnlVsPrevious > 0 ? 'default' : 'secondary'} className="text-xs">
                {stats.comparison.pnlVsPrevious > 0 ? '+' : ''}{stats.comparison.pnlVsPrevious.toFixed(1)}% vs prev
              </Badge>
            )}
          </div>
          <div className={`text-2xl font-bold ${stats.last7Days.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.last7Days.totalPnL >= 0 ? '+' : ''}${stats.last7Days.totalPnL.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Avg per trade: ${stats.last7Days.avgPnL.toFixed(2)}
          </div>
        </div>

        {/* Best & Worst Trades */}
        {(stats.last7Days.bestTrade || stats.last7Days.worstTrade) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.last7Days.bestTrade && (
              <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-400">Best Trade</span>
                </div>
                <div className="font-semibold text-lg">{stats.last7Days.bestTrade.symbol}</div>
                <div className="text-green-400 font-bold">
                  +${stats.last7Days.bestTrade.pnl.toFixed(2)}
                </div>
              </div>
            )}

            {stats.last7Days.worstTrade && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-gray-400">Worst Trade</span>
                </div>
                <div className="font-semibold text-lg">{stats.last7Days.worstTrade.symbol}</div>
                <div className="text-red-400 font-bold">
                  ${stats.last7Days.worstTrade.pnl.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Timeline Indicator */}
        <div className="pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Activity Distribution</div>
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => {
              const dayActivity = getDayActivity(positions, 6 - i)
              const intensity = dayActivity > 0 ? Math.min(dayActivity / 3, 1) : 0
              return (
                <div
                  key={i}
                  className="flex-1 rounded"
                  style={{
                    height: '32px',
                    backgroundColor: intensity > 0 
                      ? `rgba(34, 211, 238, ${0.2 + intensity * 0.6})` 
                      : 'rgba(75, 85, 99, 0.3)'
                  }}
                  title={`${dayActivity} ${dayActivity === 1 ? 'trade' : 'trades'} ${i === 0 ? 'today' : `${6-i} days ago`}`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>7 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to calculate recent activity stats
function calculateRecentActivity(positions: Position[]): RecentActivityStats {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Last 7 days activity
  const last7DaysPositions = positions.filter(p => {
    const entryDate = new Date(p.entry_date)
    const exitDate = p.exit_date ? new Date(p.exit_date) : null
    return entryDate >= sevenDaysAgo || (exitDate && exitDate >= sevenDaysAgo)
  })

  // Previous 7 days activity (for comparison)
  const previous7DaysPositions = positions.filter(p => {
    const entryDate = new Date(p.entry_date)
    const exitDate = p.exit_date ? new Date(p.exit_date) : null
    const inPrevious = (entryDate >= fourteenDaysAgo && entryDate < sevenDaysAgo) ||
                       (exitDate && exitDate >= fourteenDaysAgo && exitDate < sevenDaysAgo)
    return inPrevious
  })

  const openedTrades = last7DaysPositions.filter(p => new Date(p.entry_date) >= sevenDaysAgo).length
  const closedTrades = last7DaysPositions.filter(p => p.exit_date && new Date(p.exit_date) >= sevenDaysAgo).length

  const closedPositions = last7DaysPositions.filter(p => 
    p.status === 'closed' && p.pnl !== null && p.exit_date && new Date(p.exit_date) >= sevenDaysAgo
  )

  const wins = closedPositions.filter(p => (p.pnl ?? 0) > 0)
  const winRate = closedPositions.length > 0 ? (wins.length / closedPositions.length) * 100 : 0

  const totalPnL = closedPositions.reduce((sum, p) => sum + (p.pnl ?? 0), 0)
  const avgPnL = closedPositions.length > 0 ? totalPnL / closedPositions.length : 0

  // Find best and worst trades
  let bestTrade: { symbol: string; pnl: number } | null = null
  let worstTrade: { symbol: string; pnl: number } | null = null
  
  if (closedPositions.length > 0) {
    const sorted = [...closedPositions].sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0))
    const bestPnl = sorted[0].pnl
    if (bestPnl !== null && bestPnl !== undefined && bestPnl > 0) {
      bestTrade = { symbol: sorted[0].symbol, pnl: bestPnl }
    }
    const worstPnl = sorted[sorted.length - 1].pnl
    if (worstPnl !== null && worstPnl !== undefined && worstPnl < 0) {
      worstTrade = { symbol: sorted[sorted.length - 1].symbol, pnl: worstPnl }
    }
  }

  // Calculate comparison metrics
  const previousTotalTrades = previous7DaysPositions.length
  const previousClosedPositions = previous7DaysPositions.filter(p => 
    p.status === 'closed' && p.pnl !== null
  )
  const previousTotalPnL = previousClosedPositions.reduce((sum, p) => sum + (p.pnl ?? 0), 0)

  const tradesVsPrevious = last7DaysPositions.length - previousTotalTrades
  const pnlVsPrevious = previousTotalPnL !== 0 
    ? ((totalPnL - previousTotalPnL) / Math.abs(previousTotalPnL)) * 100 
    : 0

  return {
    last7Days: {
      totalTrades: last7DaysPositions.length,
      openedTrades,
      closedTrades,
      totalPnL,
      avgPnL,
      winRate,
      bestTrade,
      worstTrade
    },
    comparison: {
      tradesVsPrevious,
      pnlVsPrevious
    }
  }
}

// Helper to get activity for a specific day
function getDayActivity(positions: Position[], daysAgo: number): number {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() - daysAgo)
  targetDate.setHours(0, 0, 0, 0)
  
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)

  return positions.filter(p => {
    const entryDate = new Date(p.entry_date)
    const exitDate = p.exit_date ? new Date(p.exit_date) : null
    
    const entryInDay = entryDate >= targetDate && entryDate < nextDay
    const exitInDay = exitDate && exitDate >= targetDate && exitDate < nextDay
    
    return entryInDay || exitInDay
  }).length
}
