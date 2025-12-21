'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AnalyticsData {
  revenue: {
    daily: Array<{ date: string; amount: number }>
    weekly: Array<{ week: string; amount: number }>
    monthly: Array<{ month: string; amount: number }>
    mrr: number
    arr: number
    growth: number
  }
  members: {
    total: number
    active: number
    new_this_month: number
    churn_rate: number
    growth_rate: number
    by_tier: Record<string, number>
    retention_rate: number
  }
  signals: {
    total: number
    win_rate: number
    avg_profit: number
    by_symbol: Array<{ symbol: string; count: number; win_rate: number }>
    performance_trend: Array<{ date: string; win_rate: number }>
  }
  engagement: {
    daily_active_users: number
    avg_session_duration: number
    signals_per_user: number
    discord_engagement: number
  }
}

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const router = useRouter()

  useEffect(() => {
    // Check for admin authentication cookie
    const isAuth = document.cookie.includes('admin_authenticated=true')
    if (isAuth) {
      setIsAuthenticated(true)
      loadAnalytics()
    } else {
      router.push('/admin/login')
    }
  }, [router, timeframe])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-white text-lg">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">📊 Analytics Dashboard</h1>
              <p className="text-gray-300">Business intelligence and performance metrics</p>
            </div>
            <div className="flex gap-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Revenue Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-green-400">💰 Revenue Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Monthly Recurring Revenue</p>
                  <p className="text-3xl font-bold text-green-400">${analytics.revenue.mrr.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {analytics.revenue.growth > 0 ? '↗' : '↘'} {Math.abs(analytics.revenue.growth)}% vs last month
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Annual Recurring Revenue</p>
                  <p className="text-3xl font-bold text-blue-400">${analytics.revenue.arr.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">Projected annual</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Growth Rate</p>
                  <p className="text-3xl font-bold text-purple-400">{analytics.revenue.growth}%</p>
                  <p className="text-sm text-gray-500 mt-2">Month over month</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Avg Revenue/User</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    ${(analytics.revenue.mrr / analytics.members.active).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Per active member</p>
                </div>
              </div>

              {/* Revenue Trend */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 30 Days)</h3>
                <div className="space-y-2">
                  {analytics.revenue.daily.slice(-30).map((day, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-sm text-gray-400 w-24">{day.date}</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
                        <div
                          className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${(day.amount / Math.max(...analytics.revenue.daily.map(d => d.amount))) * 100}%` }}
                        >
                          <span className="text-xs font-semibold">${day.amount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Member Analytics */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">👥 Member Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Total Members</p>
                  <p className="text-3xl font-bold text-blue-400">{analytics.members.total}</p>
                  <p className="text-sm text-gray-500 mt-2">All time</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Active Members</p>
                  <p className="text-3xl font-bold text-green-400">{analytics.members.active}</p>
                  <p className="text-sm text-gray-500 mt-2">Currently subscribed</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">New This Month</p>
                  <p className="text-3xl font-bold text-purple-400">{analytics.members.new_this_month}</p>
                  <p className="text-sm text-gray-500 mt-2">+{analytics.members.growth_rate}% growth</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Retention Rate</p>
                  <p className="text-3xl font-bold text-yellow-400">{analytics.members.retention_rate}%</p>
                  <p className="text-sm text-gray-500 mt-2">Churn: {analytics.members.churn_rate}%</p>
                </div>
              </div>

              {/* Member Distribution */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Members by Tier</h3>
                <div className="space-y-4">
                  {Object.entries(analytics.members.by_tier).map(([tier, count]) => (
                    <div key={tier} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-24 capitalize">{tier}</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-8 relative">
                        <div
                          className={`h-8 rounded-full flex items-center justify-end pr-3 ${
                            tier === 'premium' ? 'bg-purple-500' :
                            tier === 'basic' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${(count / analytics.members.total) * 100}%` }}
                        >
                          <span className="text-sm font-semibold">{count} ({Math.round((count / analytics.members.total) * 100)}%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Signal Performance */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">⚡ Signal Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Total Signals</p>
                  <p className="text-3xl font-bold text-yellow-400">{analytics.signals.total}</p>
                  <p className="text-sm text-gray-500 mt-2">All time</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Win Rate</p>
                  <p className="text-3xl font-bold text-green-400">{analytics.signals.win_rate}%</p>
                  <p className="text-sm text-gray-500 mt-2">Profitable signals</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Avg Profit</p>
                  <p className="text-3xl font-bold text-blue-400">${analytics.signals.avg_profit}</p>
                  <p className="text-sm text-gray-500 mt-2">Per winning signal</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Signals/User</p>
                  <p className="text-3xl font-bold text-purple-400">{analytics.engagement.signals_per_user}</p>
                  <p className="text-sm text-gray-500 mt-2">Average per member</p>
                </div>
              </div>

              {/* Performance by Symbol */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Performance by Symbol</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.signals.by_symbol.map((item) => (
                    <div key={item.symbol} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg">{item.symbol}</span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          item.win_rate >= 70 ? 'bg-green-600' :
                          item.win_rate >= 50 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}>
                          {item.win_rate}% Win Rate
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{item.count} signals</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">📈 Engagement Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Daily Active Users</p>
                  <p className="text-3xl font-bold text-purple-400">{analytics.engagement.daily_active_users}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {Math.round((analytics.engagement.daily_active_users / analytics.members.active) * 100)}% of active
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Avg Session Duration</p>
                  <p className="text-3xl font-bold text-blue-400">{analytics.engagement.avg_session_duration}m</p>
                  <p className="text-sm text-gray-500 mt-2">Per user session</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Discord Engagement</p>
                  <p className="text-3xl font-bold text-green-400">{analytics.engagement.discord_engagement}%</p>
                  <p className="text-sm text-gray-500 mt-2">Active in Discord</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Platform Health</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {analytics.engagement.daily_active_users > analytics.members.active * 0.5 ? '🟢' : '🟡'} 
                    {analytics.engagement.daily_active_users > analytics.members.active * 0.5 ? 'Excellent' : 'Good'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Overall status</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
