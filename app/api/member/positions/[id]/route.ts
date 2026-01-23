import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { requireSupabaseUser } from '@/lib/auth/server-helpers'
import { enforceMemberEntitlement } from '@/lib/entitlements-api'
import { createClient } from '@/lib/supabase/server'
import { MemberPositionsLedgerRepository } from '@/lib/trading-ledger/repository-member-positions'

const ECONOMIC_FIELDS = new Set([
  'direction',
  'stop_loss',
  'target',
  'current_price',
  'entry_price',
  'quantity',
  'exit_price',
  'status',
  'closed_at',
])

const NON_ECONOMIC_FIELDS = new Set(['notes'])

/**
 * PATCH /api/member/positions/[id]
 * Amend a member position (private-by-default).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireSupabaseUser()
    if (auth.response) return auth.response

    const entitlementResp = await enforceMemberEntitlement()
    if (entitlementResp) return entitlementResp

    const supabase = await createClient()
    const body = await request.json()

    // Ensure the position belongs to the caller (privacy-by-default)
    const { data: prev, error: prevErr } = await supabase
      .from('positions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', auth.user.id)
      .single()

    if (prevErr || !prev) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    // Only allow safe fields in v1
    const allowed: Record<string, any> = {}
    for (const k of [
      'direction',
      'stop_loss',
      'target',
      'notes',
      'current_price',
      'entry_price',
      'quantity',
      'exit_price',
      'status',
      'closed_at',
    ]) {
      if (k in body) allowed[k] = body[k]
    }

    const { data, error } = await supabase
      .from('positions')
      .update({ ...allowed, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('user_id', auth.user.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating member position:', error)
      return NextResponse.json({ error: 'Failed to update position' }, { status: 500 })
    }

    // SSOT event spine: emit position.amended on member edits
    const changedKeys = Object.keys(allowed || {}).filter((k) => prev[k] !== allowed[k])
    const isEconomic = changedKeys.some((k) => ECONOMIC_FIELDS.has(k))
    const isNonEconomicOnly = changedKeys.length > 0 && changedKeys.every((k) => NON_ECONOMIC_FIELDS.has(k))
    const amendmentClass = isEconomic ? 'economic' : isNonEconomicOnly ? 'non_economic' : 'non_economic'

    if (changedKeys.length > 0) {
      await supabase.from('position_events').insert({
        position_id: params.id,
        event_type: 'position.amended',
        event_date: new Date().toISOString(),
        note: `Amended (${amendmentClass}): ${changedKeys.join(', ')}`,
        amendment_class: amendmentClass,
        diff_summary: JSON.stringify({ changed: changedKeys }),
        created_by: auth.user.email || null,
        actor_id: auth.user.id,
      } as any)

      // If status moved to closed via PATCH, also emit position.closed
      if (String(allowed?.status || '') === 'closed' && String(prev?.status || '') !== 'closed') {
        await supabase.from('position_events').insert({
          position_id: params.id,
          event_type: 'position.closed',
          event_date: new Date().toISOString(),
          note: 'Closed (member)',
          created_by: auth.user.email || null,
          actor_id: auth.user.id,
        } as any)
      }
    }

    const repo = new MemberPositionsLedgerRepository()
    const { position } = await repo.getPositionById(data.id)
    return NextResponse.json({ position })
  } catch (e) {
    console.error('PATCH /api/member/positions/[id] error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
