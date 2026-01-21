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

  const body = await req.json().catch(() => ({}))
  const productId = String(body.productId || '').trim()
  if (!productId) return NextResponse.json({ error: 'productId is required' }, { status: 400 })

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (!origin) return NextResponse.json({ error: 'Missing app origin' }, { status: 500 })

  const { data: product, error: pErr } = await supabase
    .from('marketplace_products')
    .select('id,seller_id,slug,title,description,price_cents,currency,status')
    .eq('id', productId)
    .maybeSingle()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  if (!product || product.status !== 'active') return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.price_cents <= 0) return NextResponse.json({ error: 'This product is not purchasable (price is 0)' }, { status: 400 })

  // Buyer cannot be seller
  const { data: seller, error: sErr } = await supabase
    .from('marketplace_sellers')
    .select('id,user_id,stripe_connect_account_id,stripe_connect_onboarded,status')
    .eq('id', product.seller_id)
    .maybeSingle()
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 })
  if (!seller || seller.status !== 'active') return NextResponse.json({ error: 'Seller unavailable' }, { status: 400 })
  if (seller.user_id === user.id) return NextResponse.json({ error: 'Cannot purchase your own product' }, { status: 400 })
  if (!seller.stripe_connect_onboarded || !seller.stripe_connect_account_id) {
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
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: seller.stripe_connect_account_id,
      },
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
}

