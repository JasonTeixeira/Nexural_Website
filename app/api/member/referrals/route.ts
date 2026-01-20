import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceMemberEntitlement } from '@/lib/entitlements-api'
import { enforceReferralConsumeRateLimit } from '@/lib/api-rate-limit'

function randomCode(len = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

async function getOrCreateReferralCode(userId: string) {
  // NOTE: formerly used service role. We now rely on RLS (or fallback to “generate new”).
  const supabase = await createClient()

  const { data: existing, error: existingErr } = await supabase
    .from('referral_codes')
    .select('user_id,code,created_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (existingErr) throw existingErr
  if (existing) return existing

  // Try a few random codes. Unique constraint will enforce uniqueness.
  for (let i = 0; i < 10; i++) {
    const code = randomCode(8)
    const { data: inserted, error } = await supabase
      .from('referral_codes')
      .insert({ user_id: userId, code })
      .select('user_id,code,created_at')
      .single()
    if (!error && inserted) return inserted
  }

  throw new Error('Failed to generate unique referral code')
}

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const entitlementResp = await enforceMemberEntitlement()
  if (entitlementResp) return entitlementResp

  const code = await getOrCreateReferralCode(user.id)

  const { data: balance } = await supabase
    .from('points_balances')
    .select('balance,updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: ledger } = await supabase
    .from('points_ledger')
    .select('id,event_type,points,metadata,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const { count: referralsCount } = await supabase
    .from('referral_events')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_user_id', user.id)

  return NextResponse.json({
    referralCode: code.code,
    referralLink: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ''}/r/${code.code}`,
    balance: balance?.balance ?? 0,
    referralsCount: referralsCount ?? 0,
    ledger: ledger ?? [],
  })
}

export async function POST(req: NextRequest) {
  // Link a referral cookie/code to the newly signed up user.
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Anti-fraud: throttle referral consumption attempts (SSOT minimum)
  const rateLimited = await enforceReferralConsumeRateLimit(req, user.id)
  if (rateLimited) return rateLimited as any

  // NOTE: referral attribution must work for newly signed-up users as well.
  // We intentionally DO NOT enforce paid entitlement here.

  const body = await req.json().catch(() => ({}))
  // Prefer explicit referralCode, but fall back to server-readable cookie.
  // Note: HttpOnly cookies are readable here.
  const referralCode = (
    (body?.referralCode || '').toString().trim() ||
    (req.cookies.get('nexural_ref')?.value || '').toString().trim()
  )

  if (!referralCode) return NextResponse.json({ ok: true })

  const { data: refRow } = await supabase
    .from('referral_codes')
    .select('user_id')
    .eq('code', referralCode)
    .maybeSingle()

  if (!refRow?.user_id) return NextResponse.json({ ok: true })
  if (refRow.user_id === user.id) return NextResponse.json({ ok: true })

  // Create referral event (idempotent via unique(referred_user_id))
  const { error: referralErr } = await supabase.from('referral_events').insert({
    referrer_user_id: refRow.user_id,
    referred_user_id: user.id,
    source: 'web',
  })

  // If already exists, ignore
  if (referralErr && !/duplicate key|unique/i.test(referralErr.message)) {
    return NextResponse.json({ error: referralErr.message }, { status: 500 })
  }

  // SSOT: do not award points until referred user verifies email.
  // We only record the referral event here; awarding is handled by an auth/webhook trigger later.
  const res = NextResponse.json({ ok: true })
  res.cookies.set('nexural_ref', '', { path: '/', maxAge: 0 })
  return res
}
