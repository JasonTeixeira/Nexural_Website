'use client'

import { useEffect, useState } from 'react'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Rocket, 
  Play, 
  Pause, 
  Square,
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  Plus,
  Activity,
  Target,
  AlertCircle
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Strategy {
  id: string
  name: string
  type: string
  status: 'active' | 'paused' | 'stopped'
  pnl: number
  pnlPercent: number
  trades: number
  winRate: number
  sharpe: number
}

export default function AlgoTradingPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: '1',
      name: 'Mean Reversion ES',
      type: 'Mean Reversion',
      status: 'active',
      pnl: 1250.50,
      pnlPercent: 5.2,
      trades: 45,
      winRate: 68,
      sharpe: 1.8
    },
    {
      id: '2',
      name: 'Momentum NQ',
      type: 'Momentum',
      status: 'paused',
      pnl: -150.25,
      pnlPercent: -0.6,
      trades: 23,
      winRate: 52,
      sharpe: 0.9
    }
  ])

  const [hasAlgoAccess, setHasAlgoAccess] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('member_user')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setHasAlgoAccess(userData.subscription_tier === 'algo' || userData.subscription_tier === 'ALGO')
    }
  }, [])

  const stats = {
    totalPnL: strategies.reduce((sum, s) => sum + s.pnl, 0),
    activeStrategies: strategies.filter(s => s.status === 'active').length,
    totalTrades: strategies.reduce((sum, s) => sum + s.trades, 0),
    avgWinRate: strategies.length > 0 
      ? (strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length).toFixed(1)
      : '0'
  }

  function handleStrategyAction(id: string, action: 'start' | 'pause' | 'stop') {
    setStrategies(prev => prev.map(s => 
      s.id === id ? { ...s, status: action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'stopped' } : s
    ))
    toast({
      title: `Strategy ${action}ed`,
      description: `The strategy has been ${action}ed successfully.`,
    })
  }

  if (!hasAlgoAccess) {
    return (
      <MemberPortalLayoutNew>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Algo Trading</h1>
            <p className="text-gray-400 mt-1">Automated trading strategies</p>
          </div>

          <Card className="premium-card border-2 border-purple-500/50">
            <CardContent className="py-12">
              <div className="text-center max-w-2xl mx-auto">
                <div className="p-4 bg-purple-600/20 rounded-full w-fit mx-auto mb-6">
                  <Rocket className="h-12 w-12 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Upgrade to Algo Trading</h2>
                <p className="text-gray-300 mb-8">
                  Get access to automated trading strategies, backtesting tools, and run strategies 24/7 on your own Interactive Brokers account.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" className="gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Upgrade Now - $75/mo
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MemberPortalLayoutNew>
    )
  }

  return (
    <MemberPortalLayoutNew>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Algo Trading</h1>
            <p className="text-gray-400 mt-1">Manage your automated strategies</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Strategy
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <CardTitle className="text-sm font-medium text-gray-400">Active Strategies</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold data-value text-green-400">{stats.activeStrategies}</div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Trades</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold data-value">{stats.totalTrades}</div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Win Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold data-value">{stats.avgWinRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Strategies List */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-2xl">Active Strategies</CardTitle>
            <CardDescription>Manage your automated trading strategies</CardDescription>
          </CardHeader>
          <CardContent>
            {strategies.length === 0 ? (
              <div className="text-center py-12">
                <Rocket className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No strategies yet</p>
                <p className="text-sm text-gray-500 mt-2">Create your first strategy to get started</p>
                <Button className="mt-6 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Strategy
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="glass-card rounded-xl p-6 hover:border-white/20 transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          strategy.status === 'active' ? 'bg-green-600/20' :
                          strategy.status === 'paused' ? 'bg-yellow-600/20' :
                          'bg-gray-600/20'
                        }`}>
                          <Rocket className={`h-6 w-6 ${
                            strategy.status === 'active' ? 'text-green-400' :
                            strategy.status === 'paused' ? 'text-yellow-400' :
                            'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{strategy.name}</h3>
                          <p className="text-sm text-gray-400">{strategy.type}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          strategy.status === 'active' ? 'default' :
                          strategy.status === 'paused' ? 'secondary' :
                          'outline'
                        }
                        className="capitalize"
                      >
                        {strategy.status}
                      </Badge>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">P&L</p>
                        <p className={`font-semibold ${strategy.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${strategy.pnl.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">P&L %</p>
                        <p className={`font-semibold ${strategy.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {strategy.pnlPercent >= 0 ? '+' : ''}{strategy.pnlPercent}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Trades</p>
                        <p className="font-semibold">{strategy.trades}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                        <p className="font-semibold">{strategy.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Sharpe</p>
                        <p className="font-semibold">{strategy.sharpe}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      {strategy.status === 'active' ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStrategyAction(strategy.id, 'pause')}
                          className="gap-2"
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleStrategyAction(strategy.id, 'start')}
                          className="gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Start
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStrategyAction(strategy.id, 'stop')}
                        className="gap-2"
                      >
                        <Square className="h-4 w-4" />
                        Stop
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* IB Gateway Status */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-2xl">IB Gateway Connection</CardTitle>
            <CardDescription>Interactive Brokers connection status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 glass-card rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Activity className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Connected</p>
                  <p className="text-sm text-gray-400">IB Gateway is running</p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberPortalLayoutNew>
  )
}
