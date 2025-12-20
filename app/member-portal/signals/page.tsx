'use client'

import { useEffect, useState } from 'react'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Signal, 
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  Copy,
  Star,
  BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface SignalData {
  id: string
  symbol: string
  action: string
  entry_price: number
  current_price?: number
  target_price: number
  stop_loss: number
  confidence: number
  status: string
  pnl?: number
  pnl_percent?: number
  created_at: string
  closed_at?: string
}

interface TrackedSignal {
  signal_id: string
  user_id: string
  is_following: boolean
  copied_to_portfolio: boolean
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<SignalData[]>([])
  const [filteredSignals, setFilteredSignals] = useState<SignalData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [trackedSignals, setTrackedSignals] = useState<Map<string, TrackedSignal>>(new Map())
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUserAndSignals()
  }, [])

  useEffect(() => {
    filterSignals()
  }, [signals, searchTerm, statusFilter])

  async function loadUserAndSignals() {
    try {
      const supabase = createClient()
      
      // Get user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      
      // Load signals
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setSignals(data || [])
      
      // Load tracked signals for this user
      if (currentUser) {
        const { data: tracked } = await supabase
          .from('tracked_signals')
          .select('*')
          .eq('user_id', currentUser.id)
        
        if (tracked) {
          const trackedMap = new Map()
          tracked.forEach((t: any) => trackedMap.set(t.signal_id, t))
          setTrackedSignals(trackedMap)
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading signals:', error)
      setLoading(false)
    }
  }

  async function toggleFollowSignal(signalId: string) {
    if (!user) return

    try {
      const supabase = createClient()
      const isCurrentlyFollowing = trackedSignals.get(signalId)?.is_following || false

      if (isCurrentlyFollowing) {
        // Unfollow
        await supabase
          .from('tracked_signals')
          .delete()
          .eq('signal_id', signalId)
          .eq('user_id', user.id)

        const newTracked = new Map(trackedSignals)
        newTracked.delete(signalId)
        setTrackedSignals(newTracked)
      } else {
        // Follow
        const { data } = await supabase
          .from('tracked_signals')
          .insert({
            signal_id: signalId,
            user_id: user.id,
            is_following: true,
            copied_to_portfolio: false
          })
          .select()
          .single()

        if (data) {
          const newTracked = new Map(trackedSignals)
          newTracked.set(signalId, data)
          setTrackedSignals(newTracked)
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  async function copyToPortfolio(signal: SignalData) {
    if (!user) return

    try {
      const supabase = createClient()
      
      // Get or create default portfolio
      let { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single()

      if (!portfolio) {
        const { data: newPortfolio } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            name: 'My Portfolio',
            description: 'My trading portfolio',
            visibility: 'public',
            is_default: true
          })
          .select()
          .single()
        portfolio = newPortfolio
      }

      // Copy signal to positions
      await supabase
        .from('positions')
        .insert({
          user_id: user.id,
          portfolio_id: portfolio.id,
          symbol: signal.symbol,
          type: 'stock',
          direction: signal.action === 'BUY' ? 'long' : 'short',
          entry_price: signal.entry_price,
          current_price: signal.entry_price,
          quantity: 100, // Default quantity
          stop_loss: signal.stop_loss,
          take_profit: signal.target_price,
          entry_date: new Date().toISOString().split('T')[0],
          status: 'open',
          notes: `Copied from admin signal #${signal.id}`
        })

      // Update tracked signal
      await supabase
        .from('tracked_signals')
        .upsert({
          signal_id: signal.id,
          user_id: user.id,
          is_following: true,
          copied_to_portfolio: true
        })

      alert(`✅ ${signal.symbol} copied to your portfolio!`)
      
      // Refresh tracked signals
      loadUserAndSignals()
    } catch (error) {
      console.error('Error copying to portfolio:', error)
      alert('Error copying signal. Please try again.')
    }
  }

  function filterSignals() {
    let filtered = signals

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSignals(filtered)
  }

  function exportToCSV() {
    const headers = ['Symbol', 'Action', 'Entry Price', 'Target', 'Stop Loss', 'Status', 'P&L', 'Date']
    const rows = filteredSignals.map(s => [
      s.symbol,
      s.action,
      s.entry_price,
      s.target_price,
      s.stop_loss,
      s.status,
      s.pnl || 0,
      new Date(s.created_at).toLocaleDateString()
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `signals-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const stats = {
    total: signals.length,
    active: signals.filter(s => s.status === 'active').length,
    closed: signals.filter(s => s.status === 'closed').length,
    stopped: signals.filter(s => s.status === 'stopped_out').length,
    totalPnL: signals.reduce((sum, s) => sum + (s.pnl || 0), 0),
    winRate: signals.filter(s => s.status === 'closed').length > 0
      ? (signals.filter(s => s.status === 'closed' && (s.pnl || 0) > 0).length / 
         signals.filter(s => s.status === 'closed').length * 100).toFixed(1)
      : '0'
  }

  return (
    <MemberPortalLayoutNew>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Trading Signals</h1>
            <p className="text-gray-400 mt-1">All signals from our trading system</p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Signals</CardTitle>
              <Signal className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold data-value">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold data-value text-green-400">{stats.active}</div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Closed</CardTitle>
              <Target className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold data-value">{stats.closed}</div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold data-value">{stats.winRate}%</div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold data-value ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.totalPnL.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-white/10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'closed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('closed')}
                  size="sm"
                >
                  Closed
                </Button>
                <Button
                  variant={statusFilter === 'stopped_out' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('stopped_out')}
                  size="sm"
                >
                  Stopped
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signals List */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-2xl">Signals ({filteredSignals.length})</CardTitle>
            <CardDescription>
              {statusFilter === 'all' ? 'All signals' : `${statusFilter} signals`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading signals...</p>
              </div>
            ) : filteredSignals.length === 0 ? (
              <div className="text-center py-12">
                <Signal className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No signals found</p>
                <p className="text-sm text-gray-500 mt-2">
                  {searchTerm ? 'Try a different search term' : 'Signals will appear here when generated'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="glass-card rounded-xl p-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left: Symbol & Action */}
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          signal.action === 'BUY' 
                            ? 'bg-green-600/20' 
                            : 'bg-red-600/20'
                        }`}>
                          {signal.action === 'BUY' ? (
                            <TrendingUp className="h-6 w-6 text-green-400" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-red-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{signal.symbol}</h3>
                          <p className="text-sm text-gray-400">
                            {signal.action} @ ${signal.entry_price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Prices */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Target</p>
                          <p className="font-semibold text-green-400">
                            ${signal.target_price.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
                          <p className="font-semibold text-red-400">
                            ${signal.stop_loss.toFixed(2)}
                          </p>
                        </div>
                        {signal.pnl !== undefined && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">P&L</p>
                            <p className={`font-semibold ${signal.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${signal.pnl.toFixed(2)}
                              {signal.pnl_percent && ` (${signal.pnl_percent.toFixed(1)}%)`}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Status & Date */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant={
                            signal.status === 'active' ? 'default' :
                            signal.status === 'closed' ? 'secondary' :
                            'destructive'
                          }
                          className="capitalize"
                        >
                          {signal.status.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(signal.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Confidence</span>
                        <span className="text-xs font-semibold">{signal.confidence}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {user && signal.status === 'active' && (
                      <div className="mt-4 pt-4 border-t border-gray-800 flex gap-3">
                        <Button
                          onClick={() => toggleFollowSignal(signal.id)}
                          variant={trackedSignals.get(signal.id)?.is_following ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                        >
                          <Star className={`h-4 w-4 mr-2 ${trackedSignals.get(signal.id)?.is_following ? 'fill-current' : ''}`} />
                          {trackedSignals.get(signal.id)?.is_following ? 'Following' : 'Follow Signal'}
                        </Button>
                        
                        {!trackedSignals.get(signal.id)?.copied_to_portfolio && (
                          <Button
                            onClick={() => copyToPortfolio(signal)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-cyan-500/50 hover:bg-cyan-500/10"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy to Portfolio
                          </Button>
                        )}
                        
                        {trackedSignals.get(signal.id)?.copied_to_portfolio && (
                          <Badge variant="secondary" className="flex-1 justify-center">
                            ✓ In Your Portfolio
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberPortalLayoutNew>
  )
}
