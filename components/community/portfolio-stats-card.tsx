'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, Target, Users, Eye, Award, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PortfolioStats {
  total_trades: number
  winning_trades: number
  losing_trades: number
  win_rate: number
  total_pnl: number
  total_pnl_percent: number
  best_trade_pnl: number
  worst_trade_pnl: number
  avg_win: number
  avg_loss: number
  profit_factor: number
  sharpe_ratio: number | null
  max_drawdown: number
  follower_count: number
  following_count: number
  portfolio_views_count: number
  last_updated_at: string
}

interface PortfolioStatsCardProps {
  userId: string
  showFollowerStats?: boolean
  showAdvancedMetrics?: boolean
  compact?: boolean
}

export function PortfolioStatsCard({
  userId,
  showFollowerStats = true,
  showAdvancedMetrics = false,
  compact = false
}: PortfolioStatsCardProps) {
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStats()
  }, [userId])

  async function loadStats() {
    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('portfolio_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If no stats exist yet, create default
        if (error.code === 'PGRST116') {
          await supabase
            .from('portfolio_stats')
            .insert({ user_id: userId })
          
          // Fetch again
          const { data: newData } = await supabase
            .from('portfolio_stats')
            .select('*')
            .eq('user_id', userId)
            .single()
          
          setStats(newData)
        } else {
          throw error
        }
      } else {
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading portfolio stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="h-6 w-32 bg-gray-800 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-24 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No trading data yet</p>
        </CardContent>
      </Card>
    )
  }

  const { total_trades, win_rate, total_pnl, total_pnl_percent } = stats

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatItem
          label="Total P&L"
          value={formatCurrency(total_pnl)}
          valueColor={total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}
          icon={total_pnl >= 0 ? TrendingUp : TrendingDown}
        />
        <StatItem
          label="Win Rate"
          value={`${win_rate.toFixed(1)}%`}
          icon={Target}
        />
        <StatItem
          label="Trades"
          value={total_trades.toString()}
          icon={Activity}
        />
        {showFollowerStats && (
          <StatItem
            label="Followers"
            value={stats.follower_count.toString()}
            icon={Users}
          />
        )}
      </div>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Portfolio Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total P&L"
              value={formatCurrency(total_pnl)}
              subtitle={`${total_pnl_percent >= 0 ? '+' : ''}${total_pnl_percent.toFixed(2)}%`}
              trend={total_pnl >= 0 ? 'up' : 'down'}
              icon={total_pnl >= 0 ? TrendingUp : TrendingDown}
            />
            <MetricCard
              label="Win Rate"
              value={`${win_rate.toFixed(1)}%`}
              subtitle={`${stats.winning_trades}W / ${stats.losing_trades}L`}
              icon={Target}
            />
            <MetricCard
              label="Total Trades"
              value={total_trades.toString()}
              subtitle={`${stats.winning_trades + stats.losing_trades} closed`}
              icon={Activity}
            />
            <MetricCard
              label="Profit Factor"
              value={stats.profit_factor.toFixed(2)}
              subtitle={stats.profit_factor > 1 ? 'Profitable' : 'Unprofitable'}
              trend={stats.profit_factor > 1 ? 'up' : 'down'}
              icon={Award}
            />
          </div>

          {/* Trade Analysis */}
          {showAdvancedMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              <StatItem
                label="Best Trade"
                value={formatCurrency(stats.best_trade_pnl)}
                valueColor="text-green-400"
              />
              <StatItem
                label="Worst Trade"
                value={formatCurrency(stats.worst_trade_pnl)}
                valueColor="text-red-400"
              />
              <StatItem
                label="Avg Win"
                value={formatCurrency(stats.avg_win)}
                valueColor="text-green-400"
              />
              <StatItem
                label="Avg Loss"
                value={formatCurrency(stats.avg_loss)}
                valueColor="text-red-400"
              />
              <StatItem
                label="Max Drawdown"
                value={formatCurrency(stats.max_drawdown)}
                valueColor="text-orange-400"
              />
              {stats.sharpe_ratio && (
                <StatItem
                  label="Sharpe Ratio"
                  value={stats.sharpe_ratio.toFixed(2)}
                />
              )}
            </div>
          )}

          {/* Social Stats */}
          {showFollowerStats && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              <StatItem
                label="Followers"
                value={stats.follower_count.toString()}
                icon={Users}
              />
              <StatItem
                label="Following"
                value={stats.following_count.toString()}
                icon={Users}
              />
              <StatItem
                label="Profile Views"
                value={stats.portfolio_views_count.toString()}
                icon={Eye}
              />
            </div>
          )}

          {/* Last Updated */}
          <p className="text-xs text-gray-500 text-center">
            Last updated {new Date(stats.last_updated_at).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({
  label,
  value,
  subtitle,
  trend,
  icon: Icon
}: {
  label: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down'
  icon: any
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400">{label}</p>
        <Icon className={`h-4 w-4 ${
          trend === 'up' ? 'text-green-400' : 
          trend === 'down' ? 'text-red-400' : 
          'text-gray-400'
        }`} />
      </div>
      <p className={`text-2xl font-bold ${
        trend === 'up' ? 'text-green-400' : 
        trend === 'down' ? 'text-red-400' : 
        'text-white'
      }`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

function StatItem({
  label,
  value,
  valueColor = 'text-white',
  icon: Icon
}: {
  label: string
  value: string
  valueColor?: string
  icon?: any
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <p className={`text-lg font-bold ${valueColor}`}>
        {value}
      </p>
    </div>
  )
}

function formatCurrency(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}
