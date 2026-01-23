'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  User,
  Signal,
  Target,
  XCircle,
  Clock,
  Filter
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ActivityItem {
  id: string
  type: 'entry' | 'exit' | 'add' | 'trim' | 'stopped_out' | 'target_hit' | 'signal'
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  position_id: string
  portfolio_id: string
  portfolio_name: string
  symbol: string
  direction: 'long' | 'short'
  price: number
  quantity: number
  pnl?: number
  pnl_pct?: number
  is_admin_signal: boolean
  created_at: string
  notes?: string
}

interface CommunityActivityFeedProps {
  filter?: 'all' | 'following' | 'signals' | 'entries' | 'exits'
  limit?: number
  showFilters?: boolean
  compact?: boolean
}

export function CommunityActivityFeed({ 
  filter = 'all', 
  limit = 20,
  showFilters = true,
  compact = false 
}: CommunityActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFilter, setCurrentFilter] = useState(filter)
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => {
    loadActivities()
  }, [currentFilter, limit])

  async function loadActivities() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Get current user for following filter
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && currentFilter === 'following') {
        // Load following IDs
        const { data: followData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
        
        const ids = followData?.map(f => f.following_id) || []
        setFollowingIds(ids)
      }

      // Build the activity query
      let query = supabase
        .from('positions')
        .select(`
          id,
          symbol,
          direction,
          entry_price,
          exit_price,
          current_price,
          quantity,
          status,
          pnl,
          pnl_percentage,
          is_admin_signal,
          entry_date,
          exit_date,
          updated_at,
          notes,
          portfolio_id,
          portfolios!inner (
            id,
            name,
            user_id,
            visibility
          ),
          user_profiles!inner (
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('portfolios.visibility', 'public')
        .order('updated_at', { ascending: false })
        .limit(limit)

      // Apply filters
      if (currentFilter === 'signals') {
        query = query.eq('is_admin_signal', true)
      }
      
      if (currentFilter === 'entries') {
        query = query.eq('status', 'open')
      }
      
      if (currentFilter === 'exits') {
        query = query.eq('status', 'closed')
      }

      const { data, error } = await query

      if (error) throw error

      // Transform data into activity items
      const activityItems: ActivityItem[] = []
      
      data?.forEach((position: any) => {
        const portfolio = position.portfolios
        const profile = position.user_profiles

        // Add entry activity
        if (position.entry_date) {
          activityItems.push({
            id: `${position.id}-entry`,
            type: position.is_admin_signal ? 'signal' : 'entry',
            user_id: profile.user_id,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            position_id: position.id,
            portfolio_id: portfolio.id,
            portfolio_name: portfolio.name,
            symbol: position.symbol,
            direction: position.direction,
            price: position.entry_price,
            quantity: position.quantity,
            is_admin_signal: position.is_admin_signal,
            created_at: position.entry_date,
            notes: position.notes
          })
        }

        // Add exit activity
        if (position.status === 'closed' && position.exit_date) {
          const type = position.pnl && position.pnl < 0 ? 'stopped_out' : 
                      position.pnl && position.pnl > position.entry_price * position.quantity * 0.15 ? 'target_hit' : 'exit'
          
          activityItems.push({
            id: `${position.id}-exit`,
            type,
            user_id: profile.user_id,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            position_id: position.id,
            portfolio_id: portfolio.id,
            portfolio_name: portfolio.name,
            symbol: position.symbol,
            direction: position.direction,
            price: position.exit_price || position.current_price,
            quantity: position.quantity,
            pnl: position.pnl,
            pnl_pct: position.pnl_percentage,
            is_admin_signal: position.is_admin_signal,
            created_at: position.exit_date,
            notes: position.notes
          })
        }
      })

      // Sort by date
      activityItems.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      // Filter by following if needed
      let filteredItems = activityItems
      if (currentFilter === 'following' && followingIds.length > 0) {
        filteredItems = activityItems.filter(item => 
          followingIds.includes(item.user_id)
        )
      }

      setActivities(filteredItems)
      setLoading(false)
    } catch (error) {
      console.error('Error loading activities:', error)
      setLoading(false)
    }
  }

  function getActivityIcon(type: ActivityItem['type']) {
    switch (type) {
      case 'entry':
      case 'signal':
        return <TrendingUp className="h-4 w-4" />
      case 'exit':
        return <TrendingDown className="h-4 w-4" />
      case 'target_hit':
        return <Target className="h-4 w-4 text-emerald-400" />
      case 'stopped_out':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Signal className="h-4 w-4" />
    }
  }

  function getActivityText(activity: ActivityItem) {
    const name = activity.display_name || activity.username
    
    switch (activity.type) {
      case 'signal':
        return `posted new signal: ${activity.symbol} ${activity.direction.toUpperCase()}`
      case 'entry':
        return `opened ${activity.symbol} @ $${activity.price.toFixed(2)}`
      case 'exit':
        return `closed ${activity.symbol}`
      case 'target_hit':
        return `hit target on ${activity.symbol}`
      case 'stopped_out':
        return `stopped out of ${activity.symbol}`
      default:
        return `updated ${activity.symbol}`
    }
  }

  function getTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading activity...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Signal className="h-5 w-5 text-cyan-400" />
            Community Activity
          </CardTitle>
          
          {showFilters && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={currentFilter}
                onChange={(e) => setCurrentFilter(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              >
                <option value="all">All Activity</option>
                <option value="following">Following</option>
                <option value="signals">Signals</option>
                <option value="entries">Entries</option>
                <option value="exits">Exits</option>
              </select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Signal className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No activity yet</p>
            <p className="text-sm text-gray-500 mt-2">
              {currentFilter === 'following' 
                ? 'Follow traders to see their activity here'
                : 'Be the first to add a position!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Link 
                key={activity.id} 
                href={`/position/${activity.position_id}`}
                className="block"
              >
                <div className={`p-4 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all ${
                  compact ? 'p-3' : 'p-4'
                }`}>
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      {activity.avatar_url ? (
                        <img 
                          src={activity.avatar_url} 
                          alt={activity.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <Link 
                              href={`/profile/${activity.username}`}
                              className="font-semibold text-white hover:text-cyan-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {activity.display_name || activity.username}
                            </Link>
                            {activity.is_admin_signal && (
                              <Badge className="ml-2 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                Admin
                              </Badge>
                            )}
                          </p>
                          <p className="text-white mt-1">
                            {getActivityText(activity)}
                          </p>
                          {activity.pnl !== undefined && (
                            <div className={`text-sm font-bold mt-1 ${
                              activity.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {activity.pnl >= 0 ? '+' : ''}${activity.pnl.toFixed(2)}
                              {activity.pnl_pct && ` (${activity.pnl_pct >= 0 ? '+' : ''}${activity.pnl_pct.toFixed(1)}%)`}
                            </div>
                          )}
                        </div>

                        {/* Icon & Time */}
                        <div className="flex flex-col items-end gap-1">
                          <div className={`p-2 rounded-lg ${
                            activity.type === 'signal' || activity.type === 'entry' 
                              ? 'bg-green-500/20' 
                              : activity.type === 'target_hit'
                              ? 'bg-emerald-500/20'
                              : activity.type === 'stopped_out'
                              ? 'bg-red-500/20'
                              : 'bg-gray-500/20'
                          }`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(activity.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Portfolio */}
                      <p className="text-xs text-gray-500 mt-2">
                        from{' '}
                        <Link 
                          href={`/portfolio/${activity.portfolio_id}`}
                          className="text-cyan-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {activity.portfolio_name}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {activities.length >= limit && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={loadActivities}>
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
