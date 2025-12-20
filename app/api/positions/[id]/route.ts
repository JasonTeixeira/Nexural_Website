import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/positions/[id]
 * Returns detailed information about a specific position including event history
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createClient()

    // Get position details
    const { data: position, error: positionError } = await supabase
      .from('trading_positions')
      .select('*')
      .eq('id', id)
      .single()

    if (positionError || !position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      )
    }

    // Get position events
    const { data: events, error: eventsError } = await supabase
      .from('position_events')
      .select('*')
      .eq('position_id', id)
      .order('event_date', { ascending: false })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
    }

    // Calculate additional metrics
    const daysHeld = position.entry_date
      ? Math.floor(
          (new Date().getTime() - new Date(position.entry_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

    const riskRewardRatio =
      position.direction === 'long'
        ? (position.target_1 - position.entry_price) /
          (position.entry_price - position.stop_loss)
        : (position.entry_price - position.target_1) /
          (position.stop_loss - position.entry_price)

    const distanceToStop = position.current_price
      ? Math.abs(
          ((position.current_price - position.stop_loss) / position.current_price) * 100
        )
      : 0

    const distanceToTarget = position.current_price && position.target_1
      ? Math.abs(
          ((position.target_1 - position.current_price) / position.current_price) * 100
        )
      : 0

    // Build response
    const response = {
      position: {
        ...position,
        daysHeld,
        riskRewardRatio: riskRewardRatio.toFixed(2),
        distanceToStop: distanceToStop.toFixed(2),
        distanceToTarget: distanceToTarget.toFixed(2),
      },
      events: events || [],
      timeline: (events || []).map((event) => ({
        id: event.id,
        type: event.event_type,
        date: event.event_date,
        price: event.price_at_event,
        shares: event.shares_changed,
        totalShares: event.new_total_shares,
        note: event.note,
        chartUrl: event.chart_url,
      })),
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Unexpected error in /api/positions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
