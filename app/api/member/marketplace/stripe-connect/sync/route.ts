import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSupabaseUser } from '@/lib/auth/server-helpers'
import { stripe } from '@/lib/stripe'

/**
 * POST /api/member/marketplace/stripe-connect/sync
 * After returning from Stripe onboarding, call this to sync
 * account status and set `stripe_connect_onboarded` if complete.
 */
export async function POST(_req: NextRequest) {
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response
  const user = auth.user

  const { data: seller, error } = await supabase
    .from('marketplace_sellers')
    .select('id,stripe_connect_account_id,stripe_connect_onboarded')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!seller?.stripe_connect_account_id) return NextResponse.json({ onboarded: false, reason: 'no_account' })

  const acct = await stripe.accounts.retrieve(seller.stripe_connect_account_id)
  const onboarded = Boolean(acct.details_submitted && acct.charges_enabled)

  if (onboarded && !seller.stripe_connect_onboarded) {
    const { error: upErr } = await supabase
      .from('marketplace_sellers')
      .update({ stripe_connect_onboarded: true, updated_at: new Date().toISOString() })
      .eq('id', seller.id)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  return NextResponse.json({
    onboarded,
    charges_enabled: (acct as any).charges_enabled,
    details_submitted: (acct as any).details_submitted,
  })
}

