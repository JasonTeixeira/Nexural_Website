import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceMemberEntitlement } from '@/lib/entitlements-api'
import { CacheKeys, CacheService, CacheTTL } from '@/lib/cache-service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/member/ssot-feed
 *
 * SSOT-compliant member feed derived from the canonical event spine.
 *
 * Tier-1 feed items (docs/FEED_ALERTS_SPEC.md):
 * - admin position opened
 * - admin position closed
 * - followed member position opened (if public)
 * - followed member position closed (if public)
 *
 * Notes:
 * - Cursor pagination uses `event_date`.
 * - For Phase 1, we tolerate schema drift by fetching events first, then hydrating positions.
 */
export async function GET(req: NextRequest) {
  const entitlementResp = await enforceMemberEntitlement()
  if (entitlementResp) return entitlementResp

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const limitRaw = Number(url.searchParams.get('limit') || 50)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50
  const cursor = url.searchParams.get('cursor')
  const since = url.searchParams.get('since') // ISO timestamp
  const markSeen = url.searchParams.get('markSeen') === '1'

  // Cache only the common case: initial feed page (no cursor/since) and no markSeen.
  // Personalized per-user because following + safety filters are user-specific.
  const cacheable = !cursor && !since && !markSeen
  const cacheKey = `${CacheKeys.activityFeed(user.id)}:limit:${limit}`
  if (cacheable) {
    const cached = await CacheService.get<any>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'X-Cache-Key': cacheKey },
      })
    }
  }

  // Best-effort safety filters
  // SSOT safety rule: a blocked user cannot interact with the blocker, and their
  // content should not appear to the blocker.
  // Additionally handle reverse-block (if they blocked viewer).
  const [blocksByMeRes, blocksAgainstMeRes, mutesByMeRes] = await Promise.all([
    supabase.from('user_blocks').select('blocked_user_id').eq('blocker_user_id', user.id),
    supabase.from('user_blocks').select('blocker_user_id').eq('blocked_user_id', user.id),
    supabase.from('user_mutes').select('muted_user_id').eq('muter_user_id', user.id),
  ])

  const blockedIds = new Set([
    ...(blocksByMeRes.data || []).map((r: any) => r.blocked_user_id),
    ...(blocksAgainstMeRes.data || []).map((r: any) => r.blocker_user_id),
  ].filter(Boolean))

  const mutedIds = new Set((mutesByMeRes.data || []).map((r: any) => r.muted_user_id).filter(Boolean))

  // Following ids
  const followsRes = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
  const followingIds = (followsRes.data || []).map((r: any) => r.following_id).filter(Boolean)

  // Events: only Tier-1 event types for feed
  let q = supabase
    .from('position_events')
    .select('id,position_id,event_type,event_date,created_by,actor_id,amendment_class')
    .in('event_type', ['position.opened', 'position.closed', 'position.stop_hit', 'position.target_hit'])
    .order('event_date', { ascending: false })
    .limit(limit)

  if (cursor) {
    q = q.lt('event_date', cursor)
  }

  if (since) {
    // "Since last visit" feed mode (docs/FEED_ALERTS_SPEC.md)
    q = q.gt('event_date', since)
  }

  const { data: events, error: evErr } = await q
  if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 })

  const baseEvents = (events || []).filter(
    (e: any) => !blockedIds.has(e.actor_id) && !mutedIds.has(e.actor_id)
  )

  // Hydrate positions from both tables (Phase 1: admin in trading_positions, member in positions).
  const positionIds = Array.from(new Set(baseEvents.map((e: any) => e.position_id).filter(Boolean)))

  const [adminPositionsRes, memberPositionsRes] = await Promise.all([
    positionIds.length
      ? supabase
          .from('trading_positions')
          .select('id,ticker,company_name,direction,status,asset_type,entry_date')
          .in('id', positionIds)
      : Promise.resolve({ data: [], error: null } as any),
    positionIds.length
      ? supabase
          .from('positions')
          .select('id,symbol,direction,status,opened_at,is_public,user_id')
          .in('id', positionIds)
      : Promise.resolve({ data: [], error: null } as any),
  ])

  // Load global privacy mode for any member position owners we might emit.
  const memberOwnerIds = Array.from(new Set((memberPositionsRes.data || []).map((p: any) => p.user_id).filter(Boolean)))
  const { data: memberOwners } = memberOwnerIds.length
    ? await supabase
        .from('user_profiles')
        .select('user_id,portfolio_visibility_mode')
        .in('user_id', memberOwnerIds)
    : ({ data: [] } as any)
  const memberModeById = new Map((memberOwners || []).map((p: any) => [p.user_id, p.portfolio_visibility_mode]))

  const adminById = new Map((adminPositionsRes.data || []).map((p: any) => [p.id, p]))
  const memberById = new Map((memberPositionsRes.data || []).map((p: any) => [p.id, p]))

  const items = baseEvents
    .map((e: any) => {
      const adminPos: any = adminById.get(e.position_id) || null
      const memberPos: any = memberById.get(e.position_id) || null
      const ownerType = adminPos ? 'admin' : memberPos ? 'member' : 'unknown'

      // Visibility rules (SSOT):
      // - Admin events visible to all members.
      // - Member events only if the member position is public.
      // - Additionally, for "following" experience we restrict member events to followed accounts.
      if (ownerType === 'member') {
        if (!memberPos || memberPos.is_public !== true) return null
        // SSOT: global mode overrides per-position public flag.
        if (memberPos.user_id && memberModeById.get(memberPos.user_id) === 'private') return null
        if (memberPos.user_id && !followingIds.includes(memberPos.user_id)) return null
      }

      return {
        id: e.id,
        type: 'position_event',
        event_type: e.event_type,
        occurred_at: e.event_date,
        position_id: e.position_id,
        owner_type: ownerType,
        position: adminPos
          ? {
              id: adminPos.id,
              symbol: adminPos.ticker,
              direction: adminPos.direction,
              status: adminPos.status,
              title: adminPos.company_name || adminPos.ticker,
              opened_at: adminPos.entry_date,
            }
          : memberPos
            ? {
                id: memberPos.id,
                symbol: memberPos.symbol,
                direction: memberPos.direction,
                status: memberPos.status,
                title: memberPos.symbol,
                opened_at: memberPos.opened_at,
              }
            : null,
      }
    })
    .filter(Boolean)

  const nextCursor = items.length > 0 ? (items[items.length - 1] as any).occurred_at : null

  // Optionally record last seen for "since last visit" experience.
  // This is best-effort; do not block feed reads.
  if (markSeen) {
    try {
      await supabase.from('feed_last_seen').upsert({
        user_id: user.id,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
    } catch {
      // ignore
    }
  }

  const payload = { items, nextCursor }

  if (cacheable) {
    await CacheService.set(cacheKey, payload, CacheTTL.VERY_SHORT)
  }

  return NextResponse.json(payload, {
    headers: cacheable
      ? { 'X-Cache': 'MISS', 'X-Cache-Key': cacheKey }
      : { 'X-Cache': 'BYPASS' },
  })
}
