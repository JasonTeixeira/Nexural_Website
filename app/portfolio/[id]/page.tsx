'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PieChart,
  Activity,
  ExternalLink,
  UserPlus,
  User,
  Eye,
  EyeOff
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { PortfolioHeatmap } from '@/components/positions/portfolio-heatmap'
import { useBlocking } from '@/hooks/use-blocking'

interface Portfolio {
  id: string
  user_id: string
  name: string
  description: string | null
  visibility: 'public' | 'private' | 'followers_only'
  total_value: number
  total_return: number
  total_return_pct: number
  win_rate: number
  is_default: boolean
  created_at: string
}

interface Position {
  id: string
  symbol: string
  company_name: string
  type: string
  direction: string
  entry_price: number
  current_price: number | null
  quantity: number
  entry_date: string
  exit_date: string | null
  exit_price: number | null
  status: string
  pnl: number | null
  pnl_percentage: number | null
  unrealized_pnl: number | null
  unrealized_pnl_pct: number | null
  position_value: number
  sector: string
  notes: string | null
}

interface UserProfile {
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  portfolio_visibility_mode?: 'public' | 'private'
}

export default function PortfolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const portfolioId = params?.id as string

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [owner, setOwner] = useState<UserProfile | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [openPositions, setOpenPositions] = useState<Position[]>([])
  const [closedPositions, setClosedPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowingPortfolio, setIsFollowingPortfolio] = useState(false)
  const blocking = useBlocking()

  const loadPortfolioData = useCallback(async () => {
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Load portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single()

      if (portfolioError || !portfolioData) {
        console.error('Portfolio not found:', portfolioError)
        setLoading(false)
        return
      }

      // Check visibility
      if (portfolioData.visibility === 'private' && (!user || user.id !== portfolioData.user_id)) {
        console.error('Portfolio is private')
        setLoading(false)
        return
      }

      // Block enforcement (viewer has blocked the owner)
      if (user && blocking.isBlocked(portfolioData.user_id)) {
        console.error('Portfolio is blocked')
        setLoading(false)
        return
      }

      setPortfolio(portfolioData)

      // Load owner profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('user_id, username, display_name, avatar_url, portfolio_visibility_mode')
        .eq('user_id', portfolioData.user_id)
        .single()

      if (profileData) {
        // SSOT: if owner is in private global mode, hide the portfolio for non-owners
        if (profileData.portfolio_visibility_mode === 'private' && (!user || user.id !== profileData.user_id)) {
          console.error('Owner is in private global mode')
          setLoading(false)
          return
        }
        setOwner(profileData)
      }

      // Check if following
      if (user && user.id !== portfolioData.user_id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', portfolioData.user_id)
          .single()

        setIsFollowing(!!followData)

        // Check if following portfolio
        const followRes = await fetch(`/api/portfolio/follow?portfolioId=${encodeURIComponent(portfolioId)}`)
        const followJson = await followRes.json().catch(() => ({}))
        if (followRes.ok) setIsFollowingPortfolio(!!followJson.following)
      }

      // Load positions
      const { data: positionsData } = await supabase
        .from('positions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('entry_date', { ascending: false })

      if (positionsData) {
        setPositions(positionsData)
        setOpenPositions(positionsData.filter(p => p.status === 'open'))
        setClosedPositions(positionsData.filter(p => p.status === 'closed'))
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading portfolio:', error)
      setLoading(false)
    }
  }, [portfolioId])

  useEffect(() => {
    void loadPortfolioData()
  }, [loadPortfolioData])

  async function handleFollowToggle() {
    if (!currentUser || !owner) return

    try {
      if (isFollowing) {
        await fetch('/api/community/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followingUserId: owner.user_id, action: 'unfollow' }),
        })
        setIsFollowing(false)
      } else {
        await fetch('/api/community/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followingUserId: owner.user_id, action: 'follow' }),
        })
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  async function handlePortfolioFollowToggle() {
    if (!currentUser || !portfolio) return
    try {
      const res = await fetch('/api/portfolio/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          action: isFollowingPortfolio ? 'unfollow' : 'follow',
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) setIsFollowingPortfolio(!!json.following)
    } catch (e) {
      console.error('Error toggling portfolio follow:', e)
    }
  }

  // Calculate sector allocation
  const sectorAllocation = openPositions.reduce((acc, pos) => {
    const sector = pos.sector || 'Unknown'
    acc[sector] = (acc[sector] || 0) + pos.position_value
    return acc
  }, {} as Record<string, number>)

  const totalValue = Object.values(sectorAllocation).reduce((sum, val) => sum + val, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Portfolio Not Found</h1>
          <p className="text-muted-foreground mb-4">This portfolio doesn't exist or is private</p>
          <Link href="/community">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = currentUser && currentUser.id === portfolio.user_id

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href={owner ? `/profile/${owner.username}` : '/community'} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {owner?.display_name || owner?.username || 'Community'}
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{portfolio.name}</h1>
                <Badge variant={portfolio.visibility === 'public' ? 'default' : 'secondary'} className="capitalize">
                  {portfolio.visibility === 'public' ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                  {portfolio.visibility}
                </Badge>
                {portfolio.is_default && (
                  <Badge variant="outline">Default</Badge>
                )}
              </div>
              {portfolio.description && (
                <p className="text-muted-foreground mb-3">{portfolio.description}</p>
              )}
              {owner && (
                <Link href={`/profile/${owner.username}`} className="text-sm text-cyan-400 hover:underline flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {owner.display_name || owner.username}
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isOwner ? (
                <Link href="/member-portal/portfolio">
                  <Button variant="outline">
                    Edit Portfolio
                  </Button>
                </Link>
              ) : currentUser ? (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleFollowToggle}
                    className={isFollowing ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}
                  >
                    {isFollowing ? 'Following' : <><UserPlus className="h-4 w-4 mr-2" />Follow Trader</>}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePortfolioFollowToggle}
                    className={isFollowingPortfolio ? 'border-cyan-400/40 text-cyan-200' : 'border-white/20'}
                  >
                    {isFollowingPortfolio ? 'Portfolio Followed' : 'Follow Portfolio'}
                  </Button>
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                    Login to Follow
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolio.total_value.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">{openPositions.length} open positions</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${portfolio.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {portfolio.total_return >= 0 ? '+' : ''}${portfolio.total_return.toFixed(2)}
              </div>
              <p className={`text-xs mt-1 ${portfolio.total_return_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {portfolio.total_return_pct >= 0 ? '+' : ''}{portfolio.total_return_pct.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolio.win_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">{closedPositions.length} closed trades</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Positions</CardTitle>
              <Activity className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{positions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {openPositions.length} open, {closedPositions.length} closed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Holdings Tab */}
          <TabsContent value="holdings" className="space-y-6">
            {/* Heatmap */}
            {openPositions.length > 0 && (
              <PortfolioHeatmap positions={openPositions.map(p => ({
                ...p,
                ticker: p.symbol,
                status: p.status as any,
                unrealized_pnl: p.unrealized_pnl || 0,
                unrealized_pnl_pct: p.unrealized_pnl_pct || 0
              }))} />
            )}

            {/* Position Cards */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Open Positions ({openPositions.length})</CardTitle>
                <CardDescription>Currently held positions</CardDescription>
              </CardHeader>
              <CardContent>
                {openPositions.length === 0 ? (
                  <div className="text-center py-12">
                    <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No open positions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {openPositions.map((position) => (
                      <Link key={position.id} href={`/position/${position.id}`}>
                        <div className="p-4 rounded-lg border border-border bg-background/40 hover:border-cyan-500/50 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${
                                position.direction === 'long' ? 'bg-green-500/20' : 'bg-red-500/20'
                              }`}>
                                {position.direction === 'long' ? (
                                  <TrendingUp className="h-6 w-6 text-green-400" />
                                ) : (
                                  <TrendingDown className="h-6 w-6 text-red-400" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-bold">{position.symbol}</h3>
                                  <Badge className="capitalize">{position.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {position.quantity} shares @ ${position.entry_price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {position.unrealized_pnl !== null && (
                                <div className={`text-lg font-bold ${position.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {position.unrealized_pnl >= 0 ? '+' : ''}${position.unrealized_pnl.toFixed(2)}
                                </div>
                              )}
                              {position.unrealized_pnl_pct !== null && (
                                <p className={`text-sm ${position.unrealized_pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ({position.unrealized_pnl_pct >= 0 ? '+' : ''}{position.unrealized_pnl_pct.toFixed(2)}%)
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sector Allocation */}
            {Object.keys(sectorAllocation).length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Sector Allocation</CardTitle>
                  <CardDescription>Portfolio distribution by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(sectorAllocation).map(([sector, value]) => {
                      const percentage = (value / totalValue) * 100
                      return (
                        <div key={sector}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{sector}</span>
                            <span className="text-sm text-muted-foreground">
                              ${value.toFixed(2)} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Closed Positions ({closedPositions.length})</CardTitle>
                <CardDescription>Trade history and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                {closedPositions.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No closed positions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {closedPositions.map((position) => (
                      <Link key={position.id} href={`/position/${position.id}`}>
                        <div className="p-4 rounded-lg border border-border bg-background/40 hover:border-cyan-500/50 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${
                                position.pnl && position.pnl >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                              }`}>
                                {position.pnl && position.pnl >= 0 ? (
                                  <TrendingUp className="h-6 w-6 text-green-400" />
                                ) : (
                                  <TrendingDown className="h-6 w-6 text-red-400" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-bold">{position.symbol}</h3>
                                  <Badge variant="secondary">{position.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {position.entry_date} → {position.exit_date}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {position.pnl !== null && (
                                <div className={`text-lg font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                                </div>
                              )}
                              {position.pnl_percentage !== null && (
                                <p className={`text-sm ${position.pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ({position.pnl_percentage >= 0 ? '+' : ''}{position.pnl_percentage.toFixed(2)}%)
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Charts and metrics coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Equity curve, trading calendar, and advanced analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Recent trades and updates from this portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Activity feed coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
