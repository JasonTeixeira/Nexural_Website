'use client'

import { useEffect, useState } from 'react'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface SwingPosition {
  id: string
  symbol: string
  direction: string
  entry_price: number
  current_price: number
  stop_loss: number
  targets: number[]
  position_size: number
  status: string
  pnl: number
  pnl_percent: number
  entry_date: string
  exit_date?: string
  targets_hit: number[]
}

export default function SwingPositionsPage() {
  const [positions, setPositions] = useState<SwingPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    loadPositions()
  }, [])

  async function loadPositions() {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('swing_positions')
        .select('*')
        .order('entry_date', { ascending: false })

      if (error) throw error

      setPositions(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading positions:', error)
      setLoading(false)
    }
  }

  const activePositions = positions.filter(p => p.status === 'active')
  const closedPositions = positions.filter(p => p.status === 'closed')

  const stats = {
    totalPnL: positions.reduce((sum, p) => sum + p.pnl, 0),
    activeCount: activePositions.length,
    closedCount: closedPositions.length,
    winRate: closedPositions.length > 0
      ? (closedPositions.filter(p => p.pnl > 0).length / closedPositions.length * 100).toFixed(1)
      : '0',
    avgPnL: closedPositions.length > 0
      ? (closedPositions.reduce((sum, p) => sum + p.pnl, 0) / closedPositions.length).toFixed(2)
      : '0'
  }

  function calculateTargetProgress(position: SwingPosition) {
    const totalTargets = position.targets.length
    const targetsHit = position.targets_hit?.length || 0
    return (targetsHit / totalTargets) * 100
  }

  function PositionCard({ position }: { position: SwingPosition }) {
    const targetProgress = calculateTargetProgress(position)
    const isLong = position.direction === 'LONG'

    return (
      <div className="glass-card rounded-xl p-6 hover:border-white/20 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              isLong ? 'bg-green-600/20' : 'bg-red-600/20'
            }`}>
              {isLong ? (
                <TrendingUp className="h-6 w-6 text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{position.symbol}</h3>
              <p className="text-sm text-gray-400">
                {position.direction} • {position.position_size} shares
              </p>
            </div>
          </div>
          <Badge 
            variant={position.status === 'active' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {position.status}
          </Badge>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Entry Price</p>
            <p className="font-semibold">${position.entry_price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Current Price</p>
            <p className="font-semibold">${position.current_price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
            <p className="font-semibold text-red-400">${position.stop_loss.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">P&L</p>
            <p className={`font-semibold text-lg ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${position.pnl.toFixed(2)}
              <span className="text-sm ml-1">({position.pnl_percent.toFixed(1)}%)</span>
            </p>
          </div>
        </div>

        {/* Targets */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Targets Progress</span>
            <span className="text-sm font-semibold">
              {position.targets_hit?.length || 0}/{position.targets.length}
            </span>
          </div>
          <div className="flex gap-2 mb-2">
            {position.targets.map((target, index) => {
              const isHit = position.targets_hit?.includes(index) || false
              return (
                <div key={index} className="flex-1">
                  <div className={`h-2 rounded-full ${
                    isHit ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                  <p className="text-xs text-center mt-1 text-gray-400">
                    T{index + 1}: ${target.toFixed(2)}
                  </p>
                </div>
              )
            })}
          </div>
          <Progress value={targetProgress} className="h-2" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            Entered {new Date(position.entry_date).toLocaleDateString()}
          </div>
          {position.status === 'active' && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                View Details
              </Button>
              <Button size="sm" variant="destructive">
                Close Position
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <MemberPortalLayoutNew>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Swing Positions</h1>
          <p className="text-gray-400 mt-1">Manage your active swing trades</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold data-value ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.totalPnL.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
              <Target className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold data-value text-green-400">{stats.activeCount}</div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Closed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold data-value">{stats.closedCount}</div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold data-value">{stats.winRate}%</div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg P&L</CardTitle>
              <BarChart3 className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold data-value ${parseFloat(stats.avgPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.avgPnL}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">
              Active ({activePositions.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({closedPositions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading positions...</p>
              </div>
            ) : activePositions.length === 0 ? (
              <Card className="premium-card">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No active swing positions</p>
                    <p className="text-sm text-gray-500 mt-2">
                      New positions will appear here when opened
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activePositions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading positions...</p>
              </div>
            ) : closedPositions.length === 0 ? (
              <Card className="premium-card">
                <CardContent className="py-12">
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No closed positions yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Closed positions will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {closedPositions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MemberPortalLayoutNew>
  )
}
