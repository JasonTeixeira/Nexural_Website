'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

interface Position {
  id: string
  ticker: string
  company_name: string
  direction: string
  status: string
  entry_date: string
  entry_price: number
  current_price: number
  shares_contracts: number
  position_value: number
  portfolio_weight_pct: number
  stop_loss: number
  target_1: number
  target_2: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  r_multiple_current: number
  sector: string
  setup_type: string
  conviction_level: string
  thesis: string
  daysHeld: number
  risk_amount: number
}

export default function OpenPositionsTable() {
  const router = useRouter()
  const [positions, setPositions] = useState<Position[]>([])
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [setupFilter, setSetupFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [convictionFilter, setConvictionFilter] = useState('all')

  // Sorting
  const [sortColumn, setSortColumn] = useState<keyof Position>('entry_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchPositions()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [positions, searchTerm, sectorFilter, setupFilter, statusFilter, convictionFilter, sortColumn, sortDirection])

  const fetchPositions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/positions/open')
      if (response.ok) {
        const data = await response.json()
        setPositions(data.positions || [])
      }
    } catch (error) {
      console.error('Error fetching positions:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...positions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (pos) =>
          pos.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pos.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sector filter
    if (sectorFilter !== 'all') {
      filtered = filtered.filter((pos) => pos.sector === sectorFilter)
    }

    // Setup type filter
    if (setupFilter !== 'all') {
      filtered = filtered.filter((pos) => pos.setup_type === setupFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((pos) => pos.status === statusFilter)
    }

    // Conviction filter
    if (convictionFilter !== 'all') {
      filtered = filtered.filter((pos) => pos.conviction_level === convictionFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })

    setFilteredPositions(filtered)
  }

  const handleSort = (column: keyof Position) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Ticker',
      'Company',
      'Direction',
      'Status',
      'Entry Date',
      'Entry Price',
      'Current Price',
      'Shares',
      'Position Value',
      'Weight %',
      'P&L $',
      'P&L %',
      'R-Multiple',
      'Stop Loss',
      'Target 1',
      'Days Held',
      'Sector',
      'Setup Type',
      'Conviction',
    ]

    const rows = filteredPositions.map((pos) => [
      pos.ticker,
      pos.company_name,
      pos.direction,
      pos.status,
      new Date(pos.entry_date).toLocaleDateString(),
      pos.entry_price.toFixed(2),
      pos.current_price?.toFixed(2) || 'N/A',
      pos.shares_contracts,
      pos.position_value?.toFixed(2) || 'N/A',
      pos.portfolio_weight_pct?.toFixed(2) || 'N/A',
      pos.unrealized_pnl?.toFixed(2) || 'N/A',
      pos.unrealized_pnl_pct?.toFixed(2) || 'N/A',
      pos.r_multiple_current?.toFixed(2) || 'N/A',
      pos.stop_loss.toFixed(2),
      pos.target_1.toFixed(2),
      pos.daysHeld || 0,
      pos.sector,
      pos.setup_type,
      pos.conviction_level,
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `positions-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getRMultipleBadgeColor = (rMultiple: number) => {
    if (rMultiple < 0) return 'bg-red-500/20 text-red-400 border-red-500/30'
    if (rMultiple < 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    if (rMultiple < 2) return 'bg-green-500/20 text-green-400 border-green-500/30'
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  }

  const SortIcon = ({ column }: { column: keyof Position }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-2 opacity-50" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-2" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-2" />
    )
  }

  // Get unique values for filters
  const sectors = Array.from(new Set(positions.map((p) => p.sector))).filter(Boolean)
  const setupTypes = Array.from(new Set(positions.map((p) => p.setup_type))).filter(Boolean)
  const statuses = Array.from(new Set(positions.map((p) => p.status))).filter(Boolean)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading positions...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push('/positions')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">Open Positions</h1>
            <p className="text-muted-foreground text-lg">
              Detailed view of all {filteredPositions.length} active positions
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="premium-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search ticker or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sector Filter */}
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Setup Type Filter */}
              <Select value={setupFilter} onValueChange={setSetupFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Setups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Setups</SelectItem>
                  {setupTypes.map((setup) => (
                    <SelectItem key={setup} value={setup}>
                      {setup.replace(/_/g, ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Conviction Filter */}
              <Select value={convictionFilter} onValueChange={setConvictionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Conviction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conviction</SelectItem>
                  <SelectItem value="max">MAX</SelectItem>
                  <SelectItem value="high">HIGH</SelectItem>
                  <SelectItem value="medium">MEDIUM</SelectItem>
                  <SelectItem value="low">LOW</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Count */}
            {(searchTerm || sectorFilter !== 'all' || setupFilter !== 'all' || statusFilter !== 'all' || convictionFilter !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredPositions.length} of {positions.length} positions
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSectorFilter('all')
                    setSetupFilter('all')
                    setStatusFilter('all')
                    setConvictionFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="premium-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('ticker')}>
                      <div className="flex items-center">
                        Ticker <SortIcon column="ticker" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('direction')}>
                      <div className="flex items-center">
                        Direction <SortIcon column="direction" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('entry_date')}>
                      <div className="flex items-center">
                        Entry Date <SortIcon column="entry_date" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('entry_price')}>
                      <div className="flex items-center justify-end">
                        Entry <SortIcon column="entry_price" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('current_price')}>
                      <div className="flex items-center justify-end">
                        Current <SortIcon column="current_price" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('shares_contracts')}>
                      <div className="flex items-center justify-end">
                        Shares <SortIcon column="shares_contracts" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('position_value')}>
                      <div className="flex items-center justify-end">
                        Value <SortIcon column="position_value" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('unrealized_pnl')}>
                      <div className="flex items-center justify-end">
                        P&L $ <SortIcon column="unrealized_pnl" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('unrealized_pnl_pct')}>
                      <div className="flex items-center justify-end">
                        P&L % <SortIcon column="unrealized_pnl_pct" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => handleSort('r_multiple_current')}>
                      <div className="flex items-center justify-center">
                        R-Multiple <SortIcon column="r_multiple_current" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('conviction_level')}>
                      <div className="flex items-center">
                        Conviction <SortIcon column="conviction_level" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.map((position) => (
                    <>
                      <TableRow
                        key={position.id}
                        className="hover:bg-card/60 cursor-pointer border-b border-border/50"
                        onClick={() => setExpandedRow(expandedRow === position.id ? null : position.id)}
                      >
                        <TableCell>
                          {expandedRow === position.id ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-bold text-white">
                          {position.ticker}
                        </TableCell>
                        <TableCell>
                          <Badge variant={position.direction === 'long' ? 'default' : 'secondary'}>
                            {position.direction.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(position.entry_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right data-value text-white">
                          ${position.entry_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right data-value text-white">
                          ${(position.current_price || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right data-value text-white">
                          {position.shares_contracts}
                        </TableCell>
                        <TableCell className="text-right data-value text-white">
                          {formatCurrency(position.position_value || 0)}
                        </TableCell>
                        <TableCell className={`text-right data-value font-bold ${
                          (position.unrealized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(position.unrealized_pnl || 0)}
                        </TableCell>
                        <TableCell className={`text-right data-value ${
                          (position.unrealized_pnl_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatPercent(position.unrealized_pnl_pct || 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getRMultipleBadgeColor(position.r_multiple_current || 0)}>
                            {(position.r_multiple_current || 0).toFixed(2)}R
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {position.conviction_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/positions/${position.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {expandedRow === position.id && (
                        <TableRow className="hover:bg-transparent border-b border-border">
                          <TableCell colSpan={13} className="bg-card/30 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-bold text-white mb-2">Company Info</h4>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {position.company_name}
                                </p>
                                <div className="flex gap-2 mb-4">
                                  <Badge variant="outline">{position.sector}</Badge>
                                  <Badge variant="outline">
                                    {position.setup_type.replace(/_/g, ' ').toUpperCase()}
                                  </Badge>
                                </div>

                                <h4 className="font-bold text-white mb-2">Risk Management</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Stop Loss:</span>
                                    <span className="text-red-400 data-value">
                                      ${position.stop_loss.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Target 1:</span>
                                    <span className="text-green-400 data-value">
                                      ${position.target_1.toFixed(2)}
                                    </span>
                                  </div>
                                  {position.target_2 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Target 2:</span>
                                      <span className="text-green-400 data-value">
                                        ${position.target_2.toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Risk Amount:</span>
                                    <span className="text-white data-value">
                                      {formatCurrency(position.risk_amount || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-bold text-white mb-2">Trade Thesis</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {position.thesis}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>

              {filteredPositions.length === 0 && (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No positions match your filters</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('')
                      setSectorFilter('all')
                      setSetupFilter('all')
                      setStatusFilter('all')
                      setConvictionFilter('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
