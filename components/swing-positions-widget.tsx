'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Target, DollarSign, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface SwingPosition {
  id: string
  symbol: string
  direction: 'LONG' | 'SHORT'
  entry_price: number
  current_price: number
  stop_loss: number
  target_1: number | null
  target_2: number | null
  target_3: number | null
  position_size: number
  status: 'active' | 'closed' | 'stopped_out' | 'target_hit'
  unrealized_pnl: number
  pnl_percentage: number
  entry_notes: string | null
  created_at: string
}

export function SwingPositionsWidget() {
  const [positions, setPositions] = useState<SwingPosition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPositions()
    
    // Refresh every 30 seconds
    const interval = setInterval(loadPositions, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadPositions = async () => {
    try {
      const supabase = createClient()
      
      // Get active swing positions
      const { data, error } = await supabase
        .from('swing_positions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!error && data) {
        setPositions(data)
      }
    } catch (error) {
      console.error('Error loading swing positions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePnL = (position: SwingPosition) => {
    if (!position.current_price) return { pnl: 0, pnlPct: 0 }
    
    let pnl = 0
    let pnlPct = 0
    
    if (position.direction === 'LONG') {
      pnl = (position.current_price - position.entry_price) * position.position_size
      pnlPct = ((position.current_price - position.entry_price) / position.entry_price) * 100
    } else {
      pnl = (position.entry_price - position.current_price) * position.position_size
      pnlPct = ((position.entry_price - position.current_price) / position.entry_price) * 100
    }
    
    return { pnl, pnlPct }
  }

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? 'text-green-400' : 'text-red-400'
  }

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Swing Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Activity className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (positions.length === 0) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Active Swing Positions</CardTitle>
            <CardDescription>Manual swing trades managed by our team</CardDescription>
          </div>
        </div>
      </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No active swing positions</p>
            <p className="text-sm text-gray-500 mt-2">
              New positions will appear here when opened
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Active Swing Positions
        </CardTitle>
        <CardDescription>
          {positions.length} active position{positions.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position) => {
            const { pnl, pnlPct } = calculatePnL(position)
            
            return (
              <div
                key={position.id}
                className="glass-card rounded-xl p-6 hover:border-white/20 transition-all animate-fade-in"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-3 rounded-xl shadow-lg ${
                      position.direction === 'LONG' 
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600' 
                        : 'bg-gradient-to-br from-red-600 to-rose-600'
                    }`}>
                      {position.direction === 'LONG' ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{position.symbol}</h4>
                      <p className="text-xs text-gray-400">
                        {position.direction} • {position.position_size} shares
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-600">
                    ACTIVE
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Entry</p>
                    <p className="text-sm font-semibold text-white">
                      ${position.entry_price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current</p>
                    <p className="text-sm font-semibold text-white">
                      ${position.current_price?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Stop Loss</p>
                    <p className="text-sm font-semibold text-red-400">
                      ${position.stop_loss.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* P&L */}
                <div className="glass-card rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">P&L</span>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getPnLColor(pnl)}`}>
                        ${pnl.toFixed(2)}
                      </p>
                      <p className={`text-xs ${getPnLColor(pnl)}`}>
                        {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Targets */}
                {(position.target_1 || position.target_2 || position.target_3) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Targets</p>
                    <div className="flex gap-2 flex-wrap">
                      {position.target_1 && (
                        <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                          T1: ${position.target_1.toFixed(2)}
                        </span>
                      )}
                      {position.target_2 && (
                        <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                          T2: ${position.target_2.toFixed(2)}
                        </span>
                      )}
                      {position.target_3 && (
                        <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                          T3: ${position.target_3.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Entry Notes */}
                {position.entry_notes && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 italic">
                      {position.entry_notes}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-gray-600 mt-3 text-center">
                  Opened {new Date(position.created_at).toLocaleDateString()}
                </p>
              </div>
            )
          })}
        </div>

        {positions.length >= 5 && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Showing 5 most recent positions
          </p>
        )}
      </CardContent>
    </Card>
  )
}
