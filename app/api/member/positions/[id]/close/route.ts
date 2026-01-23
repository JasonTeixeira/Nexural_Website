import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { requireSupabaseUser } from '@/lib/auth/server-helpers'
import { enforceMemberEntitlement } from '@/lib/entitlements-api'
import { createClient } from '@/lib/supabase/server'
import { MemberPositionsLedgerRepository } from '@/lib/trading-ledger/repository-member-positions'

/**
 * POST /api/member/positions/[id]/close
 * Close a member position (private-by-default).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireSupabaseUser()
    if (auth.response) return auth.response

    const entitlementResp = await enforceMemberEntitlement()
    if (entitlementResp) return entitlementResp

    const supabase = await createClient()
    const body = await request.json().catch(() => ({}))

    // Verify ownership
    const { data: prev, error: prevErr } = await supabase
      .from('positions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', auth.user.id)
      .single()

    if (prevErr || !prev) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    const closedAt = new Date().toISOString()
    const exitPrice = body.exit_price != null ? Number(body.exit_price) : null

    const { data, error } = await supabase
      .from('positions')
      .update({
        status: 'closed',
        closed_at: closedAt,
        exit_price: Number.isFinite(exitPrice as any) ? exitPrice : prev.exit_price ?? null,
        updated_at: closedAt,
      })
      .eq('id', params.id)
      .eq('user_id', auth.user.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error closing member position:', error)
      return NextResponse.json({ error: 'Failed to close position' }, { status: 500 })
    }

    // SSOT event spine: emit position.closed for member closes
    await supabase.from('position_events').insert({
      position_id: params.id,
      event_type: 'position.closed',
      event_date: closedAt,
      price_at_event: Number.isFinite(exitPrice as any) ? exitPrice : null,
      note: 'Closed (member)',
      created_by: auth.user.email || null,
      actor_id: auth.user.id,
    } as any)

    const repo = new MemberPositionsLedgerRepository()
    const { position } = await repo.getPositionById(data.id)
    return NextResponse.json({ position })
  } catch (e) {
    console.error('POST /api/member/positions/[id]/close error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
