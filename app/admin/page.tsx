'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  Users, 
  DollarSign,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  Cpu,
  Download,
  BarChart3,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Tab type
type Tab = 'positions' | 'members'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('positions')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/admin/dashboard')
      
      if (response.ok) {
        const result = await response.json()
        setDashboardData(result.data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Initial load and polling every 30 seconds
  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const stats = dashboardData?.stats

  return (
    <div className="w-full min-h-screen bg-gray-950">
      {/* Page Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage your portfolio and members
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm text-gray-300 font-medium" suppressHydrationWarning>
                  {mounted ? lastUpdate.toLocaleTimeString() : '--:--:--'}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={loadDashboardData}
                disabled={isRefreshing}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'positions'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              📈 Your Positions
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'members'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              👥 Members
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Members"
            value={stats?.members?.total || 0}
            change={`+${stats?.members?.newThisWeek || 0} this week`}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Open Positions"
            value={stats?.positions?.open || 0}
            subtitle={`${stats?.positions?.swings || 0} swings, ${stats?.positions?.options || 0} options`}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Today's P&L"
            value={formatCurrency(stats?.performance?.todayPnl || 0)}
            change={`Week: ${formatCurrency(stats?.performance?.weekPnl || 0)}`}
            icon={DollarSign}
            color={stats?.performance?.todayPnl >= 0 ? 'green' : 'red'}
          />
          <StatCard
            title="Win Rate"
            value={`${stats?.performance?.winRate || 0}%`}
            subtitle={`${stats?.positions?.closed || 0} closed positions`}
            icon={BarChart3}
            color="purple"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'positions' ? (
          <PositionsTab 
            openPositions={dashboardData?.openPositions || []}
            recentClosed={dashboardData?.recentClosed || []}
            stats={stats}
            router={router}
          />
        ) : (
          <MembersTab 
            members={dashboardData?.recentMembers || []}
            stats={stats}
            router={router}
          />
        )}

        {/* System Health & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* System Health */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                System Health
              </h3>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
            <div className="space-y-3">
              <StatusRow label="Database" status="online" />
              <StatusRow label="API" status="online" />
              <StatusRow label="Auth" status="online" />
              <div className="pt-3 border-t border-gray-800">
                <p className="text-xs text-gray-500">Activity (24h)</p>
                <p className="text-2xl font-bold text-white">{stats?.activity?.last24h || 0}</p>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Activity Feed
              </h3>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                Live
              </Badge>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((event: any) => (
                  <ActivityItem key={event.id} activity={event} mounted={mounted} />
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Positions Tab Component
function PositionsTab({ openPositions, recentClosed, stats, router }: any) {
  return (
    <div className="space-y-6">
      {/* Portfolio Overview Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Portfolio</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => router.push('/admin/positions/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Position
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/admin/positions')}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              View All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/admin/positions/analytics')}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Portfolio Heat</p>
            <p className="text-2xl font-bold text-white">{stats?.risk?.portfolioHeatPercent || 0}%</p>
            <p className="text-xs text-gray-500">${formatNumber(stats?.risk?.portfolioHeatDollars || 0)} at risk</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Unrealized P&L</p>
            <p className={`text-2xl font-bold ${stats?.performance?.totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats?.performance?.totalUnrealizedPnl || 0)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Month P&L</p>
            <p className={`text-2xl font-bold ${stats?.performance?.monthPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats?.performance?.monthPnl || 0)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Closed Positions</p>
            <p className="text-2xl font-bold text-white">{stats?.positions?.closed || 0}</p>
            <p className="text-xs text-gray-500">{stats?.performance?.winRate || 0}% win rate</p>
          </div>
        </div>

        {/* Open Positions Table */}
        <h3 className="text-lg font-semibold text-white mb-4">Open Positions ({openPositions.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="pb-3 font-medium">Symbol</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Entry</th>
                <th className="pb-3 font-medium">Current</th>
                <th className="pb-3 font-medium">P&L</th>
                <th className="pb-3 font-medium">Risk</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {openPositions.length > 0 ? openPositions.map((pos: any) => (
                <tr key={pos.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3">
                    <div className="font-medium text-white">{pos.symbol}</div>
                    <div className="text-xs text-gray-500">{pos.direction.toUpperCase()}</div>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="text-xs">
                      {pos.position_type || 'Swing'}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-300">${pos.entry_price}</td>
                  <td className="py-3 text-gray-300">${pos.current_price || pos.entry_price}</td>
                  <td className="py-3">
                    <div className={pos.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatCurrency(pos.unrealized_pnl || 0)}
                    </div>
                    <div className="text-xs text-gray-500">{pos.unrealized_pnl_pct?.toFixed(2) || 0}%</div>
                  </td>
                  <td className="py-3">
                    <div className="text-gray-300">${pos.risk_dollars || 0}</div>
                    <div className="text-xs text-gray-500">{pos.risk_percent || 0}%</div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/positions/${pos.id}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/position/${pos.id}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No open positions. Click "Add Position" to create your first trade.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Closed Positions */}
      {recentClosed.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Closed Positions</h3>
          <div className="space-y-3">
            {recentClosed.map((pos: any) => (
              <div key={pos.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium text-white">{pos.symbol}</div>
                    <div className="text-xs text-gray-500">
                      {pos.direction.toUpperCase()} • {new Date(pos.closed_at).toLocaleDateString()}
                    </div>
                  </div>
                  {pos.trade_grade && (
                    <Badge variant="outline" className="text-xs">
                      Grade: {pos.trade_grade}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className={`font-medium ${pos.realized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(pos.realized_pnl || 0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pos.actual_r_multiple ? `${pos.actual_r_multiple}R` : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Members Tab Component
function MembersTab({ members, stats, router }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Member Management</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => alert('Add member feature coming soon')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alert('Export feature coming soon')}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Total Members</p>
            <p className="text-2xl font-bold text-white">{stats?.members?.total || 0}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Active</p>
            <p className="text-2xl font-bold text-green-400">{stats?.members?.active || 0}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Premium</p>
            <p className="text-2xl font-bold text-purple-400">{stats?.members?.premium || 0}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">New This Week</p>
            <p className="text-2xl font-bold text-blue-400">+{stats?.members?.newThisWeek || 0}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-4">Recent Members</h3>
        <div className="space-y-3">
          {members.length > 0 ? members.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-medium text-white">{member.name}</div>
                  <div className="text-sm text-gray-400">{member.email}</div>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    member.subscription_status === 'active' 
                      ? 'bg-green-500/10 text-green-400 border-green-500/50'
                      : 'bg-gray-500/10 text-gray-400 border-gray-500/50'
                  }
                >
                  {member.subscription_status}
                </Badge>
                {member.tier !== 'free' && (
                  <Badge variant="outline" className="text-xs">
                    {member.tier}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  {new Date(member.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" className="h-8">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-8">No members yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, subtitle, change, icon: Icon, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    red: 'bg-red-500/10 text-red-400',
    purple: 'bg-purple-500/10 text-purple-400',
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">{title}</p>
        <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses['blue']}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      {change && <p className="text-sm text-gray-500">{change}</p>}
    </div>
  )
}

// Status Row Component
function StatusRow({ label, status }: { label: string; status: 'online' | 'offline' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <Badge 
        variant="outline" 
        className={status === 'online' 
          ? 'bg-green-500/10 text-green-400 border-green-500/50' 
          : 'bg-red-500/10 text-red-400 border-red-500/50'
        }
      >
        <div className={`h-2 w-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'} mr-1.5`} />
        {status}
      </Badge>
    </div>
  )
}

// Activity Item Component
function ActivityItem({ activity, mounted }: any) {
  const typeColors: Record<string, string> = {
    position_opened: 'bg-green-500',
    position_closed: 'bg-blue-500',
    stop_moved: 'bg-yellow-500',
    target_hit: 'bg-purple-500',
    note_added: 'bg-cyan-500',
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${typeColors[activity.type] || 'bg-gray-500'}`} />
        <span className="text-sm text-gray-300">{activity.message}</span>
      </div>
      <span className="text-xs text-gray-500" suppressHydrationWarning>
        {mounted ? new Date(activity.timestamp).toLocaleTimeString() : '--:--'}
      </span>
    </div>
  )
}

// Utility functions
function formatCurrency(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
