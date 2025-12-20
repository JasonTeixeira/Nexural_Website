'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Signal,
  Activity,
  Target
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ActivityItem {
  id: string
  type: 'entry' | 'exit' | 'target_hit' | 'stopped_out' | 'signal'
  position: {
    id: string
    symbol: string
    direction: string
    entry_price: number
    exit_price: number | null
    pnl: number | null
    pnl_percentage: number | null
    entry_date: string
    exit_date: string | null
    status: string
    is_admin_signal: boolean
  }
  portfolio: {
    id: string
    name: string
  }
  user: {
    user_id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  timestamp: string
}

interface FollowingFeedProps {
  currentUser: any
  followingCount: number
}

export function FollowingFeed({ currentUser, followingCount }: FollowingFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (currentUser && followingCount > 0) {
      loadFollowingActivity()
    } else {
      setLoading(false)
    }
  }, [currentUser, followingCount])

  async function loadFollowingActivity() {
    try {
      const supabase = createClient()

      // Get following list
      const { data: followsData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id)

      if (!followsData || followsData.length === 0) {
        setLoading(false)
        return
      }

      const followingIds = followsData.map(f => f.following_id)

      // Load positions from followed users' public portfolios
      const { data: portfoliosData } = await supabase
        .from('portfolios')
        .select('id, name, user_id')
        .in('user_id', followingIds)
        .eq('visibility', 'public')

      if (!portfoliosData || portfoliosData.length === 0) {
        setLoading(false)
        return
      }

      const portfolioIds = portfoliosData.map(p => p.id)

      // Load positions from these portfolios
      const { data: positionsData } = await supabase
        .from('positions')
        .select('*')
        .in('portfolio_id', portfolioIds)
        .order('updated_at', { ascending: false })
        .range(page * 20, (page + 1) * 20 - 1)

      if (!positionsData || positionsData.length === 0) {
        setHasMore(false)
        setLoading(false)
        return
      }

      // Load user profiles
      const userIds = [...new Set(portfoliosData.map(p => p.user_id))]
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds)

      // Build activity items
      const newActivities: ActivityItem[] = []

      for (const position of positionsData) {
        const portfolio = portfoliosData.find(p => p.id === position.portfolio_id)
        const user = profilesData?.find(u => u.user_id === portfolio?.user_id)

        if (!portfolio || !user) continue

        let type: ActivityItem['type'] = 'entry'
        if (position.status === 'closed' && position.exit_date) {
          if (position.pnl && position.pnl > 0) {
            type = 'target_hit'
          } else {
            type = 'stopped_out'
          }
        } else if (position.status === 'open') {
          type = position.is_admin_signal ? 'signal' : 'entry'
        }

        newActivities.push({
          id: position.id,
          type,
          position: {
            id: position.id,
            symbol: position.symbol,
            direction: position.direction,
            entry_price: position.entry_price,
            exit_price: position.exit_price,
            pnl: position.pnl,
            pnl_percentage: position.pnl_percentage,
            entry_date: position.entry_date,
            exit_date: position.exit_date,
            status: position.status,
            is_admin_signal: position.is_admin_signal
          },
          portfolio,
          user,
          timestamp: position.updated_at || position.entry_date
        })
      }

      setActivities(prev => page === 0 ? newActivities : [...prev, ...newActivities])
      setHasMore(positionsData.length === 20)
      setLoading(false)
    } catch (error) {
      console.error('Error loading following activity:', error)
      setLoading(false)
    }
  }

  function getActivityIcon(activity: ActivityItem) {
    switch (activity.type) {
      case 'entry':
        return activity.position.direction === 'long' ? TrendingUp : TrendingDown
      case 'target_hit':
        return Target
      case 'stopped_out':
        return TrendingDown
      case 'signal':
        return Signal
      default:
        return Activity
    }
  }

  function getActivityColor(activity: ActivityItem) {
    switch (activity.type) {
      case 'entry':
        return activity.position.direction === 'long' ? 'text-green-400' : 'text-red-400'
      case 'target_hit':
        return 'text-green-400'
      case 'stopped_out':
        return 'text-red-400'
      case 'signal':
        return 'text-cyan-400'
      default:
        return 'text-gray-400'
    }
  }

  function formatTimeAgo(timestamp: string) {
    const now = new Date()
    const then = new Date(timestamp)
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return then.toLocaleDateString()
  }

  function getActivityText(activity: ActivityItem) {
    switch (activity.type) {
      case 'entry':
        return `opened ${activity.position.symbol}`
      case 'exit':
        return `closed ${activity.position.symbol}`
      case 'target_hit':
        return `hit target on ${activity.position.symbol}`
      case 'stopped_out':
        return `stopped out of ${activity.position.symbol}`
      case 'signal':
        return `signaled ${activity.position.symbol}`
      default:
        return `traded ${activity.position.symbol}`
    }
  }

  // Not following anyone
  if (followingCount === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="py-16">
          <div className="text-center max-w-md mx-auto">
            <Users className="h-20 w-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Start Following Traders</h2>
            <p className="text-gray-400 mb-8">
              Follow traders to see their latest positions, trades, and signals in your personalized feed. 
              Discover successful traders and learn from their strategies!
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Switch to the "Discover" tab to browse traders and start following.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your feed...</p>
        </div>
      </div>
    )
  }

  // No activity yet
  if (activities.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="py-12">
          <div className="text-center">
            <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
            <p className="text-gray-400 mb-4">
              The traders you follow haven't posted any public activity yet. Check back soon!
            </p>
            <p className="text-sm text-gray-500">
              You're following {followingCount} trader{followingCount !== 1 ? 's' : ''}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity)
        const colorClass = getActivityColor(activity)

        return (
          <Link key={activity.id} href={`/position/${activity.position.id}`}>
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <Link href={`/profile/${activity.user.username}`} onClick={(e) => e.stopPropagation()}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      {activity.user.avatar_url ? (
                        <img 
                          src={activity.user.avatar_url} 
                          alt={activity.user.username} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {activity.user.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Link href={`/profile/${activity.user.username}`} onClick={(e) => e.stopPropagation()}>
                          <span className="font-semibold hover:text-cyan-400 transition-colors">
                            {activity.user.display_name || activity.user.username}
                          </span>
                        </Link>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-gray-400">{getActivityText(activity)}</span>
                      </div>
                      <span className="text-sm text-gray-400 flex-shrink-0 ml-4">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>

                    {/* Position Details */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.position.direction === 'long' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold group-hover:text-cyan-400 transition-colors">
                            {activity.position.symbol}
                          </h3>
                          <Badge variant={activity.position.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                            {activity.position.status}
                          </Badge>
                          {activity.position.is_admin_signal && (
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                              Signal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          Entry: ${activity.position.entry_price.toFixed(2)}
                          {activity.position.exit_price && ` → Exit: $${activity.position.exit_price.toFixed(2)}`}
                        </p>
                      </div>

                      {/* P&L */}
                      {activity.position.pnl !== null && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            activity.position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {activity.position.pnl >= 0 ? '+' : ''}${activity.position.pnl.toFixed(2)}
                          </div>
                          {activity.position.pnl_percentage !== null && (
                            <p className={`text-sm ${
                              activity.position.pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {activity.position.pnl_percentage >= 0 ? '+' : ''}{activity.position.pnl_percentage.toFixed(2)}%
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Portfolio Attribution */}
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                      <span>From portfolio:</span>
                      <Link 
                        href={`/portfolio/${activity.portfolio.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-cyan-400 hover:underline"
                      >
                        {activity.portfolio.name}
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button 
            onClick={() => {
              setPage(page + 1)
              loadFollowingActivity()
            }} 
            variant="outline" 
            size="lg"
          >
            Load More Activity
          </Button>
        </div>
      )}
    </div>
  )
}
