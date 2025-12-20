'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, Filter, Activity, Search, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { LivePriceIndicator } from '@/components/admin/live-price-indicator'
import { useLivePrices } from '@/hooks/use-live-prices'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { BulkActionsToolbar } from '@/components/bulk-actions/BulkActionsToolbar'
import { useToast } from '@/hooks/use-toast'
import { OptionsPositionCard } from '@/components/positions/options-position-card'

// Helper function to get timeframe badge color
const getTimeframeBadge = (timeframe: string) => {
  switch (timeframe) {
    case 'day':
      return { label: 'Day Trade', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
    case 'swing':
      return { label: 'Swing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    case 'position':
      return { label: 'Position', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    default:
      return { label: timeframe, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  }
}

export default function AdminPositionsPage() {
  const [positions, setPositions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [positionTypeFilter, setPositionTypeFilter] = useState<'all' | 'stocks' | 'options'>('all')
  const { toast } = useToast()
  
  // Live price updates
  const { prices } = useLivePrices({ enabled: true, refreshInterval: 60000 })

  // Apply live price updates to open positions
  const positionsWithLivePrices = positions.map(p => {
    if (p.status === 'open' && prices[p.id]) {
      return {
        ...p,
        current_price: prices[p.id].currentPrice,
        unrealized_pnl: prices[p.id].unrealizedPnL,
        unrealized_pnl_pct: prices[p.id].unrealizedPnLPct,
      }
    }
    return p
  })

  // Filter positions
  const filteredPositions = positionsWithLivePrices.filter(p => {
    // Timeframe filter
    if (activeFilter !== 'all' && p.time_frame !== activeFilter) return false
    
    // Status filter
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    
    // Position type filter (stocks vs options)
    if (positionTypeFilter !== 'all') {
      const isOptions = p.position_type && ['put_credit_spread', 'call_credit_spread', 'iron_condor'].includes(p.position_type)
      if (positionTypeFilter === 'options' && !isOptions) return false
      if (positionTypeFilter === 'stocks' && isOptions) return false
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        p.ticker?.toLowerCase().includes(query) ||
        p.company_name?.toLowerCase().includes(query) ||
        p.setup_type?.toLowerCase().includes(query) ||
        p.sector?.toLowerCase().includes(query) ||
        p.position_type?.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  // Bulk selection
  const selection = useBulkSelection({
    items: filteredPositions,
    idField: 'id'
  })

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Fetch positions with option legs
    const { data, error } = await supabase
      .from('positions')
      .select(`
        *,
        option_legs (
          id,
          leg_type,
          strike,
          expiration,
          contracts,
          premium,
          option_symbol,
          side,
          filled_price,
          current_price,
          leg_order
        )
      `)
      .order('entry_date', { ascending: false })

    if (error) {
      console.error('Error fetching positions:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch positions',
        variant: 'destructive',
      })
    } else {
      // Process positions with legs
      const processedData = (data || []).map(position => ({
        ...position,
        legs: position.option_legs || []
      }))
      setPositions(processedData)
    }
    setLoading(false)
  }

  // Bulk action handlers
  const handleBulkClose = async (items: any[]) => {
    try {
      const response = await fetch('/api/positions/bulk-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionIds: items.map(item => item.id)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to close positions')
      }

      // Success - positions will be refreshed by the toolbar
    } catch (error) {
      console.error('Bulk close error:', error)
      throw error // Re-throw to let toolbar handle it
    }
  }

  const handleBulkDelete = async (items: any[]) => {
    try {
      const response = await fetch('/api/positions/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionIds: items.map(item => item.id)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete positions')
      }

      // Success - positions will be refreshed by the toolbar
    } catch (error) {
      console.error('Bulk delete error:', error)
      throw error // Re-throw to let toolbar handle it
    }
  }

  const handleBulkExport = (items: any[]) => {
    try {
      // Create CSV content
      const headers = [
        'Ticker', 'Company', 'Entry Price', 'Current Price', 'Exit Price',
        'Quantity', 'Status', 'P&L', 'P&L %', 'Entry Date', 'Exit Date',
        'Timeframe', 'Setup Type', 'Stop Loss', 'Target'
      ]

      const rows = items.map(position => [
        position.ticker || '',
        position.company_name || '',
        position.entry_price?.toFixed(2) || '',
        position.current_price?.toFixed(2) || '',
        position.exit_price?.toFixed(2) || '',
        position.quantity || '',
        position.status || '',
        position.status === 'open' 
          ? position.unrealized_pnl?.toFixed(2) || ''
          : position.realized_pnl?.toFixed(2) || '',
        position.status === 'open'
          ? position.unrealized_pnl_pct?.toFixed(2) || ''
          : position.realized_pnl_pct?.toFixed(2) || '',
        position.entry_date || '',
        position.exit_date || '',
        position.time_frame || '',
        position.setup_type || '',
        position.stop_loss?.toFixed(2) || '',
        position.target?.toFixed(2) || ''
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => 
          typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
        ).join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `positions_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: 'Failed to export positions',
        variant: 'destructive',
      })
    }
  }

  // Calculate stats for positions
  const openPositions = filteredPositions.filter((p: any) => p.status === 'open')
  const closedPositions = filteredPositions.filter((p: any) => p.status === 'closed')
  
  const totalPnL = closedPositions.reduce((sum: number, p: any) => sum + (p.realized_pnl || 0), 0)
  const openPnL = openPositions.reduce((sum: number, p: any) => sum + (p.unrealized_pnl || 0), 0)
  
  const wins = closedPositions.filter((p: any) => (p.realized_pnl || 0) > 0).length
  const losses = closedPositions.filter((p: any) => (p.realized_pnl || 0) < 0).length
  const winRate = closedPositions.length > 0 ? (wins / closedPositions.length) * 100 : 0
  
  const totalRisk = openPositions.reduce((sum: number, p: any) => sum + (p.risk_dollars || 0), 0)

  // Export handler
  const handleExport = () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (activeFilter !== 'all') params.set('timeframe', activeFilter)
    params.set('format', 'csv')
    
    window.open(`/api/export/positions?${params.toString()}`, '_blank')
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Position Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your trading positions and track performance
            {selection.selectedCount > 0 && (
              <span className="ml-2 text-primary font-semibold">
                • {selection.selectedCount} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          {selection.selectedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
              <Checkbox
                checked={selection.isAllSelected}
                onCheckedChange={selection.toggleAll}
                className="data-[state=checked]:bg-primary"
              />
              <span className="text-sm font-medium">
                {selection.isAllSelected ? 'Deselect All' : 'Select All'}
              </span>
            </div>
          )}
          <Button size="lg" variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href="/admin/positions/analytics">
            <Button size="lg" variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href="/admin/positions/new">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Position
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Price Indicator */}
      <LivePriceIndicator />

      {/* Search and Filters */}
      <div className="mb-8 mt-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticker, company, setup, or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
              variant={statusFilter === 'open' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('open')}
              size="sm"
            >
              Open
            </Button>
            <Button
              variant={statusFilter === 'closed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('closed')}
              size="sm"
            >
              Closed
            </Button>
          </div>
          
          {/* Position Type Filter */}
          <div className="flex gap-2 ml-4 pl-4 border-l">
            <Button
              variant={positionTypeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setPositionTypeFilter('all')}
              size="sm"
            >
              All Types
            </Button>
            <Button
              variant={positionTypeFilter === 'stocks' ? 'default' : 'outline'}
              onClick={() => setPositionTypeFilter('stocks')}
              size="sm"
            >
              Stocks
            </Button>
            <Button
              variant={positionTypeFilter === 'options' ? 'default' : 'outline'}
              onClick={() => setPositionTypeFilter('options')}
              size="sm"
              className="data-[variant=default]:bg-purple-600 data-[variant=default]:hover:bg-purple-700"
            >
              Options
            </Button>
          </div>
        </div>

        {/* Timeframe Filter Tabs */}
        <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              All Timeframes
            </TabsTrigger>
            <TabsTrigger value="swing" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              Swing
            </TabsTrigger>
            <TabsTrigger value="day" className="flex items-center gap-2 data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              Day
            </TabsTrigger>
            <TabsTrigger value="position" className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Position
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Active Filters Display */}
        {(searchQuery || statusFilter !== 'all' || activeFilter !== 'all' || positionTypeFilter !== 'all') && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-white">×</button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-white">×</button>
              </Badge>
            )}
            {activeFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Timeframe: {activeFilter}
                <button onClick={() => setActiveFilter('all')} className="ml-1 hover:text-white">×</button>
              </Badge>
            )}
            {positionTypeFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1 bg-purple-500/20 text-purple-400 border-purple-500/30">
                Type: {positionTypeFilter}
                <button onClick={() => setPositionTypeFilter('all')} className="ml-1 hover:text-white">×</button>
              </Badge>
            )}
            <button 
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setActiveFilter('all')
                setPositionTypeFilter('all')
              }}
              className="text-xs text-primary hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" suppressHydrationWarning>{openPositions.length}</div>
            <p className="text-xs text-muted-foreground">
              Risk: ${totalRisk.toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${openPnL >= 0 ? 'text-green-500' : 'text-red-500'}`} suppressHydrationWarning>
              ${openPnL >= 0 ? '+' : ''}{openPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Unrealized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed P&L</CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`} suppressHydrationWarning>
              ${totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {closedPositions.length} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" suppressHydrationWarning>{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
              {wins}W / {losses}L
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Open Positions */}
      {openPositions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>Currently active trades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {openPositions.map((position: any) => {
                // Check if this is an options position
                const isOptionsPosition = position.position_type && 
                  ['put_credit_spread', 'call_credit_spread', 'iron_condor'].includes(position.position_type)

                if (isOptionsPosition) {
                  // Render options position card
                  return (
                    <div key={position.id} className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Checkbox
                          checked={selection.isSelected(position.id)}
                          onCheckedChange={() => selection.toggleItem(position.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <OptionsPositionCard
                          position={position}
                          onManage={() => window.location.href = `/admin/positions/${position.id}`}
                        />
                      </div>
                    </div>
                  )
                }

                // Render stock position card
                return (
                  <div
                    key={position.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      <Checkbox
                        checked={selection.isSelected(position.id)}
                        onCheckedChange={() => selection.toggleItem(position.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    {/* Position Content - Clickable */}
                    <Link
                      href={`/admin/positions/${position.id}`}
                      className="flex-1 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{position.ticker}</h3>
                          <Badge className={getTimeframeBadge(position.time_frame).color}>
                            {getTimeframeBadge(position.time_frame).label}
                          </Badge>
                          {position.setup_type && (
                            <Badge variant="secondary">{position.setup_type}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {position.company_name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>Entry: ${position.entry_price?.toFixed(2)}</span>
                          <span>Current: ${position.current_price?.toFixed(2) || 'N/A'}</span>
                          <span>Stop: ${position.stop_loss?.toFixed(2)}</span>
                          <span>Target: ${position.target?.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${(position.unrealized_pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(position.unrealized_pnl || 0) >= 0 ? '+' : ''}
                          ${position.unrealized_pnl?.toFixed(2) || '0.00'}
                        </div>
                        <div className={`text-sm ${(position.unrealized_pnl_pct || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(position.unrealized_pnl_pct || 0) >= 0 ? '+' : ''}
                          {position.unrealized_pnl_pct?.toFixed(2) || '0.00'}%
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Closed Positions */}
      {closedPositions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Closed Positions</CardTitle>
            <CardDescription>Last 10 completed trades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {closedPositions.slice(0, 10).map((position: any) => {
                // Check if this is an options position
                const isOptionsPosition = position.position_type && 
                  ['put_credit_spread', 'call_credit_spread', 'iron_condor'].includes(position.position_type)

                if (isOptionsPosition) {
                  // Render options position card
                  return (
                    <div key={position.id} className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Checkbox
                          checked={selection.isSelected(position.id)}
                          onCheckedChange={() => selection.toggleItem(position.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <OptionsPositionCard
                          position={position}
                          onManage={() => window.location.href = `/admin/positions/${position.id}`}
                        />
                      </div>
                    </div>
                  )
                }

                // Render stock position card
                return (
                  <div
                    key={position.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      <Checkbox
                        checked={selection.isSelected(position.id)}
                        onCheckedChange={() => selection.toggleItem(position.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    {/* Position Content - Clickable */}
                    <Link
                      href={`/admin/positions/${position.id}`}
                      className="flex-1 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{position.ticker}</h3>
                          <Badge className={getTimeframeBadge(position.time_frame).color}>
                            {getTimeframeBadge(position.time_frame).label}
                          </Badge>
                          {position.trade_grade && (
                            <Badge variant={
                              position.trade_grade === 'A' ? 'default' :
                              position.trade_grade === 'B' ? 'secondary' :
                              'destructive'
                            }>
                              Grade: {position.trade_grade}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {position.company_name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>Entry: ${position.entry_price?.toFixed(2)}</span>
                          <span>Exit: ${position.exit_price?.toFixed(2)}</span>
                          {position.actual_r_multiple && (
                            <span>R-Multiple: {position.actual_r_multiple.toFixed(2)}R</span>
                          )}
                          {position.actual_hold_days && (
                            <span>{position.actual_hold_days} days</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${(position.realized_pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(position.realized_pnl || 0) >= 0 ? '+' : ''}
                          ${position.realized_pnl?.toFixed(2) || '0.00'}
                        </div>
                        <div className={`text-sm ${(position.realized_pnl_pct || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(position.realized_pnl_pct || 0) >= 0 ? '+' : ''}
                          {position.realized_pnl_pct?.toFixed(2) || '0.00'}%
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!positions || positions.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No positions yet</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Start tracking your trades by creating your first position
            </p>
            <Link href="/admin/positions/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Position
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selection.selectedCount}
        selectedItems={selection.selectedItems}
        onClose={selection.clearSelection}
        onBulkClose={handleBulkClose}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onRefresh={fetchPositions}
      />
    </div>
  )
}
