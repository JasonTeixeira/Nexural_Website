import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceMemberEntitlement } from '@/lib/entitlements-api'

export const dynamic = 'force-dynamic'

/**
 * GET /api/member/discovery
 *
 * Discovery API (v1).
 * Source of truth: docs/LEADERBOARD_DISCOVERY_SPEC.md
 *
 * Ranking (v1):
 * 1) leaderboard return_pct (timeframe)
 * 2) recency proxy (computed_at)
 * 3) profile completeness (already part of eligibility)
 */
export async function GET(req: NextRequest) {
  const entitlementResp = await enforceMemberEntitlement()
  if (entitlementResp) return entitlementResp

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const tf = Number(url.searchParams.get('timeframe') || '30')
  const timeframe = tf === 60 ? 60 : tf === 90 ? 90 : 30
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || '50'), 1), 200)

  // Future: market/style filters require storing market tags per user/portfolio.
  // For v1, we support optional `tag` filter against user_profiles.strategy_tags if present.
  const tag = url.searchParams.get('tag')

  const { data: rows, error } = await supabase
    .from('leaderboard_rollups')
    .select('user_id,timeframe_days,return_pct,win_rate,closed_positions,computed_at')
    .eq('timeframe_days', timeframe)
    .eq('eligible', true)
    .order('return_pct', { ascending: false })
    .order('computed_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = (rows || []).map((r: any) => r.user_id)
  let profiles: any[] = []
  if (userIds.length) {
    const pr = await supabase
      .from('user_profiles')
      .select('user_id,username,display_name,avatar_url,bio,follower_count,total_positions,strategy_tags,portfolio_visibility_mode')
      .in('user_id', userIds)

    profiles = pr.data || []
  }

  const profileById = new Map(profiles.map((p: any) => [p.user_id, p]))
  let items = (rows || []).map((r: any, idx: number) => {
    const p = profileById.get(r.user_id) || {}
    return {
      rank: idx + 1,
      user_id: r.user_id,
      username: p.username || null,
      display_name: p.display_name || null,
      avatar_url: p.avatar_url || null,
      bio: p.bio || null,
      follower_count: p.follower_count || 0,
      total_positions: p.total_positions || 0,
      strategy_tags: p.strategy_tags || [],
      portfolio_visibility_mode: p.portfolio_visibility_mode || 'public',
      timeframe_days: r.timeframe_days,
      return_pct: Number(r.return_pct || 0),
      win_rate: Number(r.win_rate || 0),
      closed_positions: Number(r.closed_positions || 0),
      computed_at: r.computed_at,
    }
  })

  // SSOT: users in private global mode are not discoverable.
  items = items.filter((it: any) => it.portfolio_visibility_mode !== 'private')

  if (tag) {
    items = items.filter((it: any) => Array.isArray(it.strategy_tags) && it.strategy_tags.includes(tag))
  }

  // Re-rank after filters
  items = items.map((it: any, idx: number) => ({ ...it, rank: idx + 1 }))

  return NextResponse.json({ timeframe_days: timeframe, items })
}
