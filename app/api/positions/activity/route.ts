import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    // Query position_events for activity feed
    const { data: events, error } = await supabase
      .from('position_events')
      .select(`
        id,
        event_type,
        event_date,
        price,
        shares,
        note,
        trading_positions!inner (
          id,
          ticker,
          company_name,
          direction
        )
      `)
      .order('event_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching activity:', error)
      return NextResponse.json(
        { error: 'Failed to fetch activity' },
        { status: 500 }
      )
    }

    // Transform events into activity format
    const activities = await Promise.all(
      events.map(async (event: any) => {
        const position = event.trading_positions

        // Get total shares after this event (if applicable)
        let totalShares = undefined
        if (event.shares) {
          const { data: posData } = await supabase
            .from('trading_positions')
            .select('shares_contracts')
            .eq('id', position.id)
            .single()
          
          totalShares = posData?.shares_contracts
        }

        // Calculate P&L for exit events
        let pnl = undefined
        let pnlPct = undefined
        let rMultiple = undefined

        if (event.event_type === 'exited' || event.event_type === 'stopped_out' || event.event_type === 'target_hit') {
          const { data: posData } = await supabase
            .from('trading_positions')
            .select('unrealized_pnl, unrealized_pnl_pct, r_multiple_current')
            .eq('id', position.id)
            .single()
          
          if (posData) {
            pnl = posData.unrealized_pnl
            pnlPct = posData.unrealized_pnl_pct
            rMultiple = posData.r_multiple_current
          }
        }

        // Get image if this was an image upload event
        let imageUrl = undefined
        if (event.event_type === 'image_uploaded') {
          const { data: images } = await supabase
            .from('position_images')
            .select('public_url')
            .eq('position_id', position.id)
            .order('uploaded_at', { ascending: false })
            .limit(1)
          
          if (images && images.length > 0) {
            imageUrl = images[0].public_url
          }
        }

        return {
          id: event.id,
          type: mapEventType(event.event_type),
          timestamp: event.event_date,
          positionId: position.id,
          ticker: position.ticker,
          companyName: position.company_name,
          direction: position.direction,
          price: event.price,
          shares: event.shares,
          totalShares,
          note: event.note,
          imageUrl,
          pnl,
          pnlPct,
          rMultiple,
        }
      })
    )

    return NextResponse.json({ activities })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Map database event types to frontend types
function mapEventType(dbType: string): string {
  const mapping: Record<string, string> = {
    'entered': 'entry',
    'exited': 'exit',
    'added': 'add',
    'trimmed': 'trim',
    'stopped_out': 'stopped_out',
    'target_hit': 'target_hit',
    'thesis_updated': 'thesis_update',
    'note_added': 'note',
    'stop_moved': 'stop_moved',
    'target_adjusted': 'target_adjusted',
    'image_uploaded': 'image_upload',
  }

  return mapping[dbType] || dbType
}
