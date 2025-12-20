'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  CircleDot,
  Plus,
  Minus,
  XCircle,
  Target,
  DoorClosed,
  FileText,
  MessageSquare,
  Shield,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Clock,
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ActivityEvent {
  id: string
  type: 'entry' | 'exit' | 'add' | 'trim' | 'stopped_out' | 'target_hit' | 'thesis_update' | 'note' | 'stop_moved' | 'target_adjusted' | 'image_upload'
  timestamp: string
  positionId: string
  ticker: string
  companyName: string
  price?: number
  shares?: number
  totalShares?: number
  note?: string
  imageUrl?: string
  pnl?: number
  pnlPct?: number
  rMultiple?: number
  direction?: 'long' | 'short'
  oldValue?: number
  newValue?: number
}

interface ActivityFeedProps {
  limit?: number
  showFilters?: boolean
  compactMode?: boolean
  positionId?: string // Optional: Filter to specific position
}

export function ActivityFeed({
  limit,
  showFilters = true,
  compactMode = false,
  positionId,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [positionId])

  useEffect(() => {
    applyFilters()
  }, [activities, timeFilter, typeFilter])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchActivities, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const url = positionId
        ? `/api/positions/${positionId}/activity`
        : `/api/positions/activity${limit ? `?limit=${limit}` : ''}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...activities]

    // Time filter
    const now = new Date()
    if (timeFilter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0))
      filtered = filtered.filter(a => new Date(a.timestamp) >= startOfDay)
    } else if (timeFilter === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7))
      filtered = filtered.filter(a => new Date(a.timestamp) >= startOfWeek)
    } else if (timeFilter === 'month') {
      const startOfMonth = new Date(now.setDate(now.getDate() - 30))
      filtered = filtered.filter(a => new Date(a.timestamp) >= startOfMonth)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter)
    }

    setFilteredActivities(filtered)
  }

  const getActivityIcon = (type: ActivityEvent['type']) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'entry':
        return <CircleDot className={`${iconClass} text-green-400`} />
      case 'add':
        return <Plus className={`${iconClass} text-blue-400`} />
      case 'trim':
        return <Minus className={`${iconClass} text-yellow-400`} />
      case 'stopped_out':
        return <XCircle className={`${iconClass} text-red-400`} />
      case 'target_hit':
        return <Target className={`${iconClass} text-emerald-400`} />
      case 'exit':
        return <DoorClosed className={`${iconClass} text-gray-400`} />
      case 'thesis_update':
        return <FileText className={`${iconClass} text-blue-400`} />
      case 'note':
        return <MessageSquare className={`${iconClass} text-purple-400`} />
      case 'stop_moved':
        return <Shield className={`${iconClass} text-orange-400`} />
      case 'target_adjusted':
        return <Target className={`${iconClass} text-yellow-400`} />
      case 'image_upload':
        return <ImageIcon className={`${iconClass} text-pink-400`} />
      default:
        return <Activity className={`${iconClass} text-gray-400`} />
    }
  }

  const getActivityColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'entry':
        return 'border-green-500/30 bg-green-500/5'
      case 'add':
        return 'border-blue-500/30 bg-blue-500/5'
      case 'trim':
        return 'border-yellow-500/30 bg-yellow-500/5'
      case 'stopped_out':
        return 'border-red-500/30 bg-red-500/5'
      case 'target_hit':
        return 'border-emerald-500/30 bg-emerald-500/5'
      case 'exit':
        return 'border-gray-500/30 bg-gray-500/5'
      default:
        return 'border-border/50 bg-card/50'
    }
  }

  const getActivityTitle = (activity: ActivityEvent) => {
    switch (activity.type) {
      case 'entry':
        return `Entered ${activity.ticker}`
      case 'exit':
        return `Closed ${activity.ticker}`
      case 'add':
        return `Added to ${activity.ticker}`
      case 'trim':
        return `Trimmed ${activity.ticker}`
      case 'stopped_out':
        return `Stopped Out of ${activity.ticker}`
      case 'target_hit':
        return `Target Hit on ${activity.ticker}`
      case 'thesis_update':
        return `Updated Thesis for ${activity.ticker}`
      case 'note':
        return `Added Note to ${activity.ticker}`
      case 'stop_moved':
        return `Adjusted Stop Loss on ${activity.ticker}`
      case 'target_adjusted':
        return `Adjusted Target on ${activity.ticker}`
      case 'image_upload':
        return `Uploaded Image to ${activity.ticker}`
      default:
        return `Activity on ${activity.ticker}`
    }
  }

  const getActivityDetails = (activity: ActivityEvent) => {
    const details: (string | JSX.Element)[] = []

    if (activity.direction) {
      details.push(`${activity.direction.toUpperCase()}`)
    }

    if (activity.price) {
      details.push(`@ $${activity.price.toFixed(2)}`)
    }

    if (activity.shares) {
      const prefix = activity.shares > 0 ? '+' : ''
      details.push(`${prefix}${activity.shares} shares`)
    }

    if (activity.totalShares) {
      details.push(`Total: ${activity.totalShares} shares`)
    }

    if (activity.pnl !== undefined) {
      const pnlColor = activity.pnl >= 0 ? 'text-green-400' : 'text-red-400'
      const pnlPrefix = activity.pnl >= 0 ? '+' : ''
      details.push(
        <span key="pnl" className={pnlColor}>
          {pnlPrefix}${activity.pnl.toFixed(2)}
        </span>
      )
    }

    if (activity.pnlPct !== undefined) {
      const pnlColor = activity.pnlPct >= 0 ? 'text-green-400' : 'text-red-400'
      const pnlPrefix = activity.pnlPct >= 0 ? '+' : ''
      details.push(
        <span key="pnlPct" className={pnlColor}>
          ({pnlPrefix}{activity.pnlPct.toFixed(2)}%)
        </span>
      )
    }

    if (activity.rMultiple !== undefined) {
      details.push(
        <span key="rMultiple" className="font-bold">
          {activity.rMultiple.toFixed(2)}R
        </span>
      )
    }

    if (activity.oldValue !== undefined && activity.newValue !== undefined) {
      details.push(`${activity.oldValue.toFixed(2)} → ${activity.newValue.toFixed(2)}`)
    }

    return details
  }

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  if (loading) {
    return (
      <Card className="premium-card">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading activity...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {positionId ? 'Position Activity' : 'Daily Activity Feed'}
            </CardTitle>
            <CardDescription>
              {filteredActivities.length} event{filteredActivities.length !== 1 ? 's' : ''} 
              {timeFilter !== 'all' && ` in ${timeFilter === 'today' ? 'the last 24 hours' : `the last ${timeFilter}`}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActivities}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {!positionId && (
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Clock className="w-4 h-4 mr-2" />
                {autoRefresh ? 'Live' : 'Auto'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Time Range</label>
              <Select value={timeFilter} onValueChange={(v: any) => setTimeFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Activity Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="entry">Entries</SelectItem>
                  <SelectItem value="exit">Exits</SelectItem>
                  <SelectItem value="add">Adds</SelectItem>
                  <SelectItem value="trim">Trims</SelectItem>
                  <SelectItem value="target_hit">Target Hits</SelectItem>
                  <SelectItem value="stopped_out">Stopped Out</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                  <SelectItem value="thesis_update">Thesis Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredActivities.map((activity, index) => (
            <Link
              key={activity.id}
              href={`/positions/${activity.positionId}`}
              className="block"
            >
              <div className={`glass-card p-4 border ${getActivityColor(activity.type)} hover:border-primary/50 transition-all cursor-pointer ${
                compactMode ? 'p-3' : 'p-4'
              }`}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-card border-2 border-border flex items-center justify-center ${
                    compactMode ? 'w-8 h-8' : 'w-10 h-10'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-white ${compactMode ? 'text-sm' : 'text-base'}`}>
                          {getActivityTitle(activity)}
                        </h4>
                        <p className={`text-muted-foreground ${compactMode ? 'text-xs' : 'text-sm'}`}>
                          {activity.companyName}
                        </p>
                      </div>
                      <span className={`text-muted-foreground flex-shrink-0 ${compactMode ? 'text-xs' : 'text-sm'}`}>
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>

                    {/* Details */}
                    <div className={`flex flex-wrap items-center gap-2 ${compactMode ? 'text-xs' : 'text-sm'}`}>
                      {getActivityDetails(activity).map((detail, i) => (
                        typeof detail === 'string' ? (
                          <span key={i} className="text-white data-value">
                            {detail}
                          </span>
                        ) : (
                          <span key={i}>{detail}</span>
                        )
                      ))}
                    </div>

                    {/* Note */}
                    {activity.note && (
                      <p className={`text-muted-foreground mt-2 ${compactMode ? 'text-xs' : 'text-sm'}`}>
                        {activity.note}
                      </p>
                    )}

                    {/* Image Preview */}
                    {activity.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={activity.imageUrl}
                          alt="Activity image"
                          className="rounded-lg max-h-32 object-cover border border-border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No activity found</p>
              {(timeFilter !== 'all' || typeFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setTimeFilter('all')
                    setTypeFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Load More */}
        {!limit && filteredActivities.length > 0 && filteredActivities.length % 20 === 0 && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={fetchActivities}>
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
