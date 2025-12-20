'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bookmark,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  Edit,
  Trash2,
  Eye,
  Target,
  AlertTriangle,
  Filter,
  SortAsc
} from 'lucide-react'
import Link from 'next/link'

interface WatchlistItem {
  id: string
  notes: string | null
  created_at: string
  position_id: string
  positions: {
    id: string
    symbol: string
    company_name: string
    direction: string
    entry_price: number
    current_price: number | null
    status: string
    pnl: number | null
    pnl_percentage: number | null
    unrealized_pnl: number | null
    unrealized_pnl_pct: number | null
    stop_loss: number | null
    target_price: number | null
    entry_reasoning: string | null
    is_admin_signal: boolean
    portfolio_id: string
    portfolios: {
      id: string
      name: string
      user_id: string
      user_profiles: {
        username: string
        display_name: string | null
        avatar_url: string | null
      }
    }
  }
}

export function WatchlistFull() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [filteredWatchlist, setFilteredWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'symbol' | 'performance'>('recent')
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')

  useEffect(() => {
    loadWatchlist()
  }, [])

  useEffect(() => {
    filterAndSortWatchlist()
  }, [watchlist, searchQuery, filterStatus, sortBy])

  async function loadWatchlist() {
    try {
      const response = await fetch('/api/watchlist/positions')
      
      if (!response.ok) {
        throw new Error('Failed to load watchlist')
      }

      const data = await response.json()
      setWatchlist(data.watchlist || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading watchlist:', error)
      setLoading(false)
    }
  }

  function filterAndSortWatchlist() {
    let filtered = [...watchlist]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.positions.symbol.toLowerCase().includes(query) ||
        item.positions.company_name?.toLowerCase().includes(query) ||
        item.positions.portfolios.user_profiles.username.toLowerCase().includes(query)
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.positions.status === filterStatus)
    }

    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'symbol') {
      filtered.sort((a, b) => a.positions.symbol.localeCompare(b.positions.symbol))
    } else if (sortBy === 'performance') {
      filtered.sort((a, b) => {
        const aPerf = a.positions.pnl_percentage || a.positions.unrealized_pnl_pct || 0
        const bPerf = b.positions.pnl_percentage || b.positions.unrealized_pnl_pct || 0
        return bPerf - aPerf
      })
    }

    setFilteredWatchlist(filtered)
  }

  async function handleRemoveFromWatchlist(positionId: string) {
    try {
      const response = await fetch(`/api/watchlist/positions?position_id=${positionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setWatchlist(watchlist.filter(item => item.position_id !== positionId))
      } else {
        alert('Failed to remove from watchlist')
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error)
      alert('An error occurred')
    }
  }

  async function handleSaveNotes(item: WatchlistItem) {
    try {
      const response = await fetch('/api/watchlist/positions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_id: item.position_id,
          notes: notesValue
        })
      })

      if (response.ok) {
        setWatchlist(watchlist.map(w =>
          w.id === item.id ? { ...w, notes: notesValue } : w
        ))
        setEditingNotes(null)
        setNotesValue('')
      } else {
        alert('Failed to save notes')
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('An error occurred')
    }
  }

  function startEditingNotes(item: WatchlistItem) {
    setEditingNotes(item.id)
    setNotesValue(item.notes || '')
  }

  function cancelEditingNotes() {
    setEditingNotes(null)
    setNotesValue('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading watchlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="premium-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Your Watchlist</h3>
              <p className="text-muted-foreground">
                {watchlist.length} position{watchlist.length !== 1 ? 's' : ''} you're tracking
              </p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">{watchlist.length}</div>
              <div className="text-sm text-muted-foreground">Watched</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card className="premium-card">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by symbol, company, or trader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                All
              </Button>
              <Button
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('open')}
                className="flex-1"
              >
                Open
              </Button>
              <Button
                variant={filterStatus === 'closed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('closed')}
                className="flex-1"
              >
                Closed
              </Button>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
                className="flex-1"
              >
                <SortAsc className="h-4 w-4 mr-2" />
                Recent
              </Button>
              <Button
                variant={sortBy === 'symbol' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('symbol')}
                className="flex-1"
              >
                A-Z
              </Button>
              <Button
                variant={sortBy === 'performance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('performance')}
                className="flex-1"
              >
                P&L
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist Items */}
      {filteredWatchlist.length === 0 ? (
        <Card className="premium-card">
          <CardContent className="p-12 text-center">
            <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No positions found' : 'Your watchlist is empty'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters or search query'
                : 'Start tracking interesting positions by clicking the bookmark icon on any position page'
              }
            </p>
            {(searchQuery || filterStatus !== 'all') ? (
              <Button onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}>
                Clear Filters
              </Button>
            ) : (
              <Link href="/community">
                <Button>Explore Community</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWatchlist.map((item) => {
            const position = item.positions
            const trader = position.portfolios.user_profiles
            const isUp = (position.unrealized_pnl || position.pnl || 0) >= 0

            return (
              <Card key={item.id} className="premium-card hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-12 gap-6">
                    {/* Symbol & Basic Info */}
                    <div className="md:col-span-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          {position.direction === 'long' ? (
                            <TrendingUp className="h-5 w-5 text-green-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">{position.symbol}</h3>
                            <Badge variant={position.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                              {position.status}
                            </Badge>
                            {position.is_admin_signal && (
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                Signal
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{position.company_name || position.symbol}</p>
                          <Link 
                            href={`/profile/${trader.username}`}
                            className="text-sm text-primary hover:underline mt-1 inline-block"
                          >
                            by @{trader.username}
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Performance */}
                    <div className="md:col-span-3">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Entry Price</p>
                          <p className="text-lg font-bold">${position.entry_price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">P&L</p>
                          {position.status === 'closed' && position.pnl !== null ? (
                            <div>
                              <p className={`text-lg font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                {isUp ? '+' : ''}${position.pnl.toFixed(2)}
                              </p>
                              {position.pnl_percentage !== null && (
                                <p className={`text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                  {isUp ? '+' : ''}{position.pnl_percentage.toFixed(2)}%
                                </p>
                              )}
                            </div>
                          ) : position.unrealized_pnl !== null ? (
                            <div>
                              <p className={`text-lg font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                {isUp ? '+' : ''}${position.unrealized_pnl.toFixed(2)}
                              </p>
                              {position.unrealized_pnl_pct !== null && (
                                <p className={`text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                  {isUp ? '+' : ''}{position.unrealized_pnl_pct.toFixed(2)}%
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-muted-foreground">--</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Targets */}
                    <div className="md:col-span-3">
                      <div className="space-y-2">
                        {position.stop_loss && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <div>
                              <p className="text-xs text-muted-foreground">Stop Loss</p>
                              <p className="text-sm font-semibold text-red-400">
                                ${position.stop_loss.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                        {position.target_price && (
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-400" />
                            <div>
                              <p className="text-xs text-muted-foreground">Target</p>
                              <p className="text-sm font-semibold text-green-400">
                                ${position.target_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 flex flex-col justify-between gap-2">
                      <Link href={`/position/${position.id}`}>
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditingNotes(item)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFromWatchlist(position.id)}
                          className="flex-1 hover:bg-red-500/10 hover:border-red-500/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {editingNotes === item.id ? (
                    <div className="mt-4 pt-4 border-t border-border">
                      <label className="text-sm font-medium mb-2 block">
                        Your Notes
                      </label>
                      <Textarea
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        placeholder="Add notes about why you're watching this position..."
                        className="mb-2"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveNotes(item)}>
                          Save Notes
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditingNotes}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : item.notes ? (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium mb-1">Your Notes:</p>
                      <p className="text-sm text-muted-foreground italic">{item.notes}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
