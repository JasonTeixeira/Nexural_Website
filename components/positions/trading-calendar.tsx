'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  CircleDot,
  Plus,
  Minus,
  XCircle,
  Target,
  DoorClosed
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface CalendarEvent {
  date: string
  type: 'entry' | 'exit' | 'add' | 'trim' | 'stopped_out' | 'target_hit'
  ticker: string
  pnl?: number
  note?: string
}

export function TradingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCalendarEvents()
  }, [currentDate])

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setEvents([])
        setLoading(false)
        return
      }

      // Fetch all positions for the user
      const { data: positions, error } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching positions:', error)
        setEvents([])
        setLoading(false)
        return
      }

      if (!positions || positions.length === 0) {
        setEvents([])
        setLoading(false)
        return
      }

      // Convert positions to calendar events
      const calendarEvents: CalendarEvent[] = []

      // Add entry events for all positions
      positions.forEach(pos => {
        if (pos.entry_date) {
          calendarEvents.push({
            date: pos.entry_date,
            type: 'entry',
            ticker: pos.symbol || pos.ticker,
            pnl: undefined
          })
        }

        // Add exit events for closed positions
        if (pos.status === 'closed' && pos.exit_date) {
          calendarEvents.push({
            date: pos.exit_date,
            type: 'exit',
            ticker: pos.symbol || pos.ticker,
            pnl: pos.realized_pnl || 0
          })
        }
      })

      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getEventIcon = (type: CalendarEvent['type']) => {
    const iconClass = "w-3 h-3"
    switch (type) {
      case 'entry': return <CircleDot className={`${iconClass} text-green-400`} />
      case 'exit': return <DoorClosed className={`${iconClass} text-gray-400`} />
      case 'add': return <Plus className={`${iconClass} text-blue-400`} />
      case 'trim': return <Minus className={`${iconClass} text-yellow-400`} />
      case 'stopped_out': return <XCircle className={`${iconClass} text-red-400`} />
      case 'target_hit': return <Target className={`${iconClass} text-emerald-400`} />
      default: return <CircleDot className={`${iconClass} text-gray-400`} />
    }
  }

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'entry': return 'bg-green-500/20 border-green-500/30'
      case 'exit': return 'bg-gray-500/20 border-gray-500/30'
      case 'add': return 'bg-blue-500/20 border-blue-500/30'
      case 'trim': return 'bg-yellow-500/20 border-yellow-500/30'
      case 'stopped_out': return 'bg-red-500/20 border-red-500/30'
      case 'target_hit': return 'bg-emerald-500/20 border-emerald-500/30'
      default: return 'bg-primary/20 border-primary/30'
    }
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const calendarDays: (number | null)[] = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const getEventsForDay = (day: number | null) => {
    if (!day) return []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return events.filter(e => e.date === dateStr)
  }

  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear()
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Trading Calendar
            </CardTitle>
            <CardDescription>
              Track entries, exits, and trade events by date
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white font-semibold min-w-[140px] text-center">
              {monthName}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading calendar...</p>
          </div>
        ) : (
          <div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day)
                const today = isToday(day)
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 rounded-lg border ${
                      day
                        ? today
                          ? 'bg-primary/10 border-primary/50'
                          : 'bg-card border-border/50 hover:border-border'
                        : 'bg-transparent border-transparent'
                    } transition-colors`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-semibold mb-2 ${
                          today ? 'text-primary' : 'text-white'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className={`text-xs p-1 rounded border ${getEventColor(event.type)} flex items-center gap-1`}
                              title={`${event.type}: ${event.ticker}${event.pnl ? ` (${event.pnl >= 0 ? '+' : ''}$${event.pnl.toFixed(0)})` : ''}`}
                            >
                              {getEventIcon(event.type)}
                              <span className="text-white truncate font-semibold">{event.ticker}</span>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[10px] text-muted-foreground text-center">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <CircleDot className="w-3 h-3 text-green-400" />
                <span className="text-muted-foreground">Entry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Plus className="w-3 h-3 text-blue-400" />
                <span className="text-muted-foreground">Add</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Minus className="w-3 h-3 text-yellow-400" />
                <span className="text-muted-foreground">Trim</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-3 h-3 text-emerald-400" />
                <span className="text-muted-foreground">Target Hit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="w-3 h-3 text-red-400" />
                <span className="text-muted-foreground">Stopped Out</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DoorClosed className="w-3 h-3 text-gray-400" />
                <span className="text-muted-foreground">Exit</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
