'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Signal, 
  Wallet,
  Users,
  User,
  Trophy,
  Plus,
  ExternalLink,
  Calendar,
  DollarSign,
  Target,
  RefreshCw,
  AlertCircle,
  Clock,
  Search,
  Filter,
  X,
  ArrowUpDown,
  Download
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import { CommunityActivityFeed } from '@/components/community-activity-feed'
import { RecentActivityWidget } from '@/components/widgets/recent-activity-widget'
import { PerformanceChart } from '@/components/charts/performance-chart'
import { WatchlistCompact } from '@/components/positions/watchlist-compact'
import { 
  AdvancedPositionFilters, 
  defaultAdvancedFilters, 
  applyAdvancedFilters,
  type AdvancedFilters 
} from '@/components/filters/advanced-position-filters'

interface Position {
  id: string
  symbol: string
  type: string
  direction: string
  entry_price: number
  current_price: number | null
  quantity: number
  entry_date: string
  exit_date: string | null
  exit_price: number | null
  status: string
  pnl: number | null
  pnl_percentage: number | null
  notes: string | null
}

interface AdminPosition {
  id: string
  symbol: string
  type: string
  direction: string
  entry_price: number
  current_price: number | null
  quantity: number
  entry_date: string
  status: string
  target_price: number | null
  stop_loss: number | null
  notes: string | null
}

interface LeaderboardEntry {
  rank: number
  username: string
  display_name: string | null
  total_return_pct: number
  avatar_url: string | null
}

// Loading skeleton component
const StatCardSkeleton = () => (
  <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
      <div className="h-4 w-4 bg-gray-700 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-32 bg-gray-700 rounded animate-pulse mb-2" />
      <div className="h-3 w-20 bg-gray-700 rounded animate-pulse" />
    </CardContent>
  </Card>
)

