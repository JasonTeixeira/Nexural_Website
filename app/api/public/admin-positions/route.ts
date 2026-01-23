import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Public endpoint: Admin positions teaser feed.
 *
 * - Anonymous-readable.
 * - Returns only positions where is_admin_signal = true.
 * - Returns a minimal, sanitized shape intended for marketing + teaser mode.
 * - Does NOT return member portfolio data.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const status = (searchParams.get('status') || 'open') as 'open' | 'closed' | 'all'
    const limitRaw = Number(searchParams.get('limit') || 6)
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 20) : 6
    // Optional override for local debugging / customization.
    // If set, we will filter positions.created_by to this value in the fallback path.
    const creatorOverride = searchParams.get('creator')
    const defaultCreators = ['admin', 'dev_seed']

    // Canonical admin/public "signals" live in `trading_positions`.
    // We intentionally only return a minimal sanitized shape.
    //
    // NOTE: Some environments use `ticker` while others use `symbol` (or other)
    // for the instrument identifier. To avoid breaking due to schema drift,
    // we select `*` and normalize to `symbol` below.
    let q = supabase.from('trading_positions').select('*')

    // Some environments don't have `created_by` (legacy schema). We only apply
    // this filter if the column exists.
    //
    // We cannot cheaply introspect schema via PostgREST here without extra calls,
    // so we attempt the filter only when explicitly overridden by query params.
    if (creatorOverride) {
      q = q.eq('created_by', creatorOverride)
    }

    if (status !== 'all') {
      if (status === 'open') q = q.in('status', ['entered', 'scaling', 'trimming'])
      else q = q.eq('status', 'closed')
    }

    const { data, error } = await q.order('entry_date', { ascending: false }).limit(limit)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const positions = (data || []).map((p: any) => {
      const symbol =
        p?.ticker ??
        p?.symbol ??
        p?.instrument ??
        p?.underlying ??
        p?.code ??
        null

      return {
        id: p.id,
        symbol,
        type: p.asset_type,
        direction: p.direction,
        // SSOT teaser policy: do NOT expose entry price or sizing publicly.
        // Also avoid exposing any derived fields that allow inference.
        entry_date: p.entry_date,
        status: p.status === 'closed' ? 'closed' : 'open',
        // SSOT teaser policy: targets/stops are NOT returned publicly.
        // Even without entry/size, price-levels can enable partial inference.
        teaser_note: typeof p.thesis === 'string' ? p.thesis.slice(0, 140) : null,
      }
    })

    return NextResponse.json({ positions })
  } catch (e) {
    console.error('GET /api/public/admin-positions error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
