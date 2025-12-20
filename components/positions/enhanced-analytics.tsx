'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Award,
  Flame,
  Trophy,
  Target,
  Zap,
  BarChart3,
  Calendar,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'

interface StreakData {
  currentWinStreak: number
  longestWinStreak: number
  currentLossStreak: number
  longestLossStreak: number
  lastTradeWon: boolean
}

interface BestWorstTrades {
  bestTrade: {
    id: string
    ticker: string
    pnl: number
    pnlPct: number
    rMultiple: number
    entryDate: string
    daysHeld: number
  } | null
  worstTrade: {
    id: string
    ticker: string
    pnl: number
    pnlPct: number
    rMultiple: number
    entryDate: string
    daysHeld: number
  } | null
  bestRMultiple: {
    id: string
    ticker: string
    rMultiple: number
    pnl: number
  } | null
  longestWinner: {
    id: string
    ticker: string
    daysHeld: number
    pnl: number
  } | null
}

interface BenchmarkComparison {
  yourReturn: number
  spyReturn: number
  qqqReturn: number
  outperformanceSpy: number
  outperformanceQqq: number
  period: string
}

interface MilestoneAchievement {
  id: string
  title: string
  description: string
  achieved: boolean
  achievedDate?: string
  progress?: number
  target?: number
  icon: string
}

interface EnhancedAnalyticsData {
  streaks: StreakData
  bestWorst: BestWorstTrades
  benchmarks: BenchmarkComparison
  milestones: MilestoneAchievement[]
}

