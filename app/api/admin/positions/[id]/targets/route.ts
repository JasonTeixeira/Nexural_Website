import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'

/**
 * POST /api/admin/positions/[id]/targets
 * Admin-only: emits target events into the SSOT event spine (`position_events`).
 *
 * This intentionally does NOT rely on legacy `position_targets`.
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
    const targets = Array.isArray(body?.targets) ? body.targets : null
    if (!targets) return NextResponse.json({ error: 'targets[] is required' }, { status: 400 })

    // Each target: { n: 1..4, price: number, allocation_pct?: number }
    const sanitized = targets
      .map((t: any) => ({
        n: Number(t?.n),
        price: Number(t?.price),
        allocation_pct:
          t?.allocation_pct === null || t?.allocation_pct === undefined
            ? null
            : Number(t?.allocation_pct),
      }))
      .filter((t: any) => Number.isFinite(t.n) && t.n >= 1 && t.n <= 4 && Number.isFinite(t.price) && t.price > 0)

    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'No valid targets provided' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const inserts = sanitized.map((t: any) => ({
      position_id: params.id,
      event_type: 'position.target_set',
      event_date: now,
      note: `Target ${t.n} set: $${t.price}${Number.isFinite(t.allocation_pct) ? ` (${t.allocation_pct}% alloc)` : ''}`,
      created_by: user.email || null,
      actor_id: user.id,
      // Use JSON payload for target metadata (SSOT-friendly, evolvable)
      diff_summary: JSON.stringify({ target: t }),
    }))

    const { data, error } = await supabase.from('position_events').insert(inserts).select('id')
    if (error) {
      console.error('Error writing target events:', error)
      return NextResponse.json({ error: 'Failed to write target events' }, { status: 500 })
    }

    return NextResponse.json({ success: true, inserted: data?.length || 0 })
  } catch (e) {
    console.error('POST /api/admin/positions/[id]/targets error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
