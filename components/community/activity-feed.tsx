'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, Target, Shield, Award, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Activity {
  id: string
  user_id: string
  username: string
  full_name: string
  avatar_url: string | null
  activity_type: string
  position_id: string | null
  symbol: string | null
  direction: string | null
  metadata: any
  created_at: string
}

interface ActivityFeedProps {
  userId?: string
  limit?: number
  showOnlyFollowing?: boolean
}

export function ActivityFeed({ 
  userId, 
  limit = 20,
  showOnlyFollowing = true 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    loadActivities()
  }, [userId, filter, showOnlyFollowing])

  async function loadActivities() {
    try {
      setIsLoading(true)

      if (showOnlyFollowing && userId) {
        // Get activities from people user follows
        const { data, error } = await supabase
          .from('following_feed_view')
          .select('*')
          .limit(limit)

        if (error) throw error
        setActivities(data || [])
      } else {
        // Get all public activities
        const query = supabase
          .from('activity_feed')
          .select(`
            *,
            user:members!activity_feed_user_id_fkey(
              username,
              full_name,
              avatar_url
            ),
            position:trading_positions!activity_feed_position_id_fkey(
              symbol,
              direction
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (filter !== 'all') {
          query.eq('activity_type', filter)
        }

        const { data, error } = await query

        if (error) throw error

        // Flatten the data structure
        const formattedData = data?.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          username: item.user?.username,
          full_name: item.user?.full_name,
          avatar_url: item.user?.avatar_url,
          activity_type: item.activity_type,
          position_id: item.position_id,
          symbol: item.position?.symbol,
          direction: item.position?.direction,
          metadata: item.metadata,
          created_at: item.created_at
        })) || []

        setActivities(formattedData)
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case 'position_opened':
        return <TrendingUp className="h-5 w-5 text-blue-400" />
      case 'position_closed':
        return <TrendingDown className="h-5 w-5 text-gray-400" />
      case 'won_trade':
        return <Award className="h-5 w-5 text-green-400" />
      case 'lost_trade':
        return <TrendingDown className="h-5 w-5 text-red-400" />
      case 'target_hit':
        return <Target className="h-5 w-5 text-purple-400" />
      case 'stop_moved':
        return <Shield className="h-5 w-5 text-yellow-400" />
      case 'started_following':
        return <UserPlus className="h-5 w-5 text-cyan-400" />
      default:
        return <TrendingUp className="h-5 w-5 text-gray-400" />
    }
  }

  function getActivityText(activity: Activity): string {
    const { activity_type, metadata, symbol, direction } = activity

    switch (activity_type) {
      case 'position_opened':
        return `opened a ${direction?.toUpperCase()} position on ${symbol}`
      case 'position_closed':
        return `closed their position on ${symbol}`
      case 'won_trade':
        const winPnl = metadata?.pnl ? `+$${Math.abs(metadata.pnl).toLocaleString()}` : ''
        const winPercent = metadata?.return_percent ? `(+${metadata.return_percent.toFixed(2)}%)` : ''
        return `won on ${symbol} ${winPnl} ${winPercent}`.trim()
      case 'lost_trade':
        const lossPnl = metadata?.pnl ? `-$${Math.abs(metadata.pnl).toLocaleString()}` : ''
        const lossPercent = metadata?.return_percent ? `(${metadata.return_percent.toFixed(2)}%)` : ''
        return `closed ${symbol} ${lossPnl} ${lossPercent}`.trim()
      case 'target_hit':
        return `hit their target on ${symbol}`
      case 'stop_moved':
        return `moved their stop on ${symbol}`
      case 'started_following':
        return `started following ${metadata?.followed_user || 'someone'}`
      case 'milestone_achieved':
        return `achieved a milestone: ${metadata?.milestone || 'unknown'}`
      default:
        return 'had an activity'
    }
  }

  function getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg animate-pulse">
            <div className="h-10 w-10 bg-gray-800 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
        <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No Activity Yet</h3>
        <p className="text-sm text-gray-500">
          {showOnlyFollowing 
            ? "Follow some traders to see their activity here!"
            : "Be the first to share your trades!"}
        </p>
        {showOnlyFollowing && (
          <Link
            href="/community"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Community
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All Activity
        </FilterButton>
        <FilterButton 
          active={filter === 'position_opened'} 
          onClick={() => setFilter('position_opened')}
        >
          New Positions
        </FilterButton>
        <FilterButton 
          active={filter === 'won_trade'} 
          onClick={() => setFilter('won_trade')}
        >
          Wins
        </FilterButton>
        <FilterButton 
          active={filter === 'lost_trade'} 
          onClick={() => setFilter('lost_trade')}
        >
          Losses
        </FilterButton>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
          >
            {/* Avatar */}
            <Link href={`/profile/${activity.username}`}>
              <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 transition-all">
                {activity.avatar_url ? (
                  <img src={activity.avatar_url} alt={activity.username} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-gray-400">
                    {activity.username?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <Link 
                      href={`/profile/${activity.username}`}
                      className="font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {activity.full_name || activity.username}
                    </Link>
                    {' '}
                    {getActivityText(activity)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTimeAgo(activity.created_at)}
                  </p>
                </div>

                {/* Position Badge */}
                {activity.symbol && activity.position_id && (
                  <Link href={`/position/${activity.position_id}`}>
                    <Badge 
                      variant="outline" 
                      className="text-xs hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      {activity.symbol}
                    </Badge>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {activities.length >= limit && (
        <button
          onClick={() => {/* Implement pagination */}}
          className="w-full py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Load more activities...
        </button>
      )}
    </div>
  )
}

function FilterButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean
  onClick: () => void
  children: React.ReactNode 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  )
}
