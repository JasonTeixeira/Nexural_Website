'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  Calendar,
  User,
  PieChart,
  Bookmark,
  BookmarkCheck,
  UserPlus,
  Share2,
  Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Position {
  id: string
  symbol: string
  company_name: string
  type: string
  direction: string
  entry_price: number
  current_price: number | null
  exit_price: number | null
  quantity: number
  entry_date: string
  exit_date: string | null
  status: string
  pnl: number | null
  pnl_percentage: number | null
  unrealized_pnl: number | null
  unrealized_pnl_pct: number | null
  position_value: number
  stop_loss: number | null
  target_price: number | null
  sector: string
  notes: string | null
  entry_reasoning: string | null
  is_admin_signal: boolean
  portfolio_id: string
}

interface Portfolio {
  id: string
  name: string
  user_id: string
}

interface UserProfile {
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export default function PositionDetailPage() {
  const params = useParams()
  const positionId = params?.id as string

  const [position, setPosition] = useState<Position | null>(null)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [owner, setOwner] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [watchlistLoading, setWatchlistLoading] = useState(false)

  useEffect(() => {
    loadPositionData()
  }, [positionId])

  async function loadPositionData() {
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Load position
      const { data: positionData, error: positionError } = await supabase
        .from('positions')
        .select('*')
        .eq('id', positionId)
        .single()

      if (positionError || !positionData) {
        console.error('Position not found:', positionError)
        setLoading(false)
        return
      }

      setPosition(positionData)

      // Load portfolio
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', positionData.portfolio_id)
        .single()

      if (portfolioData) {
        setPortfolio(portfolioData)

        // Check if portfolio is public
        if (portfolioData.visibility === 'private' && (!user || user.id !== portfolioData.user_id)) {
          console.error('Portfolio is private')
          setLoading(false)
          return
        }

        // Load owner profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('user_id, username, display_name, avatar_url')
          .eq('user_id', portfolioData.user_id)
          .single()

        if (profileData) {
          setOwner(profileData)

          // Check if following
          if (user && user.id !== profileData.user_id) {
            const { data: followData } = await supabase
              .from('follows')
              .select('id')
              .eq('follower_id', user.id)
              .eq('following_id', profileData.user_id)
              .single()

            setIsFollowing(!!followData)
          }

          // Check if position is in watchlist
          if (user) {
            await checkWatchlistStatus(user.id)
          }
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading position:', error)
      setLoading(false)
    }
  }

  async function handleFollowToggle() {
    if (!currentUser || !owner) return

    try {
      const supabase = createClient()

      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', owner.user_id)

        setIsFollowing(false)
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: owner.user_id
          })

        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  async function checkWatchlistStatus(userId: string) {
    try {
      const response = await fetch('/api/watchlist/positions')
      if (response.ok) {
        const data = await response.json()
        const inWatchlist = data.watchlist?.some((item: any) => item.position_id === positionId)
        setIsWatchlisted(inWatchlist)
      }
    } catch (error) {
      console.error('Error checking watchlist status:', error)
    }
  }

  async function handleWatchlistToggle() {
    if (!currentUser) {
      window.location.href = '/auth/login'
      return
    }

    setWatchlistLoading(true)

    try {
      if (isWatchlisted) {
        // Remove from watchlist
        const response = await fetch(`/api/watchlist/positions?position_id=${positionId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setIsWatchlisted(false)
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to remove from watchlist')
        }
      } else {
        // Add to watchlist
        const response = await fetch('/api/watchlist/positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position_id: positionId
          })
        })

        if (response.ok) {
          setIsWatchlisted(true)
        } else {
          const error = await response.json()
          if (error.error === 'Position already in watchlist') {
            setIsWatchlisted(true)
          } else {
            alert(error.error || 'Failed to add to watchlist')
          }
        }
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setWatchlistLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading position...</p>
        </div>
      </div>
    )
  }

  if (!position || !portfolio) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Position Not Found</h1>
          <p className="text-gray-400 mb-4">This position doesn't exist or is private</p>
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

  const isOwner = currentUser && owner && currentUser.id === owner.user_id
  const riskRewardRatio = position.stop_loss && position.target_price
    ? Math.abs((position.target_price - position.entry_price) / (position.entry_price - position.stop_loss))
    : null

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href={`/portfolio/${portfolio.id}`} className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {portfolio.name}
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{position.symbol}</h1>
                <Badge variant={position.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                  {position.status}
                </Badge>
                {position.is_admin_signal && (
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    Admin Signal
                  </Badge>
                )}
              </div>
              <p className="text-xl text-gray-400 mb-2">{position.company_name || position.symbol}</p>
              {owner && (
                <Link href={`/profile/${owner.username}`} className="flex items-center gap-2 text-sm text-cyan-400 hover:underline">
                  <User className="h-4 w-4" />
                  {owner.display_name || owner.username}
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {currentUser && (
                <Button
                  variant="outline"
                  onClick={handleWatchlistToggle}
                  disabled={watchlistLoading}
                  className="gap-2"
                >
                  {watchlistLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      {isWatchlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      {isWatchlisted ? 'Watching' : 'Watch'}
                    </>
                  )}
                </Button>
              )}
              {!isOwner && currentUser && owner && (
                <Button
                  onClick={handleFollowToggle}
                  className={isFollowing ? 'bg-gray-700' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}
                >
                  {isFollowing ? 'Following' : <><UserPlus className="h-4 w-4 mr-2" />Follow Trader</>}
                </Button>
              )}
              {!currentUser && (
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Position Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Direction</CardTitle>
              {position.direction === 'long' ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{position.direction}</div>
              <p className="text-xs text-gray-400 mt-1">{position.quantity} shares</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Entry Price</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${position.entry_price.toFixed(2)}</div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(position.entry_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Current Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${position.status === 'closed' 
                  ? (position.exit_price || 0).toFixed(2) 
                  : (position.current_price || position.entry_price).toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {position.status === 'closed' ? 'Exit price' : 'Live price'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">P&L</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              {position.status === 'closed' && position.pnl !== null ? (
                <>
                  <div className={`text-2xl font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                  </div>
                  {position.pnl_percentage !== null && (
                    <p className={`text-xs mt-1 ${position.pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnl_percentage >= 0 ? '+' : ''}{position.pnl_percentage.toFixed(2)}%
                    </p>
                  )}
                </>
              ) : position.unrealized_pnl !== null ? (
                <>
                  <div className={`text-2xl font-bold ${position.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {position.unrealized_pnl >= 0 ? '+' : ''}${position.unrealized_pnl.toFixed(2)}
                  </div>
                  {position.unrealized_pnl_pct !== null && (
                    <p className={`text-xs mt-1 ${position.unrealized_pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.unrealized_pnl_pct >= 0 ? '+' : ''}{position.unrealized_pnl_pct.toFixed(2)}%
                    </p>
                  )}
                </>
              ) : (
                <div className="text-2xl font-bold text-gray-400">--</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Position Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Trade Details */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Trade Details</CardTitle>
                <CardDescription>Entry, targets, and risk management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Entry Price</p>
                    <p className="text-xl font-bold">${position.entry_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Quantity</p>
                    <p className="text-xl font-bold">{position.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Position Value</p>
                    <p className="text-xl font-bold">${position.position_value.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Sector</p>
                    <p className="text-xl font-bold">{position.sector || 'N/A'}</p>
                  </div>
                </div>

                {position.stop_loss && (
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <p className="text-sm font-medium text-gray-400">Stop Loss</p>
                    </div>
                    <p className="text-xl font-bold text-red-400">${position.stop_loss.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {((Math.abs(position.entry_price - position.stop_loss) / position.entry_price) * 100).toFixed(2)}% from entry
                    </p>
                  </div>
                )}

                {position.target_price && (
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-green-400" />
                      <p className="text-sm font-medium text-gray-400">Target Price</p>
                    </div>
                    <p className="text-xl font-bold text-green-400">${position.target_price.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {((Math.abs(position.target_price - position.entry_price) / position.entry_price) * 100).toFixed(2)}% from entry
                    </p>
                  </div>
                )}

                {riskRewardRatio && (
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Risk/Reward Ratio</p>
                    <p className="text-xl font-bold">1:{riskRewardRatio.toFixed(2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Entry Reasoning */}
            {position.entry_reasoning && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Entry Reasoning</CardTitle>
                  <CardDescription>Why this trade was taken</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-wrap">{position.entry_reasoning}</p>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {position.notes && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>Additional observations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-wrap">{position.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Calendar className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Entry</p>
                    <p className="text-xs text-gray-400">
                      {new Date(position.entry_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                {position.status === 'closed' && position.exit_date && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <Calendar className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Exit</p>
                      <p className="text-xs text-gray-400">
                        {new Date(position.exit_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {position.status === 'closed' && position.entry_date && position.exit_date && (
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="text-lg font-bold">
                      {Math.floor((new Date(position.exit_date).getTime() - new Date(position.entry_date).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Info */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/portfolio/${portfolio.id}`} className="hover:text-cyan-400 transition-colors">
                  <p className="text-lg font-bold mb-2">{portfolio.name}</p>
                  <p className="text-sm text-gray-400">View full portfolio →</p>
                </Link>
              </CardContent>
            </Card>

            {/* Actions */}
            {currentUser && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleWatchlistToggle}
                    disabled={watchlistLoading}
                  >
                    {watchlistLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        {isWatchlisted ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                        {isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Position
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
