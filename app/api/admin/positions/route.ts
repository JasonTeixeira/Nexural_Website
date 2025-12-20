import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'
import { verifyAdminToken } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/positions
 * Create a new position (admin only)
 */
export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createClient()

    // Insert position
    const { data: position, error } = await supabase
      .from('trading_positions')
      .insert({
        ticker: body.ticker,
        company_name: body.company_name,
        asset_type: body.asset_type || 'stock',
        direction: body.direction,
        status: body.status || 'entered',
        entry_date: body.entry_date || new Date().toISOString(),
        entry_price: body.entry_price,
        current_avg_price: body.current_avg_price || body.entry_price,
        current_price: body.current_price || body.entry_price,
        shares_contracts: body.shares_contracts,
        stop_loss: body.stop_loss,
        target_1: body.target_1,
        target_2: body.target_2 || null,
        target_3: body.target_3 || null,
        sector: body.sector,
        setup_type: body.setup_type,
        conviction_level: body.conviction_level,
        thesis: body.thesis,
        entry_chart_url: body.entry_chart_url || null,
        tags: body.tags || [],
        portfolio_weight_pct: body.portfolio_weight_pct || 0,
        created_by: admin.email,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating position:', error)
      return NextResponse.json(
        { error: 'Failed to create position', details: error.message },
        { status: 500 }
      )
    }

    // Create initial entry event
    if (position) {
      await supabase.from('position_events').insert({
        position_id: position.id,
        event_type: 'entered',
        event_date: body.entry_date || new Date().toISOString(),
        price_at_event: body.entry_price,
        shares_changed: body.shares_contracts,
        new_total_shares: body.shares_contracts,
        note: `Initial entry: ${body.thesis.substring(0, 100)}...`,
        created_by: admin.email,
      })
    }

    return NextResponse.json({ position }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/positions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/positions
 * Get all positions including closed (admin only)
 */
export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()

    const { data: positions, error } = await supabase
      .from('trading_positions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching positions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch positions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ positions: positions || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/positions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
