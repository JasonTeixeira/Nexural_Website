import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/cron/ssot-referral-awards
 *
 * SSOT Referrals/Points awarding job.
 * Source of truth: docs/REFERRALS_POINTS_SPEC.md
 *
 * v1:
 * - Award points ONLY after referred user verifies email.
 * - Ledger is immutable; points_balances is derived.
 *
 * NOTE: we don't currently have a dedicated "email_verified_at" table.
 * Supabase auth.users has email_confirmed_at (service role can read).
 */
export async function POST(request: Request) {
  const token = request.headers.get('x-cron-token')
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const svc = createServiceClient()

  // Find referral events that have not been awarded yet.
  // We use points_ledger existence as idempotency.
  const { data: refs, error: refErr } = await svc
    .from('referral_events')
    .select('id,referrer_user_id,referred_user_id,created_at')
    .order('created_at', { ascending: true })
    .limit(500)

  if (refErr) return NextResponse.json({ error: refErr.message }, { status: 500 })

  let awarded = 0

  for (const r of refs || []) {
    // Verify email confirmed
    const { data: authUser, error: authErr } = await svc
      .from('auth.users' as any)
      .select('id,email_confirmed_at')
      .eq('id', r.referred_user_id)
      .maybeSingle()

    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 500 })
    }

    if (!authUser?.email_confirmed_at) continue

    // Idempotency check
    const { data: existing } = await svc
      .from('points_ledger')
      .select('id')
      .eq('user_id', r.referrer_user_id)
      .eq('event_type', 'referral_signup_verified')
      .contains('metadata', { referred_user_id: r.referred_user_id })
      .maybeSingle()

    if (existing?.id) continue

    const { error: insErr } = await svc.from('points_ledger').insert({
      user_id: r.referrer_user_id,
      event_type: 'referral_signup_verified',
      points: 100,
      metadata: { referred_user_id: r.referred_user_id, referral_event_id: r.id },
    } as any)

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
    awarded++
  }

  return NextResponse.json({ ok: true, awarded })
}

