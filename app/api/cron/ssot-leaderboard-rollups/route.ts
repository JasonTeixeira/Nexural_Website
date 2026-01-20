import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/cron/ssot-leaderboard-rollups
 *
 * SSOT Leaderboard rollups dispatcher.
 * Source of truth: docs/LEADERBOARD_DISCOVERY_SPEC.md
 *
 * v1 strategy:
 * - Positions-derived P&L (realized only for now; unrealized approximations require snapshots)
 * - Capital-at-risk proxy = abs(entry_price * quantity)
 * - Timeframes: 30/60/90 days
 *
 * NOTE: This is Phase 3 scaffolding; we will harden calculations and eligibility next.
 */
export async function POST(request: Request) {
  const token = request.headers.get('x-cron-token')
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const svc = createServiceClient()
  const timeframes = [30, 60, 90] as const
  const now = new Date()

  // Candidate users: anyone with a profile (later: eligibility rules from spec)
  const { data: users, error: usersErr } = await svc
    .from('user_profiles')
    .select('user_id,bio,strategy_tags')
    .eq('is_profile_public', true)

  if (usersErr) return NextResponse.json({ error: usersErr.message }, { status: 500 })

  let upserts = 0
  for (const tf of timeframes) {
    const windowStart = new Date(now.getTime() - tf * 24 * 60 * 60 * 1000)
    for (const u of users || []) {
      // Eligibility signals
      const profileComplete = !!(u.bio && String(u.bio).trim().length > 0)

      const { data: portfolios } = await svc
        .from('portfolios')
        .select('id,visibility')
        .eq('user_id', u.user_id)
        .eq('visibility', 'public')
        .limit(1)

      const hasPublicPortfolio = (portfolios || []).length > 0

      // Snapshot availability check for open-position inclusion.
      // If missing, we mark rollup as approximate per SSOT.
      const { data: snapshots } = await svc
        .from('portfolio_snapshots')
        .select('id')
        .eq('user_id', u.user_id)
        .gte('snapshot_at', windowStart.toISOString().slice(0, 10))
        .limit(1)

      const approximate = (snapshots || []).length === 0

      // Positions in timeframe (v1: realized only for positions closed within window)
      const { data: positions } = await svc
        .from('positions')
        .select('id,user_id,opened_at,closed_at,entry_price,exit_price,quantity,direction,fees_total,is_backfilled,imported_at')
        .eq('user_id', u.user_id)
        .not('closed_at', 'is', null)
        .gte('closed_at', windowStart.toISOString())

      // Backfill aging rule (SSOT): exclude backfilled/imported positions until aged 14 days
      const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      const closed = (positions || []).filter((p: any) => {
        if (p.is_backfilled !== true) return true
        const importedAt = p.imported_at ? new Date(p.imported_at) : null
        if (!importedAt) return false
        return importedAt <= cutoff
      })
      let totalPnl = 0
      let totalRisk = 0
      let wins = 0

      for (const p of closed) {
        const entry = Number(p.entry_price || 0)
        const exit = Number(p.exit_price || 0)
        const qty = Number(p.quantity || 0)
        if (!entry || !exit || !qty) continue

        const dir = String(p.direction || 'long')
        const diff = dir === 'short' ? entry - exit : exit - entry
        const pnl = diff * qty - Number(p.fees_total || 0)
        totalPnl += pnl
        totalRisk += Math.abs(entry * qty)
        if (pnl > 0) wins++
      }

      const returnPct = totalRisk > 0 ? (totalPnl / totalRisk) * 100 : 0
      const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0

      const eligible = hasPublicPortfolio && profileComplete

      const { error: upErr } = await svc.from('leaderboard_rollups').upsert({
        user_id: u.user_id,
        timeframe_days: tf,
        computed_at: new Date().toISOString(),
        total_pnl: totalPnl,
        total_capital_at_risk: totalRisk,
        return_pct: returnPct,
        closed_positions: closed.length,
        winning_positions: wins,
        win_rate: winRate,
        has_public_portfolio: hasPublicPortfolio,
        profile_complete: profileComplete,
        eligible,
        approximate,
      } as any)

      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
      upserts++
    }
  }

  return NextResponse.json({ ok: true, upserts })
}
