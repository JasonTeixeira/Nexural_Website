import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceMemberEntitlement } from '@/lib/entitlements-api'

export const dynamic = 'force-dynamic'

/**
 * GET /api/member/leaderboard?timeframe=30|60|90
 *
 * SSOT Leaderboard read model.
 * Source of truth: docs/LEADERBOARD_DISCOVERY_SPEC.md
 */
export async function GET(req: NextRequest) {
  const entitlementResp = await enforceMemberEntitlement()
  if (entitlementResp) return entitlementResp

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const tf = Number(url.searchParams.get('timeframe') || '30')
  const timeframe = tf === 60 ? 60 : tf === 90 ? 90 : 30
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || '100'), 1), 200)

  // Rollups are readable by authenticated users; we additionally enforce eligibility.
  const { data: rows, error } = await supabase
    .from('leaderboard_rollups')
    .select('user_id,timeframe_days,return_pct,total_pnl,total_capital_at_risk,win_rate,closed_positions,eligible,computed_at')
    .eq('timeframe_days', timeframe)
    .eq('eligible', true)
    .order('return_pct', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = (rows || []).map((r: any) => r.user_id)
  const { data: profiles } = userIds.length
    ? await supabase
        .from('user_profiles')
        .select('user_id,username,display_name,avatar_url,bio,follower_count,total_positions')
        .in('user_id', userIds)
    : ({ data: [] } as any)

  const profileById = new Map((profiles || []).map((p: any) => [p.user_id, p]))
  const items = (rows || []).map((r: any, idx: number) => {
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
      timeframe_days: r.timeframe_days,
      return_pct: Number(r.return_pct || 0),
      total_pnl: Number(r.total_pnl || 0),
      total_capital_at_risk: Number(r.total_capital_at_risk || 0),
      win_rate: Number(r.win_rate || 0),
      closed_positions: Number(r.closed_positions || 0),
      computed_at: r.computed_at,
    }
  })

  return NextResponse.json({ timeframe_days: timeframe, items })
}

