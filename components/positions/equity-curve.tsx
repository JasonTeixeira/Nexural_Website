'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SnapshotData {
  snapshot_date: string
  total_equity: number
  daily_pnl: number
  cumulative_pnl: number
  peak_equity: number
  drawdown_from_peak: number
}

export function EquityCurve() {
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'30d' | '90d' | 'ytd' | 'all'>('30d')

  useEffect(() => {
    fetchSnapshots()
  }, [period])

  const fetchSnapshots = async () => {
    try {
      setLoading(true)
      // TODO: Fetch real snapshots from API /api/positions/snapshots?period=30d
      // For now, show empty until real data is available
      setSnapshots([])
    } catch (error) {
      console.error('Error fetching snapshots:', error)
      setSnapshots([])
    } finally {
      setLoading(false)
    }
  }

  const chartData = snapshots.map((snap) => ({
    date: new Date(snap.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    equity: snap.total_equity,
    peak: snap.peak_equity,
    cumulativePnL: snap.cumulative_pnl,
  }))

  const currentEquity = snapshots.length > 0 ? snapshots[snapshots.length - 1].total_equity : 0
  const startEquity = snapshots.length > 0 ? snapshots[0].total_equity : 0
  const totalReturn = startEquity > 0 ? ((currentEquity - startEquity) / startEquity) * 100 : 0
  const isPositive = totalReturn >= 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-bold text-white mb-2">{data.date}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Equity:</span>
              <span className="text-white font-semibold">
                ${data.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Cumulative P&L:</span>
              <span className={`font-semibold ${data.cumulativePnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.cumulativePnL >= 0 ? '+' : ''}${data.cumulativePnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className="premium-card">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading equity curve...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              Equity Curve
            </CardTitle>
            <CardDescription>
              Portfolio value over time — track growth and drawdowns
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1 rounded text-sm ${
                period === '30d'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-white'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setPeriod('90d')}
              className={`px-3 py-1 rounded text-sm ${
                period === '90d'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-white'
              }`}
            >
              90D
            </button>
            <button
              onClick={() => setPeriod('ytd')}
              className={`px-3 py-1 rounded text-sm ${
                period === 'ytd'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-white'
              }`}
            >
              YTD
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1 rounded text-sm ${
                period === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-white'
              }`}
            >
              ALL
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Current Equity</p>
            <p className="text-xl font-bold text-white data-value">
              ${currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Period Return</p>
            <p className={`text-xl font-bold data-value ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{totalReturn.toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">P&L</p>
            <p className={`text-xl font-bold data-value ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}${(currentEquity - startEquity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorEquity)"
              />
              <Line
                type="monotone"
                dataKey="peak"
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-muted-foreground">Equity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-400" style={{ borderTop: '2px dashed' }}></div>
            <span className="text-muted-foreground">Peak Equity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
