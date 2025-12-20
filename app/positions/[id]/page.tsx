'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  ExternalLink,
  AlertCircle,
  CircleDot,
  Plus,
  Minus,
  XCircle,
  DoorClosed,
  FileText,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

interface Position {
  id: string
  ticker: string
  company_name: string
  direction: string
  status: string
  entry_date: string
  entry_price: number
  current_price: number
  current_avg_price: number
  shares_contracts: number
  position_value: number
  portfolio_weight_pct: number
  stop_loss: number
  target_1: number
  target_2: number
  target_3: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  r_multiple_current: number
  sector: string
  setup_type: string
  conviction_level: string
  thesis: string
  entry_chart_url: string
  tags: string[]
  daysHeld: number
  riskRewardRatio: string
  distanceToStop: string
  distanceToTarget: string
  risk_amount: number
}

interface Event {
  id: string
  type: string
  date: string
  price: number
  shares: number
  totalShares: number
  note: string
  chartUrl: string
}

interface PositionDetail {
  position: Position
  events: Event[]
  timeline: Event[]
}

export default function PositionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<PositionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchPositionDetail(params.id as string)
    }
  }, [params.id])

  const fetchPositionDetail = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/positions/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Position not found')
        } else {
          setError('Failed to load position details')
        }
        return
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching position:', err)
      setError('Failed to load position details')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRMultipleBadgeColor = (rMultiple: number) => {
    if (rMultiple < 0) return 'bg-red-500/20 text-red-400 border-red-500/30'
    if (rMultiple < 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    if (rMultiple < 2) return 'bg-green-500/20 text-green-400 border-green-500/30'
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  }

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case 'entered':
        return 'default'
      case 'scaling':
        return 'default'
      case 'trimming':
        return 'secondary'
      case 'closed':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getConvictionColor = (level: string) => {
    switch (level) {
      case 'max':
        return 'text-emerald-400'
      case 'high':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-orange-400'
      default:
        return 'text-gray-400'
    }
  }

  const getEventIcon = (type: string) => {
    const iconClass = "w-4 h-4"
    switch (type) {
      case 'entered':
        return <CircleDot className={`${iconClass} text-green-400`} />
      case 'added':
        return <Plus className={`${iconClass} text-blue-400`} />
      case 'trimmed':
        return <Minus className={`${iconClass} text-yellow-400`} />
      case 'stopped_out':
        return <XCircle className={`${iconClass} text-red-400`} />
      case 'target_hit':
        return <Target className={`${iconClass} text-emerald-400`} />
      case 'closed':
        return <DoorClosed className={`${iconClass} text-gray-400`} />
      case 'thesis_updated':
        return <FileText className={`${iconClass} text-blue-400`} />
      case 'note_added':
        return <MessageSquare className={`${iconClass} text-purple-400`} />
      case 'stop_moved':
        return <Shield className={`${iconClass} text-orange-400`} />
      case 'target_adjusted':
        return <Target className={`${iconClass} text-yellow-400`} />
      default:
        return <Activity className={`${iconClass} text-gray-400`} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading position details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => router.push('/positions')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Positions
          </Button>
          <Card className="premium-card">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">{error || 'Position not found'}</h3>
              <p className="text-muted-foreground mb-6">
                The position you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/positions">
                <Button>View All Positions</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { position, timeline } = data

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/positions')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Positions
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{position.ticker}</h1>
                <Badge
                  variant={position.direction === 'long' ? 'default' : 'secondary'}
                >
                  {position.direction.toUpperCase()}
                </Badge>
                <Badge variant={getStatusBadgeVariant(position.status)}>
                  {position.status.toUpperCase()}
                </Badge>
                <Badge className={getRMultipleBadgeColor(position.r_multiple_current || 0)}>
                  {(position.r_multiple_current || 0).toFixed(2)}R
                </Badge>
              </div>
              <p className="text-xl text-muted-foreground">{position.company_name}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Entered {formatDate(position.entry_date)}
                </span>
                <span>•</span>
                <span>{position.daysHeld} days held</span>
                <span>•</span>
                <span className={getConvictionColor(position.conviction_level)}>
                  {position.conviction_level.toUpperCase()} Conviction
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold data-value ${
                (position.unrealized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(position.unrealized_pnl || 0)}
              </p>
              <p className={`text-lg ${
                (position.unrealized_pnl_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPercent(position.unrealized_pnl_pct || 0)}
              </p>
            </div>
          </div>

          {/* Tags */}
          {position.tags && position.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {position.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="premium-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Entry Price</p>
              <p className="text-lg font-bold text-white data-value">
                ${position.entry_price.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Current Price</p>
              <p className="text-lg font-bold text-white data-value">
                ${(position.current_price || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
              <p className="text-lg font-bold text-red-400 data-value">
                ${position.stop_loss.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {position.distanceToStop}% away
              </p>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Target 1</p>
              <p className="text-lg font-bold text-green-400 data-value">
                ${position.target_1.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {position.distanceToTarget}% away
              </p>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Position Size</p>
              <p className="text-lg font-bold text-white data-value">
                {position.shares_contracts}
              </p>
              <p className="text-xs text-muted-foreground mt-1">shares</p>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Position Value</p>
              <p className="text-lg font-bold text-white data-value">
                {formatCurrency(position.position_value || 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Portfolio %</p>
              <p className="text-lg font-bold text-white data-value">
                {(position.portfolio_weight_pct || 0).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Thesis */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Trade Thesis
                </CardTitle>
                <CardDescription>Original entry reasoning and setup analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white whitespace-pre-wrap">{position.thesis}</p>
                </div>
                {position.entry_chart_url && (
                  <div className="mt-4">
                    <a
                      href={position.entry_chart_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 text-sm flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Entry Chart
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Timeline */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Position Timeline
                </CardTitle>
                <CardDescription>Complete history of all actions taken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="relative">
                      {/* Timeline line */}
                      {index < timeline.length - 1 && (
                        <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-border" />
                      )}
                      
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center text-lg relative z-10">
                          {getEventIcon(event.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <div className="glass-card p-4 border border-white/5">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-white uppercase text-sm">
                                  {event.type.replace(/_/g, ' ')}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {formatDateTime(event.date)}
                                </p>
                              </div>
                              {event.price && (
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-white data-value">
                                    ${event.price.toFixed(2)}
                                  </p>
                                  {event.shares && (
                                    <p className="text-xs text-muted-foreground">
                                      {event.shares > 0 ? '+' : ''}{event.shares} shares
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            {event.note && (
                              <p className="text-sm text-muted-foreground mb-2">{event.note}</p>
                            )}

                            {event.totalShares && (
                              <p className="text-xs text-muted-foreground">
                                Total position: {event.totalShares} shares
                              </p>
                            )}

                            {event.chartUrl && (
                              <a
                                href={event.chartUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 text-xs flex items-center gap-1 mt-2"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Chart
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {timeline.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No events recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Metrics */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5" />
                  Risk Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Risk Amount</span>
                    <span className="font-bold text-white data-value">
                      {formatCurrency(position.risk_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">R-Multiple</span>
                    <span className={`font-bold data-value ${
                      (position.r_multiple_current || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(position.r_multiple_current || 0).toFixed(2)}R
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Risk:Reward</span>
                    <span className="font-bold text-white data-value">
                      1:{position.riskRewardRatio}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Distance to Stop</span>
                    <span className="font-bold text-red-400 data-value">
                      {position.distanceToStop}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Details */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-lg">Setup Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Setup Type</span>
                    <p className="text-white font-semibold capitalize">
                      {position.setup_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Sector</span>
                    <p className="text-white font-semibold">{position.sector}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Conviction Level</span>
                    <p className={`font-semibold capitalize ${getConvictionColor(position.conviction_level)}`}>
                      {position.conviction_level}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Days Held</span>
                    <p className="text-white font-semibold data-value">{position.daysHeld}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Targets */}
            {(position.target_2 || position.target_3) && (
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5" />
                    Price Targets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Target 1</span>
                      <span className="font-bold text-green-400 data-value">
                        ${position.target_1.toFixed(2)}
                      </span>
                    </div>
                    {position.target_2 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Target 2</span>
                        <span className="font-bold text-green-400 data-value">
                          ${position.target_2.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {position.target_3 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Target 3</span>
                        <span className="font-bold text-green-400 data-value">
                          ${position.target_3.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
