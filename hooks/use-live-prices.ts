'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LivePriceUpdate {
  positionId: string
  ticker: string
  currentPrice: number
  unrealizedPnL: number
  unrealizedPnLPct: number
  lastUpdate: string
}

interface UseLivePricesOptions {
  enabled?: boolean
  refreshInterval?: number // in milliseconds
  onlyDuringMarketHours?: boolean
}

export function useLivePrices(
  options: UseLivePricesOptions = {}
) {
  const {
    enabled = true,
    refreshInterval = 60000, // 60 seconds default
    onlyDuringMarketHours = false,
  } = options

  const [prices, setPrices] = useState<Record<string, LivePriceUpdate>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [marketOpen, setMarketOpen] = useState(true)

  const refreshPrices = useCallback(async () => {
    if (!enabled) return

    setIsRefreshing(true)
    setError(null)

    try {
      const supabase = createClient()

      // Fetch all open positions with calculated P&L
      const { data: positions, error: fetchError } = await supabase
        .from('positions')
        .select('*')
        .eq('status', 'open')
        .not('current_price', 'is', null)

      if (fetchError) throw fetchError

      if (positions && positions.length > 0) {
        const updates: Record<string, LivePriceUpdate> = {}

        positions.forEach((pos) => {
          // Calculate unrealized P&L
          const entryPrice = pos.entry_price || 0
          const currentPrice = pos.current_price || 0
          const shares = pos.shares || 0

          const pnl = (currentPrice - entryPrice) * shares
          const pnlPct = entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0

          updates[pos.id] = {
            positionId: pos.id,
            ticker: pos.ticker,
            currentPrice: currentPrice,
            unrealizedPnL: pnl,
            unrealizedPnLPct: pnlPct,
            lastUpdate: pos.last_price_update || pos.updated_at,
          }
        })

        setPrices(updates)
      }

      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error refreshing prices:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh prices')
    } finally {
      setIsRefreshing(false)
    }
  }, [enabled])

  // Check market status
  const checkMarketStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/market-status')
      const data = await response.json()
      setMarketOpen(data.isOpen || false)
    } catch (err) {
      console.error('Error checking market status:', err)
      // Assume market is open if check fails
      setMarketOpen(true)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (enabled) {
      refreshPrices()
      if (onlyDuringMarketHours) {
        checkMarketStatus()
      }
    }
  }, [enabled, refreshPrices, checkMarketStatus, onlyDuringMarketHours])

  // Set up auto-refresh interval
  useEffect(() => {
    if (!enabled) return

    // Don't refresh if market is closed and onlyDuringMarketHours is true
    if (onlyDuringMarketHours && !marketOpen) {
      return
    }

    const interval = setInterval(() => {
      refreshPrices()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [enabled, refreshInterval, refreshPrices, onlyDuringMarketHours, marketOpen])

  // Set up realtime subscription for position updates
  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()

    const channel = supabase
      .channel('position-price-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'positions',
          filter: 'status=eq.open',
        },
        (payload) => {
          const updatedPosition = payload.new as any

          if (updatedPosition && updatedPosition.current_price) {
            const entryPrice = updatedPosition.entry_price || 0
            const currentPrice = updatedPosition.current_price || 0
            const shares = updatedPosition.shares || 0

            const pnl = (currentPrice - entryPrice) * shares
            const pnlPct = entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0

            setPrices((prev) => ({
              ...prev,
              [updatedPosition.id]: {
                positionId: updatedPosition.id,
                ticker: updatedPosition.ticker,
                currentPrice: currentPrice,
                unrealizedPnL: pnl,
                unrealizedPnLPct: pnlPct,
                lastUpdate: updatedPosition.last_price_update || updatedPosition.updated_at,
              },
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled])

  return {
    prices,
    isRefreshing,
    lastRefresh,
    error,
    marketOpen,
    refresh: refreshPrices,
  }
}
