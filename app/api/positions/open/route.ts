import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/positions/open
 * Returns all open positions with filtering and sorting
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sector = searchParams.get('sector')
    const setupType = searchParams.get('setup_type')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sort_by') || 'entry_date'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    const supabase = createClient()

    let query = supabase
      .from('trading_positions')
      .select('*')
      .in('status', ['entered', 'scaling', 'trimming'])

    // Apply filters
    if (sector) {
      query = query.eq('sector', sector)
    }
    if (setupType) {
      query = query.eq('setup_type', setupType)
    }
    if (status) {
      query = query.eq('status', status)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    const { data: positions, error } = await query

    if (error) {
      console.error('Error fetching open positions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch positions' },
        { status: 500 }
      )
    }

    // Enrich with calculated fields
    const enrichedPositions = (positions || []).map((position) => ({
      ...position,
      daysHeld: position.entry_date
        ? Math.floor(
            (new Date().getTime() - new Date(position.entry_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
      distanceToStop: position.current_price && position.stop_loss
        ? ((position.current_price - position.stop_loss) / position.current_price) * 100
        : 0,
      distanceToTarget: position.current_price && position.target_1
        ? ((position.target_1 - position.current_price) / position.current_price) * 100
        : 0,
    }))

    return NextResponse.json({
      positions: enrichedPositions,
      count: enrichedPositions.length,
      filters: {
        sector,
        setupType,
        status,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Unexpected error in /api/positions/open:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
