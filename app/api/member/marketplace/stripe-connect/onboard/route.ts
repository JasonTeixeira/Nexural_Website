import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSupabaseUser } from '@/lib/auth/server-helpers'
import { stripe } from '@/lib/stripe'

/**
 * POST /api/member/marketplace/stripe-connect/onboard
 * Creates (or reuses) a Stripe Connect Express account for the seller,
 * and returns an onboarding link.
 *
 * SSOT: Seller onboarding must capture payout setup (Stripe Connect).
 * Source of truth: docs/MARKETPLACE_SPEC.md
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response
  const user = auth.user

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (!origin) return NextResponse.json({ error: 'Missing app origin' }, { status: 500 })

  // Ensure seller exists and accepted terms.
  const { data: seller, error: sellerErr } = await supabase
    .from('marketplace_sellers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (sellerErr) return NextResponse.json({ error: sellerErr.message }, { status: 500 })
  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 400 })
  if (!seller.terms_accepted_at) return NextResponse.json({ error: 'Marketplace terms must be accepted first' }, { status: 400 })
  if (seller.status !== 'active') return NextResponse.json({ error: 'Seller is not active' }, { status: 403 })

  let accountId: string | null = seller.stripe_connect_account_id || null

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email || undefined,
      capabilities: {
        transfers: { requested: true },
      },
      business_profile: {
        name: seller.display_name,
        support_email: seller.support_email || undefined,
      },
      metadata: {
        nexural_user_id: user.id,
      },
    })
    accountId = account.id

    const { error: upErr } = await supabase
      .from('marketplace_sellers')
      .update({ stripe_connect_account_id: accountId, updated_at: new Date().toISOString() })
      .eq('id', seller.id)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  const returnUrl = `${origin}/member-portal/marketplace/seller?connect=return`
  const refreshUrl = `${origin}/member-portal/marketplace/seller?connect=refresh`

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: link.url, accountId })
}

