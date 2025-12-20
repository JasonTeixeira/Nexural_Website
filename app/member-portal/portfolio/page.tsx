'use client'

import { useEffect, useState } from 'react'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Target,
  Edit,
  Calendar,
  BarChart3,
  List,
  Download,
  Search,
  ArrowUpDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TradingCalendar } from '@/components/positions/trading-calendar'
import { PortfolioHeatmap } from '@/components/positions/portfolio-heatmap'
import { EquityCurve } from '@/components/positions/equity-curve'

interface Position {
  id: string
  symbol: string
  type: string
  direction: string
  entry_price: number
  current_price: number
  quantity: number
  stop_loss?: number
  take_profit?: number
  entry_date: string
  exit_date?: string
  status: string
  notes?: string
  pnl?: number
  pnl_percentage?: number
  company_name?: string
  sector?: string
}

interface Portfolio {
  id: string
  name: string
  user_id: string
}

export default function EnhancedPortfolioPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'symbol' | 'pnl' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const router = useRouter()

  // Form state for new/edit position
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'stock',
    direction: 'long',
    entry_price: '',
    position_size: '1', // Default 1% of portfolio
    stop_loss: '',
    take_profit: '',
    entry_date: new Date().toISOString().split('T')[0],
    notes: '',
    sector: ''
  })
  const [portfolioValue, setPortfolioValue] = useState(10000) // Default portfolio value

  useEffect(() => {
    loadUserAndPortfolio()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [positions, searchTerm, sortBy, sortOrder])

  async function loadUserAndPortfolio() {
    try {
      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      let { data: portfolios, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single()

      if (!portfolios) {
        const { data: newPortfolio, error: createError } = await supabase
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

        if (!createError) {
          portfolios = newPortfolio
        }
      }

      setPortfolio(portfolios)

      if (portfolios) {
        await loadPositions(portfolios.id, user.id)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  async function loadPositions(portfolioId: string, userId: string) {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)
        .order('entry_date', { ascending: false })

      if (error) throw error

      // Calculate P&L for each position
      const positionsWithPnL = (data || []).map(pos => {
        // Map 'shares' from DB to 'quantity' for UI consistency
        const quantity = pos.shares || pos.quantity || 0
        const currentPrice = pos.current_price || pos.entry_price
        const entryValue = pos.entry_price * quantity
        const currentValue = currentPrice * quantity
        const pnl = pos.direction === 'long' 
          ? currentValue - entryValue
          : entryValue - currentValue
        const pnlPercentage = (pnl / entryValue) * 100

        return {
          ...pos,
          quantity: quantity, // Ensure quantity is set from shares
          pnl: pos.status === 'closed' ? pos.realized_pnl || pnl : pnl,
          pnl_percentage: pos.status === 'closed' ? pos.realized_pnl_pct || pnlPercentage : pnlPercentage
        }
      })

      setPositions(positionsWithPnL)
    } catch (error) {
      console.error('Error loading positions:', error)
    }
  }

  function applyFiltersAndSort() {
    let filtered = [...positions]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol)
          break
        case 'date':
          comparison = new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
          break
        case 'pnl':
          comparison = (a.pnl || 0) - (b.pnl || 0)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredPositions(filtered)
  }

  function exportToCSV() {
    const headers = ['Symbol', 'Company', 'Type', 'Direction', 'Entry Price', 'Current Price', 'Quantity', 'P&L', 'P&L %', 'Status', 'Entry Date', 'Exit Date']
    const rows = filteredPositions.map(p => [
      p.symbol,
      p.company_name || '',
      p.type,
      p.direction,
      p.entry_price.toFixed(2),
      p.current_price.toFixed(2),
      p.quantity,
      (p.pnl || 0).toFixed(2),
      (p.pnl_percentage || 0).toFixed(2),
      p.status,
      p.entry_date,
      p.exit_date || ''
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function toggleSort(field: 'date' | 'symbol' | 'pnl' | 'status') {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  async function handleSavePosition(e: React.FormEvent) {
    e.preventDefault()
    
    if (!portfolio || !user) return

    try {
      const supabase = createClient()

      // Calculate quantity from position size %
      const entryPrice = parseFloat(formData.entry_price)
      const positionSizePercent = parseFloat(formData.position_size)
      const positionValue = (portfolioValue * positionSizePercent) / 100
      const quantity = Math.floor(positionValue / entryPrice)

      // Build position data with only fields that exist in the table
      const positionData: any = {
        user_id: user.id,
        portfolio_id: portfolio.id,
        ticker: formData.symbol.toUpperCase(), // Admin schema uses 'ticker'
        symbol: formData.symbol.toUpperCase(), // Keep symbol too
        position_type: formData.type, // Admin schema uses 'position_type'
        direction: formData.direction,
        entry_price: entryPrice,
        current_price: entryPrice,
        shares: quantity, // Admin schema uses 'shares' not 'quantity'
        entry_date: formData.entry_date,
        status: 'open'
      }

      // Add optional fields only if they have values
      if (formData.stop_loss) positionData.stop_loss = parseFloat(formData.stop_loss)
      if (formData.take_profit) positionData.target = parseFloat(formData.take_profit) // Admin uses 'target'
      if (formData.sector) positionData.sector = formData.sector

      if (editingPosition) {
        // Update existing
        const { error } = await supabase
          .from('positions')
          .update(positionData)
          .eq('id', editingPosition.id)

        if (error) throw error
        alert('Position updated successfully!')
      } else {
        // Insert new
        const { error } = await supabase
          .from('positions')
          .insert(positionData)

        if (error) throw error
        alert('Position added successfully!')
      }

      await loadPositions(portfolio.id, user.id)
      resetForm()
      setIsAddDialogOpen(false)
      setEditingPosition(null)
    } catch (error: any) {
      console.error('FULL ERROR DETAILS:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      const errorMessage = error?.message || error?.details || 'Unknown error occurred'
      alert(`Error saving position: ${errorMessage}\n\nCheck console for details.`)
    }
  }

  async function handleClosePosition(positionId: string) {
    if (!confirm('Are you sure you want to close this position?')) return

    try {
      const supabase = createClient()
      const position = positions.find(p => p.id === positionId)
      
      if (!position) return

      const { error } = await supabase
        .from('positions')
        .update({
          status: 'closed',
          exit_date: new Date().toISOString(),
          exit_price: position.current_price,
          realized_pnl: position.pnl,
          realized_pnl_pct: position.pnl_percentage
        })
        .eq('id', positionId)

      if (error) throw error

      if (portfolio && user) {
        await loadPositions(portfolio.id, user.id)
      }

      alert('Position closed successfully!')
    } catch (error) {
      console.error('Error closing position:', error)
      alert('Error closing position. Please try again.')
    }
  }

  function handleEditPosition(position: Position) {
    setEditingPosition(position)
    const entryPrice = position.entry_price
    const positionValue = position.quantity * entryPrice
    const positionSizePercent = (positionValue / portfolioValue) * 100
    
    setFormData({
      symbol: position.symbol,
      type: position.type,
      direction: position.direction,
      entry_price: position.entry_price.toString(),
      position_size: positionSizePercent.toFixed(2),
      stop_loss: position.stop_loss?.toString() || '',
      take_profit: position.take_profit?.toString() || '',
      entry_date: position.entry_date,
      notes: position.notes || '',
      sector: position.sector || ''
    })
    setIsAddDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      symbol: '',
      type: 'stock',
      direction: 'long',
      entry_price: '',
      position_size: '1',
      stop_loss: '',
      take_profit: '',
      entry_date: new Date().toISOString().split('T')[0],
      notes: '',
      sector: ''
    })
  }

  const openPositions = positions.filter(p => p.status === 'open')
  const closedPositions = positions.filter(p => p.status === 'closed')

  const totalValue = openPositions.reduce((sum, p) => sum + (p.current_price * p.quantity), 0)
  const totalPnL = positions.reduce((sum, p) => sum + (p.pnl || 0), 0)

  // Transform data for heatmap
  const heatmapPositions = openPositions.map(p => ({
    ticker: p.symbol,
    company_name: p.company_name || p.symbol,
    position_value: p.current_price * p.quantity,
    unrealized_pnl: p.pnl || 0,
    unrealized_pnl_pct: p.pnl_percentage || 0,
    sector: p.sector || 'Technology'
  }))

  if (loading) {
    return (
      <MemberPortalLayoutNew>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your portfolio...</p>
        </div>
      </MemberPortalLayoutNew>
    )
  }

  return (
    <MemberPortalLayoutNew>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Portfolio</h1>
            <p className="text-gray-400 mt-1">Track and manage your trading positions with advanced visualizations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (!open) {
                setEditingPosition(null)
                resetForm()
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Add Position</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle>{editingPosition ? 'Edit Position' : 'Add New Position'}</DialogTitle>
                <DialogDescription>
                  {editingPosition ? 'Update the details of your position' : 'Enter the details of your new trading position'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSavePosition} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol *</Label>
                    <Input
                      id="symbol"
                      placeholder="AAPL"
                      value={formData.symbol}
                      onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                      required
                      className="bg-gray-800 border-gray-700 uppercase"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <Select value={formData.sector} onValueChange={(value) => setFormData({...formData, sector: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Consumer">Consumer</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Materials">Materials</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="option">Option</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="direction">Direction *</Label>
                    <Select value={formData.direction} onValueChange={(value) => setFormData({...formData, direction: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="long">Long</SelectItem>
                        <SelectItem value="short">Short</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entry_price">Entry Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <Input
                        id="entry_price"
                        type="number"
                        step="0.01"
                        placeholder="150.00"
                        value={formData.entry_price}
                        onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
                        required
                        className="bg-gray-800 border-gray-700 pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="position_size">Position Size *</Label>
                    <div className="relative">
                      <Input
                        id="position_size"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        placeholder="1.0"
                        value={formData.position_size}
                        onChange={(e) => setFormData({...formData, position_size: e.target.value})}
                        required
                        className="bg-gray-800 border-gray-700 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.entry_price && formData.position_size ? (
                        <>≈ {Math.floor((portfolioValue * parseFloat(formData.position_size) / 100) / parseFloat(formData.entry_price))} shares</>
                      ) : (
                        'Percentage of portfolio'
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stop_loss">Stop Loss</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <Input
                        id="stop_loss"
                        type="number"
                        step="0.01"
                        placeholder="145.00"
                        value={formData.stop_loss}
                        onChange={(e) => setFormData({...formData, stop_loss: e.target.value})}
                        className="bg-gray-800 border-gray-700 pl-7"
                      />
                    </div>
                    {formData.stop_loss && formData.entry_price && (
                      <p className="text-xs text-gray-400 mt-1">
                        Risk: {(((parseFloat(formData.entry_price) - parseFloat(formData.stop_loss)) / parseFloat(formData.entry_price)) * 100).toFixed(2)}%
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="take_profit">Take Profit</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <Input
                        id="take_profit"
                        type="number"
                        step="0.01"
                        placeholder="160.00"
                        value={formData.take_profit}
                        onChange={(e) => setFormData({...formData, take_profit: e.target.value})}
                        className="bg-gray-800 border-gray-700 pl-7"
                      />
                    </div>
                    {formData.take_profit && formData.entry_price && (
                      <p className="text-xs text-green-400 mt-1">
                        Reward: {(((parseFloat(formData.take_profit) - parseFloat(formData.entry_price)) / parseFloat(formData.entry_price)) * 100).toFixed(2)}%
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="entry_date">Entry Date *</Label>
                    <Input
                      id="entry_date"
                      type="date"
                      value={formData.entry_date}
                      onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                {/* Risk/Reward Summary */}
                {formData.entry_price && formData.stop_loss && formData.take_profit && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Risk/Reward Ratio:</span>
                      <span className="font-bold text-cyan-400">
                        1:{(
                          Math.abs((parseFloat(formData.take_profit) - parseFloat(formData.entry_price)) / 
                          (parseFloat(formData.entry_price) - parseFloat(formData.stop_loss)))
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Enter any notes about this position..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingPosition(null)
                    resetForm()
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500">
                    {editingPosition ? 'Update Position' : 'Add Position'}
                  </Button>
                </div>
              </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${totalValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total P&L</CardTitle>
              <Target className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${totalPnL.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Open Positions</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{openPositions.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Closed Positions</CardTitle>
              <TrendingDown className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{closedPositions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Positions</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="visualizations" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Visualizations</span>
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            {/* Search and Sort Controls */}
            {positions.length > 0 && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by symbol or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={sortBy === 'date' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSort('date')}
                        className="gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Date
                        {sortBy === 'date' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant={sortBy === 'symbol' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSort('symbol')}
                        className="gap-2"
                      >
                        Symbol
                        {sortBy === 'symbol' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant={sortBy === 'pnl' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSort('pnl')}
                        className="gap-2"
                      >
                        P&L
                        {sortBy === 'pnl' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant={sortBy === 'status' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSort('status')}
                        className="gap-2"
                      >
                        Status
                        {sortBy === 'status' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Your Positions ({filteredPositions.length})</CardTitle>
                <CardDescription>
                  {searchTerm ? `Filtered results for "${searchTerm}"` : 'Manage your active and closed positions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No positions yet</h3>
                    <p className="text-gray-400 mb-4">Start building your portfolio by adding your first position</p>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Position
                    </Button>
                  </div>
                ) : filteredPositions.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No positions found</h3>
                    <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
                    <Button onClick={() => setSearchTerm('')} variant="outline">
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPositions.map((position) => (
                      <div 
                        key={position.id}
                        className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-3 rounded-lg ${
                              position.direction === 'long' ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}>
                              {position.direction === 'long' ? (
                                <TrendingUp className="h-6 w-6 text-green-400" />
                              ) : (
                                <TrendingDown className="h-6 w-6 text-red-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold">{position.symbol}</h3>
                                <Badge variant={position.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                                  {position.status}
                                </Badge>
                                {position.company_name && (
                                  <span className="text-sm text-gray-400">{position.company_name}</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">
                                {position.quantity} shares @ ${position.entry_price.toFixed(2)}
                                {position.pnl !== undefined && (
                                  <span className={`ml-3 font-semibold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} ({position.pnl_percentage?.toFixed(2)}%)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <p className="text-xs text-gray-400">Entry Date</p>
                              <p className="font-semibold">
                                {new Date(position.entry_date).toLocaleDateString()}
                              </p>
                            </div>
                            {position.status === 'open' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditPosition(position)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleClosePosition(position.id)}
                                >
                                  Close
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {position.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-sm text-gray-400">{position.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar">
            <TradingCalendar />
          </TabsContent>

          {/* Visualizations */}
          <TabsContent value="visualizations" className="space-y-6">
            {/* Equity Curve */}
            <EquityCurve />

            {/* Portfolio Heatmap */}
            {heatmapPositions.length > 0 && (
              <PortfolioHeatmap positions={heatmapPositions} />
            )}

            {heatmapPositions.length === 0 && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Open Positions</h3>
                  <p className="text-gray-400">Add some positions to see visualizations</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MemberPortalLayoutNew>
  )
}
