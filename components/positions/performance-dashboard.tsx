"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity, 
  DollarSign, 
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react"

interface PerformanceData {
  summary: {
    totalSignals: number
    activeSignals: number
    closedSignals: number
    winRate: number
    avgRMultiple: number
    totalPnL: number
    bestTrade: number
    worstTrade: number
    sharpeRatio: number
    profitFactor: number
    todayPnL: number
    weeklyPnL: number
    monthlyPnL: number
  }
  recentSignals: any[]
  performanceData: any[]
  assetPerformance: any[]
}

export function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [refreshing, setRefreshing] = useState(false)

  const fetchPerformanceData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/performance?period=daily&days=${selectedPeriod}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        console.error("Failed to fetch performance data:", result.error)
      }
    } catch (error) {
      console.error("Error fetching performance data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPerformanceData()
  }, [selectedPeriod])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'closed': return 'bg-green-100 text-green-800'
      case 'stopped': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDirectionColor = (direction: string) => {
    return direction === 'LONG' ? 'text-green-600' : 'text-red-600'
  }

  const getRMultipleColor = (rMultiple: number) => {
    if (rMultiple > 0) return 'text-green-600'
    if (rMultiple < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white">Loading performance data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Performance Data</h3>
            <p className="text-gray-300 mb-4">Unable to load performance data. Please try again.</p>
            <Button onClick={fetchPerformanceData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
          <p className="text-gray-300">Institutional-grade trading performance tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button 
            onClick={fetchPerformanceData} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Total Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.summary.totalSignals}</div>
            <p className="text-xs text-gray-300">
              {data.summary.activeSignals} active, {data.summary.closedSignals} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{data.summary.winRate}%</div>
            <p className="text-xs text-gray-300">
              {Math.round((data.summary.winRate / 100) * data.summary.closedSignals)} winning trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Avg R-Multiple
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRMultipleColor(data.summary.avgRMultiple)}`}>
              {data.summary.avgRMultiple}R
            </div>
            <p className="text-xs text-gray-300">Risk-adjusted returns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRMultipleColor(data.summary.totalPnL)}`}>
              {data.summary.totalPnL > 0 ? '+' : ''}{data.summary.totalPnL} pts
            </div>
            <p className="text-xs text-gray-300">Points gained/lost</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Today's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${getRMultipleColor(data.summary.todayPnL)}`}>
              {data.summary.todayPnL > 0 ? '+' : ''}{data.summary.todayPnL} pts
            </div>
            <p className="text-xs text-gray-300">Daily P&L</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${getRMultipleColor(data.summary.weeklyPnL)}`}>
              {data.summary.weeklyPnL > 0 ? '+' : ''}{data.summary.weeklyPnL} pts
            </div>
            <p className="text-xs text-gray-300">7-day P&L</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${getRMultipleColor(data.summary.monthlyPnL)}`}>
              {data.summary.monthlyPnL > 0 ? '+' : ''}{data.summary.monthlyPnL} pts
            </div>
            <p className="text-xs text-gray-300">30-day P&L</p>
          </CardContent>
        </Card>
      </div>

      {/* Professional Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Risk & Performance Metrics</CardTitle>
          <CardDescription>Institutional-grade performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2 text-white">Sharpe Ratio</h3>
              <div className="text-2xl font-bold text-blue-400">{data.summary.sharpeRatio}</div>
              <p className="text-sm text-gray-300">Risk-adjusted returns</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2 text-white">Profit Factor</h3>
              <div className="text-2xl font-bold text-green-400">{data.summary.profitFactor}</div>
              <p className="text-sm text-gray-300">Gross profit / Gross loss</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2 text-white">Best Trade</h3>
              <div className="text-2xl font-bold text-green-400">{data.summary.bestTrade}R</div>
              <p className="text-sm text-gray-300">Highest R-multiple</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2 text-white">Worst Trade</h3>
              <div className="text-2xl font-bold text-red-400">{data.summary.worstTrade}R</div>
              <p className="text-sm text-gray-300">Lowest R-multiple</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="signals" className="data-[state=active]:bg-slate-700">Recent Signals</TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-slate-700">Asset Performance</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="signals">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Recent Trading Signals</CardTitle>
              <CardDescription>Latest signals with performance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentSignals.slice(0, 10).map((signal, index) => (
                  <div key={signal.id || index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{signal.symbol}</span>
                        <span className={`font-medium ${getDirectionColor(signal.direction)}`}>
                          {signal.direction}
                        </span>
                      </div>
                      <Badge className={getStatusColor(signal.status)}>
                        {signal.status}
                      </Badge>
                      <div className="text-sm text-gray-300">
                        {signal.confidence}% confidence
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-300">Entry: ${signal.entry_price}</div>
                        {signal.exit_price && (
                          <div className="text-sm text-gray-300">Exit: ${signal.exit_price}</div>
                        )}
                      </div>
                      {signal.r_multiple !== null && (
                        <div className={`text-lg font-bold ${getRMultipleColor(signal.r_multiple)}`}>
                          {signal.r_multiple > 0 ? '+' : ''}{signal.r_multiple}R
                        </div>
                      )}
                      <div className="text-sm text-gray-400">
                        {new Date(signal.entry_time).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Asset Performance Breakdown</CardTitle>
              <CardDescription>Performance metrics by trading instrument</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'BTC', 'ETH'].map((symbol) => {
                  const assetData = data.assetPerformance.find(a => a.symbol === symbol)
                  const assetSignals = data.recentSignals.filter(s => s.symbol === symbol)
                  const winRate = assetSignals.length > 0 
                    ? (assetSignals.filter(s => s.r_multiple > 0).length / assetSignals.filter(s => s.status === 'closed').length) * 100 
                    : 0
                  
                  return (
                    <div key={symbol} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <h3 className="font-medium text-white mb-2">{symbol}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Signals:</span>
                          <span className="text-white">{assetSignals.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Win Rate:</span>
                          <span className="text-green-400">{winRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Avg R:</span>
                          <span className="text-blue-400">
                            {assetData?.avg_r_multiple?.toFixed(2) || '0.00'}R
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Performance Trends</CardTitle>
                <CardDescription>Historical performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-gray-300">Consecutive Wins</span>
                    <span className="text-green-400 font-bold">
                      {data.performanceData[0]?.max_consecutive_wins || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-gray-300">Consecutive Losses</span>
                    <span className="text-red-400 font-bold">
                      {data.performanceData[0]?.max_consecutive_losses || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-gray-300">Max Drawdown</span>
                    <span className="text-yellow-400 font-bold">
                      {data.performanceData[0]?.max_drawdown_percentage || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white">Trade Distribution</CardTitle>
                <CardDescription>Analysis of trade outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Winning Trades</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-400 rounded-full"
                          style={{ width: `${data.summary.winRate}%` }}
                        ></div>
                      </div>
                      <span className="text-green-400 font-bold">{data.summary.winRate}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Losing Trades</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-400 rounded-full"
                          style={{ width: `${100 - data.summary.winRate}%` }}
                        ></div>
                      </div>
                      <span className="text-red-400 font-bold">{(100 - data.summary.winRate).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
