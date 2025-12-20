'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Eye, TrendingUp, TrendingDown, Plus, RefreshCw, Target, FileText } from 'lucide-react'
import Link from 'next/link'

interface WatchlistItem {
  id: string
  ticker: string
  company_name: string
  notes: string
  tags: string[]
  target_entry: number
  target_exit: number
  added_at: string
}

interface StockQuote {
  ticker: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
}

export function WatchlistCompact() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/watchlist')
      if (response.ok) {
        const data = await response.json()
        const items = data.watchlist || []
        setWatchlist(items)
        
        if (items.length > 0) {
          await fetchQuotes(items.map((item: WatchlistItem) => item.ticker))
        }
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuotes = async (tickers: string[]) => {
    setRefreshing(true)
    const quotePromises = tickers.map(ticker =>
      fetch(`/api/watchlist/quote/${ticker}`)
        .then(res => res.json())
        .then(data => ({ ticker, data: data.stockData }))
        .catch(() => ({ ticker, data: null }))
    )

    const results = await Promise.all(quotePromises)
    const quotesMap: Record<string, StockQuote> = {}
    
    results.forEach(({ ticker, data }) => {
      if (data) {
        quotesMap[ticker] = data
      }
    })

    setQuotes(quotesMap)
    setRefreshing(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  if (loading) {
    return (
      <Card className="premium-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (watchlist.length === 0) {
    return (
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-400" />
                Watchlist
              </CardTitle>
              <CardDescription>Stocks you're monitoring</CardDescription>
            </div>
            <Link href="/watchlist">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Tickers
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No tickers in watchlist</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" />
              Watchlist ({watchlist.length})
            </CardTitle>
            <CardDescription>
              Hover any ticker to see notes, targets, and analysis
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchQuotes(watchlist.map(item => item.ticker))}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/watchlist">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {watchlist.map((item) => {
            const quote = quotes[item.ticker]
            const isUp = quote && quote.change >= 0

            return (
              <HoverCard key={item.id} openDelay={200}>
                <HoverCardTrigger asChild>
                  <div className="glass-card p-4 rounded-lg border border-white/10 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/10">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <span className="text-lg font-bold text-white">{item.ticker}</span>
                        {quote && (
                          isUp ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )
                        )}
                      </div>
                      
                      {quote ? (
                        <>
                          <p className="text-xl font-semibold text-white mb-1">
                            {formatCurrency(quote.price)}
                          </p>
                          <p className={`text-sm font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                            {isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      )}

                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap justify-center gap-1">
                          {item.tags.slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </HoverCardTrigger>
                
                <HoverCardContent className="w-80 p-0 border-border" align="start">
                  <div className="bg-card/95 backdrop-blur-sm rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-xl font-bold text-white">{item.ticker}</h4>
                          <p className="text-sm text-muted-foreground">{item.company_name}</p>
                        </div>
                        {quote && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(quote.price)}
                            </p>
                            <p className={`text-sm font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                              {isUp ? '+' : ''}{formatCurrency(quote.change)} ({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                      {/* Notes */}
                      {item.notes && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-white">Why Watching</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                            {item.notes}
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-white mb-2">🏷️ Tags</p>
                          <div className="flex flex-wrap gap-2 pl-6">
                            {item.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price Targets */}
                      {(item.target_entry || item.target_exit) && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-white">Price Targets</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pl-6">
                            {item.target_entry && (
                              <div>
                                <p className="text-xs text-muted-foreground">Entry Target</p>
                                <p className="text-sm font-semibold text-green-400">
                                  {formatCurrency(item.target_entry)}
                                </p>
                              </div>
                            )}
                            {item.target_exit && (
                              <div>
                                <p className="text-xs text-muted-foreground">Exit Target</p>
                                <p className="text-sm font-semibold text-blue-400">
                                  {formatCurrency(item.target_exit)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 52 Week Range */}
                      {quote && quote.fiftyTwoWeekHigh > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-white mb-2">📊 52-Week Range</p>
                          <div className="pl-6 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                {formatCurrency(quote.fiftyTwoWeekLow)}
                              </span>
                              <span className="text-muted-foreground">
                                {formatCurrency(quote.fiftyTwoWeekHigh)}
                              </span>
                            </div>
                            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                                style={{ width: '100%' }}
                              />
                              <div
                                className="absolute h-full w-1 bg-white rounded-full"
                                style={{
                                  left: `${((quote.price - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-red-400">Low</span>
                              <span className="text-white font-semibold">Current</span>
                              <span className="text-green-400">High</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Day Range */}
                      {quote && (
                        <div className="grid grid-cols-2 gap-3 pl-6 text-xs">
                          <div>
                            <p className="text-muted-foreground">Day Low</p>
                            <p className="text-white font-semibold">{formatCurrency(quote.low)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Day High</p>
                            <p className="text-white font-semibold">{formatCurrency(quote.high)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
