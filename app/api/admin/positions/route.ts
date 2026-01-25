import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'
import { requireAdmin, requireRole } from '@/lib/admin-rbac'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/positions
 * Create a new position (admin only)
 */
export async function POST(request: Request) {
  try {
    // Verify admin authentication (RBAC cookie-based)
    const req = request as unknown as NextRequest
    const admin = await requireAdmin(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!requireRole(admin, ['owner'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const supabase = createClient()

    // Insert position (DB-aligned schema)
    // NOTE: trading_positions constraints enforce:
    // - direction: LONG | SHORT
    // - status: active | closed
    const symbol = String(body.symbol || body.ticker || '').toUpperCase()
    const direction = String(body.direction || '').toUpperCase()
    const status = String(body.status || 'active').toLowerCase()
    const entry_price = Number(body.entry_price)
    const current_price = Number(body.current_price ?? body.entry_price)
    const stop_loss = Number(body.stop_loss)
    const quantity = body.quantity === null || body.quantity === undefined ? null : Number(body.quantity)
    const position_size = Number(body.position_size ?? 1)
    const position_type = body.position_type ? String(body.position_type) : null
    const entry_date = body.entry_date ? new Date(body.entry_date).toISOString() : new Date().toISOString()
    const targets = Array.isArray(body.targets)
      ? body.targets.map((t: any) => Number(t)).filter((n: any) => Number.isFinite(n))
      : []

    if (!symbol) return NextResponse.json({ error: 'symbol is required' }, { status: 400 })
    if (!['LONG', 'SHORT'].includes(direction)) {
      return NextResponse.json({ error: 'direction must be LONG or SHORT' }, { status: 400 })
    }
    if (!['active', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'status must be active or closed' }, { status: 400 })
    }
    if (!Number.isFinite(entry_price) || entry_price <= 0) {
      return NextResponse.json({ error: 'entry_price must be a positive number' }, { status: 400 })
    }
    if (!Number.isFinite(current_price) || current_price <= 0) {
      return NextResponse.json({ error: 'current_price must be a positive number' }, { status: 400 })
    }
    if (!Number.isFinite(stop_loss) || stop_loss <= 0) {
      return NextResponse.json({ error: 'stop_loss must be a positive number' }, { status: 400 })
    }
    if (!Number.isFinite(position_size) || position_size <= 0) {
      return NextResponse.json({ error: 'position_size must be a positive number' }, { status: 400 })
    }
    if (targets.length === 0) {
      return NextResponse.json({ error: 'targets must be a non-empty array of numbers' }, { status: 400 })
    }

    const { data: position, error } = await supabase
      .from('trading_positions')
      .insert({
        symbol,
        direction,
        entry_price,
        current_price,
        stop_loss,
        targets,
        position_size,
        status,
        entry_date,
        exit_date: status === 'closed' ? new Date().toISOString() : null,
        notes: body.notes ? String(body.notes) : null,
        quantity,
        position_type,
        is_public: body.is_public ?? true,
        allow_comments: body.allow_comments ?? true,
      } as any)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating position:', error)
      return NextResponse.json(
        { error: 'Failed to create position', details: error.message },
        { status: 500 }
      )
    }

    // Create initial entry event (DB-aligned)
    if (position) {
      await supabase.from('position_events').insert({
        position_id: position.id,
        event_type: 'position.opened',
        event_data: {
          entry_price,
          quantity,
          direction,
          stop_loss,
          targets,
        },
        notes: 'Opened (admin)',
        created_by: admin.adminUserId,
      } as any)
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
    // Verify admin authentication (RBAC cookie-based)
    const req = request as unknown as NextRequest
    const admin = await requireAdmin(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
