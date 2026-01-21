import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * POST /api/webhooks/stripe-marketplace
 * Marketplace checkout webhook handler.
 *
 * SSOT: Orders and entitlements are granted from webhooks and must be idempotent.
 */
export async function POST(req: NextRequest) {
  const endpointSecret = process.env.STRIPE_MARKETPLACE_WEBHOOK_SECRET
  if (!endpointSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_MARKETPLACE_WEBHOOK_SECRET' }, { status: 500 })
  }

  const body = await req.text()
  const signature = headers().get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 })
  }

  const service = createServiceClient()

  // Record the webhook event idempotently.
  const { error: logErr } = await service
    .from('marketplace_webhook_events')
    .insert({
      provider: 'stripe',
      event_id: event.id,
      event_type: event.type,
      payload: event,
      processed: false,
    })
    .select('id')
    .maybeSingle()

  // If duplicate, proceed to handle anyway but avoid double writes using unique constraints.
  if (logErr && !String(logErr.message || '').toLowerCase().includes('duplicate')) {
    return NextResponse.json({ error: logErr.message }, { status: 500 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await handleMarketplaceCheckoutCompleted(service, event.data.object)
    }

    // Mark processed
    await service
      .from('marketplace_webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('provider', 'stripe')
      .eq('event_id', event.id)

    return NextResponse.json({ received: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleMarketplaceCheckoutCompleted(service: any, session: any) {
  // This endpoint is for marketplace checkouts only.
  const productId = session?.metadata?.marketplace_product_id
  const sellerId = session?.metadata?.marketplace_seller_id
  const buyerUserId = session?.metadata?.marketplace_buyer_user_id

  if (!productId || !sellerId || !buyerUserId) return

  // Expand payment intent to access fee metadata.
  let paymentIntentId: string | null = null
  if (typeof session.payment_intent === 'string') paymentIntentId = session.payment_intent

  const amountCents = Number(session.amount_total ?? session.amount_subtotal ?? 0)
  const currency = String(session.currency || 'usd').toUpperCase()

  // Best-effort metadata. (We set it on payment_intent_data.metadata)
  const platformFeeCents = Number(session?.metadata?.marketplace_platform_fee_cents ?? 0)
  const sellerNetCents = Number(session?.metadata?.marketplace_seller_net_cents ?? Math.max(0, amountCents - platformFeeCents))
  const platformFeeBps = Number(session?.metadata?.marketplace_platform_fee_bps ?? 2000)

  // Upsert order (idempotent on stripe_checkout_session_id)
  const { data: order, error: oErr } = await service
    .from('marketplace_orders')
    .upsert(
      {
        buyer_user_id: buyerUserId,
        product_id: productId,
        amount_cents: amountCents,
        currency,
        platform_fee_bps: platformFeeBps,
        platform_fee_cents: platformFeeCents,
        seller_net_cents: sellerNetCents,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        status: 'paid',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_checkout_session_id' }
    )
    .select('*')
    .single()

  if (oErr) throw new Error(oErr.message)

  // Grant entitlement idempotently (unique on buyer_user_id + product_id)
  const { error: eErr } = await service
    .from('marketplace_entitlements')
    .upsert(
      {
        buyer_user_id: buyerUserId,
        product_id: productId,
        granted_order_id: order.id,
        granted_at: new Date().toISOString(),
        status: 'active',
      },
      { onConflict: 'buyer_user_id,product_id' }
    )

  if (eErr) throw new Error(eErr.message)
}

