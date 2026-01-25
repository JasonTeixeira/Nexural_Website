import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'

type PartialCloseLeg = {
  leg_order: number
  contracts_closed: number
  exit_premium?: number | null
}

/**
 * POST /api/admin/positions/[id]/partial-close
 * Admin-only: records a partial close event (per-leg) and updates remaining quantity.
 *
 * Canonical tables:
 * - trading_positions: current state (quantity)
 * - position_events: immutable audit history
 * - option_legs: leg metadata (optional)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const legs: PartialCloseLeg[] = Array.isArray(body?.legs) ? body.legs : []
    const reason = typeof body?.reason === 'string' ? body.reason : null

    if (!legs.length) {
      return NextResponse.json({ error: 'legs[] is required' }, { status: 400 })
    }

    const sanitized = legs
      .map((l: any) => ({
        leg_order: Number(l?.leg_order),
        contracts_closed: Number(l?.contracts_closed),
        exit_premium:
          l?.exit_premium === null || l?.exit_premium === undefined
            ? null
            : Number(l.exit_premium),
      }))
      .filter(
        (l: any) =>
          Number.isFinite(l.leg_order) &&
          l.leg_order >= 1 &&
          l.leg_order <= 4 &&
          Number.isFinite(l.contracts_closed) &&
          l.contracts_closed > 0 &&
          (l.exit_premium === null || Number.isFinite(l.exit_premium))
      )

    if (!sanitized.length) {
      return NextResponse.json({ error: 'No valid legs provided' }, { status: 400 })
    }

    // Load current position
    const { data: pos, error: posErr } = await supabase
      .from('trading_positions')
      .select('id, quantity, position_type, status')
      .eq('id', params.id)
      .single()
    if (posErr || !pos) return NextResponse.json({ error: 'Position not found' }, { status: 404 })

    const currentQty = Number(pos.quantity ?? 0)
    const totalClosed = sanitized.reduce((sum, l) => sum + l.contracts_closed, 0)

    if (!Number.isFinite(currentQty) || currentQty <= 0) {
      return NextResponse.json({ error: 'Position quantity is not set/invalid' }, { status: 400 })
    }
    if (totalClosed >= currentQty) {
      return NextResponse.json(
        { error: `Partial close exceeds remaining quantity (remaining=${currentQty}, requested=${totalClosed})` },
        { status: 400 }
      )
    }

    const newQty = currentQty - totalClosed

    // Update remaining quantity
    const { error: updErr } = await supabase
      .from('trading_positions')
      .update({ quantity: newQty, updated_at: new Date().toISOString() } as any)
      .eq('id', params.id)
    if (updErr) {
      console.error('Error updating trading_positions.quantity:', updErr)
      return NextResponse.json({ error: 'Failed to update remaining quantity' }, { status: 500 })
    }

    // Write event (immutable)
    const eventPayload = {
      partial_close: {
        prev_quantity: currentQty,
        new_quantity: newQty,
        total_closed: totalClosed,
        legs: sanitized,
      },
      reason,
    }

    const { error: evErr } = await supabase.from('position_events').insert({
      position_id: params.id,
      event_type: 'position.partial_closed',
      event_data: eventPayload,
      notes: reason ? `Partial close: ${reason}` : 'Partial close',
      created_by: user.id,
    } as any)

    if (evErr) {
      console.error('Error writing partial close event:', evErr)
      return NextResponse.json({ error: 'Partial close applied but failed to record event' }, { status: 500 })
    }

    return NextResponse.json({ success: true, previous_quantity: currentQty, new_quantity: newQty })
  } catch (e) {
    console.error('POST /api/admin/positions/[id]/partial-close error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
