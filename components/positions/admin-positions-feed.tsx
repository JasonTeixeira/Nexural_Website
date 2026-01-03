'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Target, Shield, Calendar, Activity } from 'lucide-react'
import Link from 'next/link'

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

export function AdminPositionsFeed() {
  const [positions, setPositions] = useState<AdminPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeSignals: 0,
    totalValue: 0,
    avgReturn: 0
  })

  useEffect(() => {
    loadPositions()
    
    // Refresh every 60 seconds
    const interval = setInterval(loadPositions, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadPositions() {
    try {
      const supabase = createClient()
      
      const { data } = await supabase
        .from('positions')
        .select('*')
        .eq('is_admin_signal', true)
        .eq('status', 'open')
        .order('entry_date', { ascending: false })
        .limit(6)

      if (data) {
        setPositions(data)
        
        // Calculate stats
        const totalValue = data.reduce((sum, pos) => 
          sum + (pos.current_price || pos.entry_price) * pos.quantity, 0
        )
        
        setStats({
          activeSignals: data.length,
          totalValue,
          avgReturn: 0 // TODO: Calculate from closed positions
        })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading admin positions:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Live Trading Positions</CardTitle>
          <CardDescription>Loading current signals...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="h-6 w-6 text-cyan-400" />
              Live Trading Positions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Current signals from our trading system
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-400">{stats.activeSignals}</div>
            <div className="text-xs text-gray-400">Active Signals</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No Active Signals</h3>
            <p className="text-gray-400">Check back soon for new trading opportunities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position) => {
              const currentPrice = position.current_price || position.entry_price
              const pnl = currentPrice - position.entry_price
              const pnlPct = (pnl / position.entry_price) * 100

              return (
                <div
                  key={position.id}
                  className="p-4 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-cyan-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        position.direction === 'long' 
                          ? 'bg-green-500/20 group-hover:bg-green-500/30' 
                          : 'bg-red-500/20 group-hover:bg-red-500/30'
                      } transition-colors`}>
                        {position.direction === 'long' ? (
                          <TrendingUp className="h-6 w-6 text-green-400" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{position.symbol}</h3>
                          <Badge variant="outline" className="text-xs">
                            {position.type.toUpperCase()}
                          </Badge>
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                            {position.direction.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Entry: ${position.entry_price.toFixed(2)}
                          </span>
                          {position.target_price && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3 text-green-400" />
                              Target: ${position.target_price.toFixed(2)}
                            </span>
                          )}
                          {position.stop_loss && (
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3 text-red-400" />
                              Stop: ${position.stop_loss.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                      <div className={`text-sm font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(position.entry_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        <div className="mt-6 flex gap-3">
          <Link href="/auth/signup" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold">
              Join FREE to Follow Signals
            </Button>
          </Link>
          <Link href="/community" className="flex-1">
            <Button variant="outline" className="w-full border-gray-600 hover:border-cyan-500">
              View Community
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
