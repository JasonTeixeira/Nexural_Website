'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  FileText,
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { formatDistanceToNow } from 'date-fns'

interface ActivityEvent {
  id: string
  activity_type: string
  activity_category: string
  description: string
  reason?: string
  old_value?: any
  new_value?: any
  impact_description?: string
  timestamp: string
  importance: string
  discord_notified: boolean
}

interface ActivityTimelineProps {
  positionId: string
  ticker: string
}

const ACTIVITY_ICONS: Record<string, any> = {
  position_opened: TrendingUp,
  position_closed: CheckCircle,
  stop_moved: Shield,
  target_hit: Target,
  target_updated: Target,
  targets_updated: Target,
  size_adjusted: Activity,
  note_added: FileText,
  observation: FileText,
  price_alert: Bell,
  risk_adjusted: AlertCircle,
  default: Activity,
}

const ACTIVITY_COLORS: Record<string, string> = {
  position_opened: 'text-green-400',
  position_closed: 'text-blue-400',
  stop_moved: 'text-red-400',
  target_hit: 'text-emerald-400',
  target_updated: 'text-yellow-400',
  targets_updated: 'text-yellow-400',
  size_adjusted: 'text-purple-400',
  note_added: 'text-gray-400',
  observation: 'text-gray-400',
  price_alert: 'text-orange-400',
  risk_adjusted: 'text-red-400',
  default: 'text-muted-foreground',
}

const IMPORTANCE_BADGES: Record<string, { color: string; label: string }> = {
  high: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'High' },
  normal: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Normal' },
  low: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Low' },
}

export function ActivityTimeline({ positionId, ticker }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterImportance, setFilterImportance] = useState<string>('all')

  useEffect(() => {
    loadActivities()
  }, [positionId])

  useEffect(() => {
    applyFilters()
  }, [activities, filterCategory, filterImportance])

  const loadActivities = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('position_events')
        .select('id,position_id,event_type,event_date,note,price,shares,amendment_class,discord_sent')
        .eq('position_id', positionId)
        .order('event_date', { ascending: false })

      if (error) throw error

      const mapped: ActivityEvent[] = (data || []).map((row: any) => {
        const type = String(row.event_type || '')
        const category = type.includes('stop') || type.includes('risk') ? 'risk' : type.includes('target') ? 'analysis' : 'trade'
        const description = row.note || type
        return {
          id: row.id,
          activity_type: type,
          activity_category: category,
          description,
          timestamp: row.event_date,
          importance: 'normal',
          discord_notified: Boolean(row.discord_sent),
        }
      })

      setActivities(mapped)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = activities

    if (filterCategory !== 'all') {
      filtered = filtered.filter(a => a.activity_category === filterCategory)
    }

    if (filterImportance !== 'all') {
      filtered = filtered.filter(a => a.importance === filterImportance)
    }

    setFilteredActivities(filtered)
  }

  const getActivityIcon = (activityType: string) => {
    const Icon = ACTIVITY_ICONS[activityType] || ACTIVITY_ICONS.default
    const color = ACTIVITY_COLORS[activityType] || ACTIVITY_COLORS.default
    return { Icon, color }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return new Date(timestamp).toLocaleString()
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      trade: 'bg-green-500/20 text-green-400 border-green-500/30',
      risk: 'bg-red-500/20 text-red-400 border-red-500/30',
      analysis: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    }

    return (
      <Badge className={colors[category] || colors.admin}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading activity...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 glass-card p-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="trade">Trade</SelectItem>
            <SelectItem value="risk">Risk</SelectItem>
            <SelectItem value="analysis">Analysis</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterImportance} onValueChange={setFilterImportance}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Importance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Importance</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredActivities.length} {filteredActivities.length === 1 ? 'event' : 'events'}
        </div>
      </div>

      {/* Timeline */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No activity found</p>
          {(filterCategory !== 'all' || filterImportance !== 'all') && (
            <Button
              variant="link"
              onClick={() => {
                setFilterCategory('all')
                setFilterImportance('all')
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => {
            const { Icon, color } = getActivityIcon(activity.activity_type)
            const isLast = index === filteredActivities.length - 1
            
            return (
              <div key={activity.id} className="relative">
                {/* Timeline Line */}
                {!isLast && (
                  <div className="absolute left-[21px] top-[42px] bottom-[-16px] w-[2px] bg-white/10" />
                )}

                {/* Activity Card */}
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-black/40 border-2 border-white/10 flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 glass-card p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getCategoryBadge(activity.activity_category)}
                          {IMPORTANCE_BADGES[activity.importance] && activity.importance !== 'normal' && (
                            <Badge className={IMPORTANCE_BADGES[activity.importance].color}>
                              {IMPORTANCE_BADGES[activity.importance].label}
                            </Badge>
                          )}
                          {activity.discord_notified && (
                            <Badge variant="outline" className="text-xs">
                              <Bell className="w-3 h-3 mr-1" />
                              Discord
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {activity.description}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    </div>

                    {/* Reason */}
                    {activity.reason && (
                      <div className="pl-4 border-l-2 border-primary/30">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-primary">Reason:</span> {activity.reason}
                        </p>
                      </div>
                    )}

                    {/* Impact */}
                    {activity.impact_description && (
                      <div className="pl-4 border-l-2 border-green-500/30">
                        <p className="text-sm text-green-400">
                          <span className="font-semibold">Impact:</span> {activity.impact_description}
                        </p>
                      </div>
                    )}

                    {/* Value Changes */}
                    {(activity.old_value || activity.new_value) && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {activity.old_value && (
                          <div className="space-y-1">
                            <p className="text-muted-foreground text-xs">Previous</p>
                            <pre className="text-xs text-red-400 bg-black/20 p-2 rounded">
                              {JSON.stringify(activity.old_value, null, 2)}
                            </pre>
                          </div>
                        )}
                        {activity.new_value && (
                          <div className="space-y-1">
                            <p className="text-muted-foreground text-xs">New</p>
                            <pre className="text-xs text-green-400 bg-black/20 p-2 rounded">
                              {JSON.stringify(activity.new_value, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Full Timestamp (on hover) */}
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stats Summary */}
      <div className="glass-card p-4">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Activity Summary
        </h4>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {activities.filter(a => a.activity_category === 'trade').length}
            </p>
            <p className="text-xs text-muted-foreground">Trade Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {activities.filter(a => a.activity_category === 'risk').length}
            </p>
            <p className="text-xs text-muted-foreground">Risk Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {activities.filter(a => a.activity_category === 'analysis').length}
            </p>
            <p className="text-xs text-muted-foreground">Analysis</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {activities.filter(a => a.discord_notified).length}
            </p>
            <p className="text-xs text-muted-foreground">Discord Sent</p>
          </div>
        </div>
      </div>

      {/* Reload Button */}
      <Button
        variant="outline"
        onClick={loadActivities}
        className="w-full"
      >
        <Activity className="w-4 h-4 mr-2" />
        Refresh Activity
      </Button>
    </div>
  )
}
