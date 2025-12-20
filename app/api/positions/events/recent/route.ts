import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/positions/events/recent
 * Returns recent position events for the activity feed
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createClient()

    // Get recent events with position details
    const { data: events, error } = await supabase
      .from('position_events')
      .select(`
        *,
        position:trading_positions(
          ticker,
          company_name,
          direction,
          status,
          sector
        )
      `)
      .order('event_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching recent events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Format events for display
    const formattedEvents = (events || []).map((event: any) => {
      const position = event.position
      const timeAgo = getTimeAgo(new Date(event.event_date))

      return {
        id: event.id,
        positionId: event.position_id,
        type: event.event_type,
        date: event.event_date,
        timeAgo,
        price: event.price_at_event,
        sharesChanged: event.shares_changed,
        totalShares: event.new_total_shares,
        note: event.note,
        chartUrl: event.chart_url,
        ticker: position?.ticker || 'N/A',
        companyName: position?.company_name,
        direction: position?.direction,
        status: position?.status,
        sector: position?.sector,
      }
    })

    return NextResponse.json({
      events: formattedEvents,
      count: formattedEvents.length,
      pagination: {
        limit,
        offset,
        hasMore: formattedEvents.length === limit,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Unexpected error in /api/positions/events/recent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to format time ago
 */
function getTimeAgo(date: Date): string {
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (secondsAgo < 60) return 'Just now'
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`
  if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 604800)}w ago`
  return date.toLocaleDateString()
}