export default function MemberDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [myPositions, setMyPositions] = useState<Position[]>([])
  const [adminPositions, setAdminPositions] = useState<AdminPosition[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [stats, setStats] = useState({
    totalValue: 0,
    totalPnL: 0,
    openPositions: 0,
    closedPositions: 0,
    winRate: 0,
    rank: null as number | null,
    avgWin: 0,
    avgLoss: 0,
    largestWin: 0,
    largestLoss: 0,
    totalTrades: 0
  })
  
  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'pnl' | 'symbol'>('date')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(defaultAdvancedFilters)

  // Check if filters are active (defined early for use in useEffect)
  const hasActiveFilters = 
    searchQuery !== '' || 
    statusFilter !== 'all' || 
    sortBy !== 'date' ||
    advancedFilters.dateRangeType !== 'all' ||
    advancedFilters.pnlRangeEnabled

  // Filter and sort positions
  const filteredAndSortedPositions = React.useMemo(() => {
    let filtered = [...myPositions]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    // Apply advanced filters
    filtered = applyAdvancedFilters(filtered, advancedFilters)

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'pnl':
          return (b.pnl || 0) - (a.pnl || 0)
        case 'symbol':
          return a.symbol.localeCompare(b.symbol)
        case 'date':
        default:
          return new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      }
    })

    return filtered
  }, [myPositions, searchQuery, statusFilter, sortBy, advancedFilters])

  // Paginated positions
  const paginatedPositions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedPositions.slice(startIndex, endIndex)
  }, [filteredAndSortedPositions, currentPage, itemsPerPage])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedPositions.length / itemsPerPage)
  const showPagination = filteredAndSortedPositions.length > itemsPerPage

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('date')
    setAdvancedFilters(defaultAdvancedFilters)
    setCurrentPage(1) // Reset to first page
  }

  // Clear only advanced filters
  const clearAdvancedFilters = () => {
    setAdvancedFilters(defaultAdvancedFilters)
    setCurrentPage(1)
  }

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const changeItemsPerPage = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // CSV Export function
  const exportToCSV = () => {
    if (filteredAndSortedPositions.length === 0) {
      alert('No positions to export')
      return
    }

    // CSV headers
    const headers = [
      'Symbol',
      'Type',
      'Direction',
      'Status',
      'Entry Price',
      'Current Price',
      'Exit Price',
      'Quantity',
      'Entry Date',
      'Exit Date',
      'P&L',
      'P&L %',
      'Notes'
    ]

    // Convert positions to CSV rows
    const rows = filteredAndSortedPositions.map(position => [
      position.symbol,
      position.type,
      position.direction,
      position.status,
      position.entry_price.toFixed(2),
      position.current_price ? position.current_price.toFixed(2) : '',
      position.exit_price ? position.exit_price.toFixed(2) : '',
      position.quantity,
      new Date(position.entry_date).toLocaleDateString(),
      position.exit_date ? new Date(position.exit_date).toLocaleDateString() : '',
      position.pnl !== null ? position.pnl.toFixed(2) : '',
      position.pnl_percentage !== null ? position.pnl_percentage.toFixed(2) : '',
      position.notes || ''
    ])

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        // Escape commas and quotes in cell content
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      ).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `positions_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // R key for refresh (not in input)
      if (e.key === 'r' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        handleRefresh()
      }
      // Escape to clear filters
      if (e.key === 'Escape' && hasActiveFilters) {
        clearFilters()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [hasActiveFilters])

  // Manual refresh function
  const handleRefresh = async () => {
    setError(null)
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  async function loadDashboardData() {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // Load or create user's portfolio
      let { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('is_default', true)
        .single()

      // If no portfolio exists, create one
      if (!portfolioData && portfolioError) {
        console.log('No portfolio found, creating default portfolio...')
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert([
            {
              user_id: currentUser.id,
              name: 'Default Portfolio',
              is_default: true,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (createError) {
          throw new Error(`Failed to create portfolio: ${createError.message}`)
        }

        portfolioData = newPortfolio
      }

      if (portfolioData) {
        // Load user's positions
        const { data: positionsData, error: posError } = await supabase
          .from('positions')
          .select('*')
          .eq('portfolio_id', portfolioData.id)
          .order('entry_date', { ascending: false })

        if (posError) {
          throw new Error(`Failed to load positions: ${posError.message}`)
        }

        if (positionsData) {
          setMyPositions(positionsData)
          
          // Calculate enhanced stats
          const open = positionsData.filter(p => p.status === 'open').length
          const closed = positionsData.filter(p => p.status === 'closed')
          const wins = closed.filter(p => p.pnl && p.pnl > 0)
          const losses = closed.filter(p => p.pnl && p.pnl < 0)
          const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0
          const totalPnL = positionsData.reduce((sum, p) => sum + (p.pnl || 0), 0)
          
          // Calculate average win/loss
          const avgWin = wins.length > 0 
            ? wins.reduce((sum, p) => sum + (p.pnl || 0), 0) / wins.length 
            : 0
          const avgLoss = losses.length > 0 
            ? losses.reduce((sum, p) => sum + (p.pnl || 0), 0) / losses.length 
            : 0
          
          // Find largest win/loss
          const largestWin = wins.length > 0 
            ? Math.max(...wins.map(p => p.pnl || 0)) 
            : 0
          const largestLoss = losses.length > 0 
            ? Math.min(...losses.map(p => p.pnl || 0)) 
            : 0
          
          setStats({
            totalValue: positionsData.reduce((sum, p) => 
              p.status === 'open' ? sum + (p.current_price || p.entry_price) * p.quantity : sum, 0
            ),
            totalPnL,
            openPositions: open,
            closedPositions: closed.length,
            winRate,
            rank: null,
            avgWin,
            avgLoss,
            largestWin,
            largestLoss,
            totalTrades: positionsData.length
          })
        }
      }

      // Load admin positions (signals)
      const { data: adminData, error: adminError } = await supabase
        .from('positions')
        .select('*')
        .eq('is_admin_signal', true)
        .eq('status', 'open')
        .order('entry_date', { ascending: false })
        .limit(10)

      if (adminError) {
        console.warn('Failed to load admin signals:', adminError)
      } else if (adminData) {
        setAdminPositions(adminData)
      }

      // Load leaderboard
      const { data: leaderboardData, error: leaderError } = await supabase
        .from('user_profiles')
        .select('username, display_name, total_return_pct, avatar_url')
        .eq('is_profile_public', true)
        .not('total_return_pct', 'is', null)
        .order('total_return_pct', { ascending: false })
        .limit(5)

      if (leaderError) {
        console.warn('Failed to load leaderboard:', leaderError)
      } else if (leaderboardData) {
        setLeaderboard(leaderboardData.map((entry, index) => ({
          rank: index + 1,
          ...entry,
          total_return_pct: entry.total_return_pct || 0
        })))
      }

      // Get user's rank
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('username, total_return_pct')
        .eq('user_id', currentUser.id)
        .single()

      if (profileData && profileData.total_return_pct !== null) {
        const { count } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_profile_public', true)
          .gt('total_return_pct', profileData.total_return_pct)

        setStats(prev => ({ ...prev, rank: (count || 0) + 1 }))
      }

      setLastUpdated(new Date())
      setError(null)
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
      setLoading(false)
    }
  }

  // Loading state with skeletons
  if (loading) {
    return (
      <MemberPortalLayoutNew>
        <div className="space-y-6">
          <div>
            <div className="h-9 w-48 bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-5 w-64 bg-gray-700 rounded animate-pulse" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          
          <div className="text-center py-12">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-500" />
            <p className="text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </MemberPortalLayoutNew>
    )
  }

  return (
    <MemberPortalLayoutNew>
      <div className="space-y-6">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's your trading overview.</p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span suppressHydrationWarning>
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                className="ml-4"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
              <p className={`text-xs ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)} P&L
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Open Positions</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openPositions}</div>
              <p className="text-xs text-gray-400">{stats.closedPositions} closed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-400">Success rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Your Rank</CardTitle>
              <Trophy className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.rank ? `#${stats.rank}` : 'N/A'}
              </div>
              <Link href="/leaderboard" className="text-xs text-cyan-400 hover:underline">
                View Leaderboard
              </Link>
            </CardContent>
          </Card>

          {/* Average Win */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Win</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {stats.avgWin > 0 ? `+$${stats.avgWin.toFixed(2)}` : '$0.00'}
              </div>
              <p className="text-xs text-gray-400">
                Largest: {stats.largestWin > 0 ? `+$${stats.largestWin.toFixed(2)}` : '$0'}
              </p>
            </CardContent>
          </Card>

          {/* Average Loss */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Loss</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {stats.avgLoss < 0 ? `$${stats.avgLoss.toFixed(2)}` : '$0.00'}
              </div>
              <p className="text-xs text-gray-400">
                Largest: {stats.largestLoss < 0 ? `$${stats.largestLoss.toFixed(2)}` : '$0'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
          <span className="bg-gray-800 px-2 py-1 rounded">R</span>
          <span>to refresh</span>
          <span className="mx-2">•</span>
          <span className="bg-gray-800 px-2 py-1 rounded">ESC</span>
          <span>to clear filters</span>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">
              <Wallet className="h-4 w-4 mr-2" />
              My Positions
            </TabsTrigger>
            <TabsTrigger value="signals">
              <Signal className="h-4 w-4 mr-2" />
              Live Trades
            </TabsTrigger>
            <TabsTrigger value="community">
              <Users className="h-4 w-4 mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent Activity Widget */}
              <div className="md:col-span-2">
                <RecentActivityWidget positions={myPositions} />
              </div>

              {/* Watchlist Widget */}
              <div className="md:col-span-2">
                <WatchlistCompact />
              </div>

              {/* Performance Chart */}
              <div className="md:col-span-2">
                <PerformanceChart positions={myPositions} />
              </div>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/member-portal/portfolio">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Position
                    </Button>
                  </Link>
                  <Link href="/member-portal/profile">
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/community">
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Browse Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Community Activity Feed */}
              <div className="md:col-span-2">
                <CommunityActivityFeed filter="all" limit={10} showFilters={true} compact={false} />
              </div>
            </div>
          </TabsContent>

          {/* My Positions Tab */}
          <TabsContent value="positions" className="space-y-4">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Trading Positions</CardTitle>
                    <CardDescription>Track all your trades in one place</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {myPositions.length > 0 && (
                      <Button 
                        onClick={exportToCSV}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    )}
                    <Link href="/member-portal/portfolio">
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-500" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Position
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search, Filter, and Sort Controls */}
                {myPositions.length > 0 && (
                  <div className="mb-4 space-y-4">
                    {/* Advanced Filters */}
                    <AdvancedPositionFilters
                      filters={advancedFilters}
                      onFiltersChange={setAdvancedFilters}
                      onClear={clearAdvancedFilters}
                      positionCount={filteredAndSortedPositions.length}
                      totalCount={myPositions.length}
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by symbol..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-gray-800 border-gray-700"
                        />
                      </div>

                      {/* Status Filter */}
                      <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-gray-800 border-gray-700">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open Only</SelectItem>
                          <SelectItem value="closed">Closed Only</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Sort */}
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-gray-800 border-gray-700">
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Sort by Date</SelectItem>
                          <SelectItem value="pnl">Sort by P&L</SelectItem>
                          <SelectItem value="symbol">Sort by Symbol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filter Status and Clear Button */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">
                          Showing {filteredAndSortedPositions.length} of {myPositions.length} positions
                        </span>
                        {hasActiveFilters && (
                          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                            Filtered
                          </Badge>
                        )}
                      </div>
                      {hasActiveFilters && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={clearFilters}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {myPositions.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold mb-2">No positions yet</h3>
                    <p className="text-gray-400 mb-4">Start tracking your trades to see them here</p>
                    <Link href="/member-portal/portfolio">
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Position
                      </Button>
                    </Link>
                  </div>
                ) : filteredAndSortedPositions.length === 0 ? (
                  <div className="text-center py-12">
                    <Filter className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold mb-2">No positions found</h3>
                    <p className="text-gray-400 mb-4">Try adjusting your filters</p>
                    <Button 
                      onClick={clearFilters}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {paginatedPositions.map((position) => (
                        <Link key={position.id} href={`/position/${position.id}`}>
                        <div className="p-4 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${
                                position.direction === 'long' ? 'bg-green-500/20' : 'bg-red-500/20'
                              }`}>
                                {position.direction === 'long' ? (
                                  <TrendingUp className="h-6 w-6 text-green-400" />
                                ) : (
                                  <TrendingDown className="h-6 w-6 text-red-400" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-bold">{position.symbol}</h3>
                                  <Badge variant={position.status === 'open' ? 'default' : 'secondary'}>
                                    {position.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-400">
                                  {position.quantity} shares @ ${position.entry_price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {position.pnl != null && (
                                <div className={`text-lg font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                                  {position.pnl_percentage != null && (
                                    <span className="text-sm ml-1">({position.pnl_percentage.toFixed(2)}%)</span>
                                  )}
                                </div>
                              )}
                              <p className="text-xs text-gray-400">
                                {new Date(position.entry_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        </Link>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {showPagination && (
                      <div className="mt-6 pt-4 border-t border-gray-700">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          {/* Items per page selector */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Show:</span>
                            <Select value={itemsPerPage.toString()} onValueChange={changeItemsPerPage}>
                              <SelectTrigger className="w-[100px] bg-gray-800 border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 per page</SelectItem>
                                <SelectItem value="20">20 per page</SelectItem>
                                <SelectItem value="50">50 per page</SelectItem>
                                <SelectItem value="100">100 per page</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Page info and controls */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              Page {currentPage} of {totalPages} ({filteredAndSortedPositions.length} total)
                            </span>
                          </div>

                          {/* Page buttons */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(1)}
                              disabled={currentPage === 1}
                              className="px-2"
                            >
                              First
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-2"
                            >
                              Prev
                            </Button>
                            
                            {/* Page numbers */}
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                              let pageNum: number
                              if (totalPages <= 5) {
                                pageNum = i + 1
                              } else if (currentPage <= 3) {
                                pageNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                              } else {
                                pageNum = currentPage - 2 + i
                              }
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => goToPage(pageNum)}
                                  className="px-3"
                                >
                                  {pageNum}
                                </Button>
                              )
                            })}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-2"
                            >
                              Next
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className="px-2"
                            >
                              Last
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Admin Trading Signals</CardTitle>
                <CardDescription>Live positions from the admin (signals to follow)</CardDescription>
              </CardHeader>
              <CardContent>
                {adminPositions.length === 0 ? (
                  <div className="text-center py-12">
                    <Signal className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No active signals at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {adminPositions.map((position) => (
                      <div key={position.id} className="p-4 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                              position.direction === 'long' ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}>
                              {position.direction === 'long' ? (
                                <TrendingUp className="h-6 w-6 text-green-400" />
                              ) : (
                                <TrendingDown className="h-6 w-6 text-red-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{position.symbol}</h3>
                              <p className="text-sm text-gray-400">
                                Entry: ${position.entry_price.toFixed(2)}
                                {position.target_price && ` • Target: $${position.target_price.toFixed(2)}`}
                                {position.stop_loss && ` • Stop: $${position.stop_loss.toFixed(2)}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge>Active Signal</Badge>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(position.entry_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Top Traders</CardTitle>
                  <CardDescription>Leaderboard rankings this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-gray-400 py-4">No rankings yet</p>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.map((entry) => (
                        <Link key={entry.rank} href={`/profile/${entry.username}`}>
                          <div className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-gray-400">#{entry.rank}</span>
                              <div>
                                <p className="font-semibold">{entry.display_name || entry.username}</p>
                                <p className="text-xs text-gray-400">@{entry.username}</p>
                              </div>
                            </div>
                            <span className={`font-bold ${entry.total_return_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {entry.total_return_pct >= 0 ? '+' : ''}{entry.total_return_pct.toFixed(2)}%
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link href="/leaderboard">
                    <Button variant="outline" className="w-full mt-4">
                      <Trophy className="h-4 w-4 mr-2" />
                      View Full Leaderboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Community</CardTitle>
                  <CardDescription>Connect with other traders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/community">
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Browse Members
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button variant="outline" className="w-full">
                      <Trophy className="h-4 w-4 mr-2" />
                      View Rankings
                    </Button>
                  </Link>
                  <Link href="/member-portal/profile">
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      My Public Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your public profile and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Link href="/member-portal/profile">
                    <Button variant="outline" className="w-full h-24 flex-col">
                      <User className="h-8 w-8 mb-2" />
                      <span>Edit Profile</span>
                    </Button>
                  </Link>
                  <Link href="/member-portal/settings">
                    <Button variant="outline" className="w-full h-24 flex-col">
                      <Activity className="h-8 w-8 mb-2" />
                      <span>Account Settings</span>
                    </Button>
                  </Link>
                  <Link href="/member-portal/referrals">
                    <Button variant="outline" className="w-full h-24 flex-col">
                      <Users className="h-8 w-8 mb-2" />
                      <span>Referrals</span>
                    </Button>
                  </Link>
                  {user && (
                    <Link href={`/profile/${user.email?.split('@')[0]}`} target="_blank">
                      <Button variant="outline" className="w-full h-24 flex-col">
                        <ExternalLink className="h-8 w-8 mb-2" />
                        <span>View Public Profile</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MemberPortalLayoutNew>
  )
}
