'use client'

import { useLivePrices } from '@/hooks/use-live-prices'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LivePriceIndicatorProps {
  compact?: boolean
}

export function LivePriceIndicator({ compact = false }: LivePriceIndicatorProps) {
  const { isRefreshing, lastRefresh, error, marketOpen, refresh } = useLivePrices({
    enabled: true,
    refreshInterval: 60000, // 60 seconds
  })

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 10) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {marketOpen ? (
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Wifi className="w-3 h-3 mr-1" />
            Live
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <WifiOff className="w-3 h-3 mr-1" />
            Closed
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
          className="h-8"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-card/50 border border-border/50 rounded-lg">
      <div className="flex items-center gap-2">
        {marketOpen ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Market Open</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Market Closed</span>
          </>
        )}
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="text-sm text-muted-foreground">
        Last update: {formatTime(lastRefresh)}
      </div>
      
      {error && (
        <>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-red-400">Error: {error}</span>
        </>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={refresh}
        disabled={isRefreshing}
        className="ml-auto"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  )
}
