import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'

/**
 * POST /api/admin/positions/[id]/stop
 * Admin-only: updates stop loss on `trading_positions` and emits SSOT stop events into `position_events`.
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
    const stop_loss = Number(body?.stop_loss)
    const reason = typeof body?.reason === 'string' ? body.reason : null

    if (!Number.isFinite(stop_loss) || stop_loss <= 0) {
      return NextResponse.json({ error: 'stop_loss must be a positive number' }, { status: 400 })
    }

    // Fetch current stop (to decide stop_set vs stop_moved)
    const { data: prev, error: prevErr } = await supabase
      .from('trading_positions')
      .select('id, stop_loss')
      .eq('id', params.id)
      .single()

    if (prevErr || !prev) return NextResponse.json({ error: 'Position not found' }, { status: 404 })

    const prevStop = prev.stop_loss === null || prev.stop_loss === undefined ? null : Number(prev.stop_loss)
    const eventType = prevStop === null ? 'position.stop_set' : 'position.stop_moved'

    // Update canonical current stop
    const { error: updErr } = await supabase
      .from('trading_positions')
      .update({ stop_loss, updated_at: new Date().toISOString() } as any)
      .eq('id', params.id)

    if (updErr) {
      console.error('Error updating stop loss:', updErr)
      return NextResponse.json({ error: 'Failed to update stop loss' }, { status: 500 })
    }

    // Emit immutable event
    const payload = {
      stop: {
        prev: prevStop,
        next: stop_loss,
      },
      reason,
    }

    const { error: evErr } = await supabase.from('position_events').insert({
      position_id: params.id,
      event_type: eventType,
      event_date: new Date().toISOString(),
      note: reason ? `Stop updated: ${reason}` : 'Stop updated',
      created_by: user.email || null,
      actor_id: user.id,
      diff_summary: JSON.stringify(payload),
    } as any)

    if (evErr) {
      console.error('Error writing stop event:', evErr)
      return NextResponse.json({ error: 'Stop updated but failed to record event' }, { status: 500 })
    }

    return NextResponse.json({ success: true, event_type: eventType })
  } catch (e) {
    console.error('POST /api/admin/positions/[id]/stop error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