export function EnhancedAnalytics() {
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/positions/enhanced-analytics')
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching enhanced analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="premium-card">
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Streaks Section */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Win/Loss Streaks
          </CardTitle>
          <CardDescription>Track your momentum and consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Current Win Streak */}
            <div className="text-center p-6 glass-card border border-green-500/20 bg-green-500/5 rounded-lg">
              <Flame className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-green-400 data-value">
                {data.streaks.currentWinStreak}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Current Win Streak</p>
              {data.streaks.lastTradeWon && (
                <Badge variant="outline" className="mt-2 text-green-400 border-green-400">
                  On Fire 🔥
                </Badge>
              )}
            </div>

            {/* Longest Win Streak */}
            <div className="text-center p-6 glass-card border border-border rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white data-value">
                {data.streaks.longestWinStreak}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Longest Win Streak</p>
              <p className="text-xs text-muted-foreground mt-1">All-Time Record</p>
            </div>

            {/* Current Loss Streak */}
            <div className="text-center p-6 glass-card border border-red-500/20 bg-red-500/5 rounded-lg">
              <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-red-400 data-value">
                {data.streaks.currentLossStreak}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Current Loss Streak</p>
              {data.streaks.currentLossStreak > 0 && !data.streaks.lastTradeWon && (
                <Badge variant="outline" className="mt-2 text-red-400 border-red-400">
                  Stay Patient
                </Badge>
              )}
            </div>

            {/* Streak Status */}
            <div className="text-center p-6 glass-card border border-primary/20 bg-primary/5 rounded-lg">
              <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold text-white data-value">
                {data.streaks.lastTradeWon ? 'WIN' : 'LOSS'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Last Trade</p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.streaks.lastTradeWon ? 'Keep the momentum!' : 'Bounce back strong!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best & Worst Trades */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Best & Worst Trades
          </CardTitle>
          <CardDescription>Learn from your extremes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Trade */}
            {data.bestWorst.bestTrade && (
              <Link href={`/positions/${data.bestWorst.bestTrade.id}`}>
                <div className="glass-card p-6 border border-green-500/30 bg-green-500/5 hover:border-green-500/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Best Trade
                    </h4>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {data.bestWorst.bestTrade.rMultiple.toFixed(2)}R
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">
                    {data.bestWorst.bestTrade.ticker}
                  </p>
                  <p className="text-3xl font-bold text-green-400 data-value mb-2">
                    +{formatCurrency(data.bestWorst.bestTrade.pnl)}
                  </p>
                  <p className="text-xl text-green-400">
                    +{data.bestWorst.bestTrade.pnlPct.toFixed(2)}%
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/50 flex justify-between text-sm text-muted-foreground">
                    <span>{data.bestWorst.bestTrade.daysHeld} days held</span>
                    <span>{new Date(data.bestWorst.bestTrade.entryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Worst Trade */}
            {data.bestWorst.worstTrade && (
              <Link href={`/positions/${data.bestWorst.worstTrade.id}`}>
                <div className="glass-card p-6 border border-red-500/30 bg-red-500/5 hover:border-red-500/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-red-400" />
                      Worst Trade
                    </h4>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      {data.bestWorst.worstTrade.rMultiple.toFixed(2)}R
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">
                    {data.bestWorst.worstTrade.ticker}
                  </p>
                  <p className="text-3xl font-bold text-red-400 data-value mb-2">
                    {formatCurrency(data.bestWorst.worstTrade.pnl)}
                  </p>
                  <p className="text-xl text-red-400">
                    {data.bestWorst.worstTrade.pnlPct.toFixed(2)}%
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/50 flex justify-between text-sm text-muted-foreground">
                    <span>{data.bestWorst.worstTrade.daysHeld} days held</span>
                    <span>{new Date(data.bestWorst.worstTrade.entryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {data.bestWorst.bestRMultiple && (
              <div className="glass-card p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Highest R-Multiple</p>
                <p className="text-2xl font-bold text-white">
                  {data.bestWorst.bestRMultiple.ticker}
                </p>
                <p className="text-xl text-green-400">
                  {data.bestWorst.bestRMultiple.rMultiple.toFixed(2)}R
                </p>
              </div>
            )}

            {data.bestWorst.longestWinner && (
              <div className="glass-card p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Longest Winning Trade</p>
                <p className="text-2xl font-bold text-white">
                  {data.bestWorst.longestWinner.ticker}
                </p>
                <p className="text-xl text-green-400">
                  {data.bestWorst.longestWinner.daysHeld} days
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Market Benchmark Comparison */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Market Benchmark Comparison
          </CardTitle>
          <CardDescription>How you stack up against the market ({data.benchmarks.period})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Your Return */}
            <div className="text-center p-6 glass-card border border-primary/30 bg-primary/5 rounded-lg">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold text-primary data-value">
                {formatPercent(data.benchmarks.yourReturn)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Your Return</p>
            </div>

            {/* SPY Comparison */}
            <div className="text-center p-6 glass-card border border-border rounded-lg">
              <div className="flex items-center justify-center mb-3">
                {data.benchmarks.outperformanceSpy >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-400" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-400" />
                )}
              </div>
              <p className={`text-3xl font-bold data-value ${
                data.benchmarks.outperformanceSpy >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPercent(data.benchmarks.outperformanceSpy)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">vs SPY</p>
              <p className="text-xs text-muted-foreground">
                SPY: {formatPercent(data.benchmarks.spyReturn)}
              </p>
            </div>

            {/* QQQ Comparison */}
            <div className="text-center p-6 glass-card border border-border rounded-lg">
              <div className="flex items-center justify-center mb-3">
                {data.benchmarks.outperformanceQqq >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-400" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-400" />
                )}
              </div>
              <p className={`text-3xl font-bold data-value ${
                data.benchmarks.outperformanceQqq >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPercent(data.benchmarks.outperformanceQqq)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">vs QQQ</p>
              <p className="text-xs text-muted-foreground">
                QQQ: {formatPercent(data.benchmarks.qqqReturn)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones & Achievements */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Milestones & Achievements
          </CardTitle>
          <CardDescription>Track your progress towards trading goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`p-4 glass-card border rounded-lg ${
                  milestone.achieved
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-border/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{milestone.icon}</span>
                  {milestone.achieved && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      ✓
                    </Badge>
                  )}
                </div>
                <h4 className="font-bold text-white mb-1">{milestone.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {milestone.description}
                </p>
                {milestone.achieved && milestone.achievedDate && (
                  <p className="text-xs text-green-400">
                    Achieved {new Date(milestone.achievedDate).toLocaleDateString()}
                  </p>
                )}
                {!milestone.achieved && milestone.progress !== undefined && milestone.target && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{milestone.progress}</span>
                      <span>{milestone.target}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${(milestone.progress / milestone.target) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
