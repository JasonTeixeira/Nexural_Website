'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitBranch, ZoomIn, ZoomOut, Calendar } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TimelinePosition {
  id: string
  ticker: string
  company_name: string
  entry_date: string
  exit_date: string | null
  status: 'open' | 'closed'
  realized_pnl?: number
  unrealized_pnl?: number
  sector: string
}

interface PositionTimelineProps {
  positions: TimelinePosition[]
}

type TimeRange = '3M' | '6M' | '1Y' | 'ALL'

export function PositionTimeline({ positions }: PositionTimelineProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y')
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null)

  // Sort positions by entry date
  const sortedPositions = [...positions].sort((a, b) => 
    new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  )

  // Calculate date range
  const getDateRange = () => {
    const now = new Date()
    const ranges = {
      '3M': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '6M': new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      '1Y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      'ALL': sortedPositions.length > 0 
        ? new Date(sortedPositions[0].entry_date) 
        : new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    }
    return ranges[timeRange]
  }

  const startDate = getDateRange()
  const endDate = new Date()
  const timeSpan = endDate.getTime() - startDate.getTime()

  // Filter positions based on time range
  const filteredPositions = sortedPositions.filter(pos => {
    const entryDate = new Date(pos.entry_date)
    const exitDate = pos.exit_date ? new Date(pos.exit_date) : null
    
    // Show if entry is within range or position overlaps with range
    return entryDate >= startDate || (exitDate && exitDate >= startDate) || pos.status === 'open'
  })

  // Calculate position on timeline (0 to 100%)
  const getPositionX = (date: string) => {
    const posDate = new Date(date)
    if (posDate < startDate) return 0
    if (posDate > endDate) return 100
    
    const elapsed = posDate.getTime() - startDate.getTime()
    return (elapsed / timeSpan) * 100
  }

  const getPositionWidth = (entry: string, exit: string | null) => {
    const entryX = getPositionX(entry)
    const exitX = exit ? getPositionX(exit) : 100
    return Math.max(exitX - entryX, 1) // Minimum 1% width
  }

  // Get color based on P&L
  const getPositionColor = (pos: TimelinePosition) => {
    if (pos.status === 'open') {
      const pnl = pos.unrealized_pnl || 0
      if (pnl > 0) return 'bg-blue-500'
      if (pnl < 0) return 'bg-orange-500'
      return 'bg-gray-500'
    }
    
    const pnl = pos.realized_pnl || 0
    return pnl >= 0 ? 'bg-green-500' : 'bg-red-500'
  }

  const getBorderColor = (pos: TimelinePosition) => {
    if (pos.status === 'open') {
      const pnl = pos.unrealized_pnl || 0
      if (pnl > 0) return 'border-blue-400'
      if (pnl < 0) return 'border-orange-400'
      return 'border-gray-400'
    }
    
    const pnl = pos.realized_pnl || 0
    return pnl >= 0 ? 'border-green-400' : 'border-red-400'
  }

  // Generate month markers
  const generateMonthMarkers = () => {
    const markers = []
    let current = new Date(startDate)
    current.setDate(1)
    
    while (current <= endDate) {
      const position = getPositionX(current.toISOString())
      markers.push({
        date: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        position,
      })
      current.setMonth(current.getMonth() + 1)
    }
    
    return markers
  }

  const monthMarkers = generateMonthMarkers()

  // Format P&L
  const formatPnL = (pnl: number | undefined) => {
    if (pnl === undefined) return 'N/A'
    const formatted = Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    return pnl >= 0 ? `+$${formatted}` : `-$${formatted}`
  }

  // Calculate days held
  const getDaysHeld = (entry: string, exit: string | null) => {
    const entryDate = new Date(entry)
    const exitDate = exit ? new Date(exit) : new Date()
    return Math.floor((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (positions.length === 0) {
    return (
      <Card className="premium-card">
        <CardContent className="p-12 text-center">
          <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No positions to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Position Timeline
            </CardTitle>
            <CardDescription>
              Chronological view of positions — see entry, duration, and exit dates
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {(['3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Time Axis */}
        <div className="relative mb-4">
          <div className="h-12 border-b border-border relative">
            {monthMarkers.map((marker, i) => (
              <div
                key={i}
                className="absolute top-0 h-full"
                style={{ left: `${marker.position}%` }}
              >
                <div className="h-full w-px bg-border"></div>
                <span className="absolute top-full mt-1 text-xs text-muted-foreground -translate-x-1/2 whitespace-nowrap">
                  {marker.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Positions */}
        <div className="space-y-3 mt-8">
          {filteredPositions.map((position, index) => {
            const x = getPositionX(position.entry_date)
            const width = getPositionWidth(position.entry_date, position.exit_date)
            const color = getPositionColor(position)
            const borderColor = getBorderColor(position)
            const isHovered = hoveredPosition === position.id
            const pnl = position.status === 'open' ? position.unrealized_pnl : position.realized_pnl
            const daysHeld = getDaysHeld(position.entry_date, position.exit_date)

            return (
              <div key={position.id} className="relative">
                {/* Position Bar */}
                <div
                  className="relative h-12 rounded-lg cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPosition(position.id)}
                  onMouseLeave={() => setHoveredPosition(null)}
                  style={{
                    marginLeft: `${x}%`,
                    width: `${width}%`,
                  }}
                >
                  <div className={`absolute inset-0 ${color} ${borderColor} border-2 rounded-lg opacity-80 hover:opacity-100 transition-opacity`}>
                    {/* Position Label */}
                    <div className="flex items-center justify-between h-full px-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white font-bold text-sm truncate">
                          {position.ticker}
                        </span>
                        {width > 10 && (
                          <span className="text-white/80 text-xs truncate">
                            {position.company_name.split(' ').slice(0, 2).join(' ')}
                          </span>
                        )}
                      </div>
                      {width > 15 && (
                        <span className="text-white font-semibold text-sm whitespace-nowrap">
                          {formatPnL(pnl)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 mb-2">
                      <div className="bg-card border border-border rounded-lg p-3 shadow-xl min-w-[250px]">
                        <p className="font-bold text-white mb-1">{position.ticker}</p>
                        <p className="text-xs text-muted-foreground mb-2">{position.company_name}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Entry:</span>
                            <span className="text-white">
                              {new Date(position.entry_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exit:</span>
                            <span className="text-white">
                              {position.exit_date 
                                ? new Date(position.exit_date).toLocaleDateString()
                                : 'Open'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Days Held:</span>
                            <span className="text-white">{daysHeld}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">P&L:</span>
                            <span className={pnl && pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {formatPnL(pnl)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sector:</span>
                            <span className="text-white">{position.sector}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={position.status === 'open' ? 'text-blue-400' : 'text-gray-400'}>
                              {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center justify-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-muted-foreground">Closed Winner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-muted-foreground">Closed Loser</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-muted-foreground">Open (Winning)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-muted-foreground">Open (Losing)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500"></div>
            <span className="text-muted-foreground">Open (Flat)</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 glass-card border border-border rounded-lg">
            <p className="text-2xl font-bold text-white">
              {filteredPositions.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Positions</p>
          </div>
          <div className="text-center p-3 glass-card border border-border rounded-lg">
            <p className="text-2xl font-bold text-blue-400">
              {filteredPositions.filter(p => p.status === 'open').length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Currently Open</p>
          </div>
          <div className="text-center p-3 glass-card border border-border rounded-lg">
            <p className="text-2xl font-bold text-green-400">
              {filteredPositions.filter(p => p.status === 'closed' && (p.realized_pnl || 0) > 0).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Winners</p>
          </div>
          <div className="text-center p-3 glass-card border border-border rounded-lg">
            <p className="text-2xl font-bold text-red-400">
              {filteredPositions.filter(p => p.status === 'closed' && (p.realized_pnl || 0) < 0).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Losers</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
