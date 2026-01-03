'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Position {
  symbol: string
  entry_price: number
  current_price: number | null
  pnl: number | null
  direction: string
  status: string
}

export function LivePositionsTicker() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPositions()
    
    // Refresh every 30 seconds
    const interval = setInterval(loadPositions, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadPositions() {
    try {
      const supabase = createClient()
      
      const { data } = await supabase
        .from('positions')
        .select('symbol, entry_price, current_price, direction, status')
        .eq('is_admin_signal', true)
        .eq('status', 'open')
        .order('entry_date', { ascending: false })
        .limit(10)

      if (data) {
        const processedPositions = data.map(pos => {
          const currentPrice = pos.current_price || pos.entry_price
          const pnl = currentPrice - pos.entry_price
          return {
            ...pos,
            pnl,
            current_price: currentPrice
          }
        })
        setPositions(processedPositions)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading positions:', error)
      setLoading(false)
    }
  }

  if (loading || positions.length === 0) {
    return null
  }

  // Duplicate positions for seamless loop
  const displayPositions = [...positions, ...positions, ...positions]

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-900/50 via-gray-800/50 to-gray-900/50 border-y border-gray-700/50 py-3">
      <div className="flex animate-scroll-slow">
        {displayPositions.map((position, index) => (
          <div
            key={`${position.symbol}-${index}`}
            className="flex items-center gap-2 mx-4 px-4 py-2 rounded-lg bg-white/5 border border-gray-700/50 whitespace-nowrap"
          >
            {position.direction === 'long' ? (
              <TrendingUp className="h-4 w-4 text-green-400 flex-shrink-0" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400 flex-shrink-0" />
            )}
            <span className="font-bold text-white">{position.symbol}</span>
            <span className={`font-semibold ${position.pnl && position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {position.pnl && position.pnl >= 0 ? '+' : ''}
              ${Math.abs(position.pnl || 0).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Gradient overlays for seamless edge */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
    </div>
  )
}
