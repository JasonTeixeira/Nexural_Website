import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSupabaseUser } from '@/lib/auth/server-helpers'
import { stripe } from '@/lib/stripe'
import { computeMarketplaceFees, MARKETPLACE_PLATFORM_FEE_BPS } from '@/lib/marketplace/fees'

/**
 * POST /api/member/marketplace/checkout
 * Creates a Stripe Checkout Session for a marketplace product.
 *
 * SSOT: Orders are confirmed via Stripe webhooks.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response
  const user = auth.user

  // Ensure we always return JSON on unexpected exceptions.
  try {

  const body = await req.json().catch(() => ({}))
  const productId = String(body.productId || '').trim()
  if (!productId) return NextResponse.json({ error: 'productId is required' }, { status: 400 })

  // In route-handlers invoked server-to-server (tests/CLI), `origin` may be absent.
  // Fall back to localhost in dev.
  const origin =
    req.headers.get('origin') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://127.0.0.1:3036'

  // NOTE: RLS blocks reading marketplace_products for regular members in the
  // current remote DB config. Use service client to load product/seller data,
  // but keep the buyer auth from `requireSupabaseUser()`.
  const { createServiceClient } = await import('@/lib/supabase/service')
  const service = createServiceClient()

  const { data: product, error: pErr } = await service
    .from('marketplace_products')
    // Remote schema: product_type, active
    .select('id,seller_id,slug,title,description,price_cents,currency,active')
    .eq('id', productId)
    .maybeSingle()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  if (!product || product.active !== true) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.price_cents <= 0) return NextResponse.json({ error: 'This product is not purchasable (price is 0)' }, { status: 400 })

  // Buyer cannot be seller
  const { data: seller, error: sErr } = await service
    .from('marketplace_sellers')
    // Remote schema: stripe_account_id, onboarding_status
    .select('id,user_id,stripe_account_id,onboarding_status')
    .eq('id', product.seller_id)
    .maybeSingle()
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 })
  if (!seller) return NextResponse.json({ error: 'Seller unavailable' }, { status: 400 })
  if (seller.user_id === user.id) return NextResponse.json({ error: 'Cannot purchase your own product' }, { status: 400 })
  // Connect is not enabled on this Stripe account yet (can’t create/transfer to destination accounts).
  // Until Connect is enabled, we treat `stripe_account_id` as optional and run a standard checkout.
  const sellerStripeAccountId = seller.stripe_account_id || null
  if (sellerStripeAccountId && seller.onboarding_status !== 'complete') {
    return NextResponse.json({ error: 'Seller is not eligible for payouts yet' }, { status: 400 })
  }

  const amountCents = Number(product.price_cents)
  const { platformFeeCents, sellerNetCents } = computeMarketplaceFees(amountCents, MARKETPLACE_PLATFORM_FEE_BPS)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${origin}/marketplace/${product.slug}?checkout=success`,
    cancel_url: `${origin}/marketplace/${product.slug}?checkout=cancel`,
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: amountCents,
          product_data: {
            name: product.title,
            description: product.description?.slice(0, 500) || undefined,
          },
        },
      },
    ],
    payment_intent_data: {
      // Only attempt Connect transfers if we have a real connect account id.
      ...(sellerStripeAccountId && sellerStripeAccountId.startsWith('acct_') && !sellerStripeAccountId.includes('acct_test_')
        ? {
            application_fee_amount: platformFeeCents,
            transfer_data: {
              destination: sellerStripeAccountId,
            },
          }
        : {}),
      metadata: {
        marketplace_product_id: product.id,
        marketplace_seller_id: seller.id,
        marketplace_buyer_user_id: user.id,
        marketplace_amount_cents: String(amountCents),
        marketplace_platform_fee_cents: String(platformFeeCents),
        marketplace_seller_net_cents: String(sellerNetCents),
        marketplace_platform_fee_bps: String(MARKETPLACE_PLATFORM_FEE_BPS),
      },
    },
    metadata: {
      marketplace_product_id: product.id,
      marketplace_seller_id: seller.id,
      marketplace_buyer_user_id: user.id,
    },
  })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Checkout failed' }, { status: 500 })
  }
}
