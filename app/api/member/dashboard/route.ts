import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceMemberEntitlement } from '@/lib/entitlements-api'

export const dynamic = 'force-dynamic'

/**
 * GET /api/member/dashboard
 *
 * SSOT stance:
 * - The dashboard must not depend on legacy `signals`/`swing_positions` models.
 * - “Signals” are represented by canonical positions + event spine (`position_events`).
 */
export async function GET(req: NextRequest) {
  const entitlementResp = await enforceMemberEntitlement()
  if (entitlementResp) return entitlementResp

  const supabase = await createClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Load member row (app uses `members` table as app-profile/subscription state)
  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select('id,email,name,subscription_status,subscription_tier,created_at,last_login')
    .eq('email', user.email)
    .maybeSingle()

  if (memberErr || !member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Minimal SSOT-aligned dashboard stats:
  // - recent SSOT feed items
  // - counts of open positions (member ledger)
  // - (optional) admin position count (trading_positions) for quick UX hints
  const url = new URL(req.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('feedLimit') || 10), 1), 50)

  // Recent events from canonical event spine
  const { data: events, error: evErr } = await supabase
    .from('position_events')
    .select('id,position_id,event_type,event_date,actor_id')
    .order('event_date', { ascending: false })
    .limit(limit)

  if (evErr) {
    return NextResponse.json({ error: evErr.message }, { status: 500 })
  }

  // Member position counts
  const [{ count: openPositions }, { count: totalPositions }] = await Promise.all([
    supabase.from('positions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'open'),
    supabase.from('positions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  // Hydrate symbols for recent events (best-effort; tolerate schema drift)
  const positionIds = Array.from(new Set((events || []).map((e: any) => e.position_id).filter(Boolean)))
  const [adminPosRes, memberPosRes] = await Promise.all([
    positionIds.length
      ? supabase
          .from('trading_positions')
          .select('id,ticker,direction,status,entry_date')
          .in('id', positionIds)
      : Promise.resolve({ data: [] } as any),
    positionIds.length
      ? supabase
          .from('positions')
          .select('id,symbol,direction,status,opened_at,user_id')
          .in('id', positionIds)
      : Promise.resolve({ data: [] } as any),
  ])

  const adminById = new Map((adminPosRes.data || []).map((p: any) => [p.id, p]))
  const memberById = new Map((memberPosRes.data || []).map((p: any) => [p.id, p]))

  const recentActivity = (events || []).map((e: any) => {
    const adminPos: any = adminById.get(e.position_id) || null
    const memberPos: any = memberById.get(e.position_id) || null
    return {
      id: e.id,
      occurred_at: e.event_date,
      event_type: e.event_type,
      symbol: adminPos?.ticker || memberPos?.symbol || null,
      owner_type: adminPos ? 'admin' : memberPos ? 'member' : 'unknown',
      position_id: e.position_id,
    }
  })

  return NextResponse.json(
    {
      user: {
        id: member.id,
        email: member.email,
        name: member.name,
        subscriptionStatus: member.subscription_status,
        subscriptionTier: member.subscription_tier,
      },
      stats: {
        positionsOpen: openPositions || 0,
        positionsTotal: totalPositions || 0,
      },
      recentActivity,
    },
    { status: 200 }
  )
}
