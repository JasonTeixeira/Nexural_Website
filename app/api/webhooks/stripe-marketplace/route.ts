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
  // Support both legacy and current env var names.
  // - STRIPE_MARKETPLACE_WEBHOOK_SECRET: used by this route historically
  // - STRIPE_WEBHOOK_SECRET: used elsewhere in the codebase/docs
  const endpointSecret = process.env.STRIPE_MARKETPLACE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
  if (!endpointSecret) {
    return NextResponse.json(
      { error: 'Missing STRIPE_MARKETPLACE_WEBHOOK_SECRET (or STRIPE_WEBHOOK_SECRET)' },
      { status: 500 }
    )
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
  // NOTE: Some environments use the older marketplace schema where the audit
  // log table is not present (e.g. remote DB drift). We treat the audit log as
  // best-effort but keep the webhook handler functional.
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

  if (process.env.NODE_ENV !== 'production') {
    // Lightweight debug breadcrumbs for local verification.
    // (Do not log the full payload or secrets.)
    console.log('[stripe-marketplace] event', {
      id: event.id,
      type: event.type,
    })
  }

  // If duplicate, proceed to handle anyway but avoid double writes using unique constraints.
  // If missing table, proceed (remote DB drift); idempotency must then be enforced by
  // downstream unique constraints (e.g. stripe_checkout_session_id).
  if (
    logErr &&
    !String(logErr.message || '').toLowerCase().includes('duplicate') &&
    !String(logErr.message || '').toLowerCase().includes('could not find the table')
  ) {
    return NextResponse.json({ error: logErr.message }, { status: 500 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await handleMarketplaceCheckoutCompleted(service, event.data.object)
    }

    // Mark processed (best-effort; table may be absent in some DBs)
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
  // SSOT note: Stripe CLI `trigger checkout.session.completed` uses empty metadata.
  // We therefore do not treat missing metadata as an error.
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
  // kept for SSOT parity / future migration (not used by remote schema)
  const sellerNetCents = Number(
    session?.metadata?.marketplace_seller_net_cents ?? Math.max(0, amountCents - platformFeeCents)
  )
  // kept for SSOT parity / future migration (not used by remote schema)
  const platformFeeBps = Number(session?.metadata?.marketplace_platform_fee_bps ?? 2000)

  // Create (or update) the order.
  // NOTE: Remote schema differs from SSOT migration:
  // - Remote uses buyer_id/subtotal_cents/total_cents
  // - SSOT uses buyer_user_id/amount_cents/seller_net_cents/platform_fee_bps
  const { data: order, error: oErr } = await service
    .from('marketplace_orders')
    .upsert(
      {
        buyer_id: buyerUserId,
        currency,
        subtotal_cents: amountCents,
        platform_fee_cents: platformFeeCents,
        total_cents: amountCents,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        status: 'paid',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_checkout_session_id' }
    )
    .select('id')
    .single()

  if (oErr) throw new Error(oErr.message)

  // Create an order item (remote schema requirement) then issue a license tied to that item.
  // Create (or get existing) order item idempotently.
  // IMPORTANT: remote schema may not enforce uniqueness here, so we do best-effort
  // by checking first before inserting.
  let orderItemId: string | null = null
  try {
    const { data: existingItems, error: exErr } = await service
      .from('marketplace_order_items')
      .select('id')
      .eq('order_id', order.id)
      .eq('product_id', productId)
      .limit(1)

    if (exErr) throw exErr
    if (existingItems?.length) orderItemId = existingItems[0].id
  } catch (e: any) {
    const msg = String(e?.message || '').toLowerCase()
    const isMissingTable = msg.includes('could not find the table')
    if (!isMissingTable) throw new Error(e?.message || 'Failed to query marketplace_order_items')
  }

  if (!orderItemId) {
    try {
      const { data: createdItem, error: oiErr } = await service
        .from('marketplace_order_items')
        .insert({
          order_id: order.id,
          product_id: productId,
          seller_id: sellerId,
          unit_price_cents: amountCents,
          quantity: 1,
        })
        .select('id')
        .single()
      if (oiErr) throw oiErr
      orderItemId = createdItem?.id ?? null
    } catch (e: any) {
      const msg = String(e?.message || '').toLowerCase()
      const isMissingTable = msg.includes('could not find the table')
      if (!isMissingTable) throw new Error(e?.message || 'Failed to insert marketplace_order_items')
    }
  }

  // Grant license/entitlement.
  // Remote DB drift: some environments use marketplace_licenses, SSOT migration uses marketplace_entitlements.
  // We'll try licenses first, then fallback to entitlements.
  const issuedAt = new Date().toISOString()
  const { error: licErr } = await service.from('marketplace_licenses').insert({
    buyer_id: buyerUserId,
    product_id: productId,
    // Remote table requires an order item id (NOT NULL)
    order_item_id: orderItemId,
    status: 'active',
    issued_at: issuedAt,
  })

  // SSOT canonical entitlement: if the SSOT table exists, also upsert an entitlement.
  // This allows us to standardize downloads/access checks on marketplace_entitlements
  // without breaking legacy production schemas.
  try {
    await service
      .from('marketplace_entitlements')
      .upsert(
        {
          buyer_user_id: buyerUserId,
          product_id: productId,
          // best-effort: some schemas may not have this column
          granted_order_id: order.id,
          status: 'active',
        },
        { onConflict: 'buyer_user_id,product_id' }
      )
  } catch (e: any) {
    // ignore if missing table/column; entitlements are a SSOT enhancement
    const msg = String(e?.message || '').toLowerCase()
    const isMissingTable = msg.includes('could not find the table')
    const isMissingColumn = msg.includes('column') && msg.includes('does not exist')
    if (!isMissingTable && !isMissingColumn) throw e
  }

  if (licErr) {
    const msg = String(licErr.message || '').toLowerCase()
    const isDuplicate = msg.includes('duplicate')
    const isMissingTable = msg.includes('could not find the table')
    if (!isDuplicate && isMissingTable) {
      const { error: entErr } = await service.from('marketplace_entitlements').insert({
        buyer_user_id: buyerUserId,
        product_id: productId,
        status: 'active',
        issued_at: issuedAt,
      })
      if (entErr && !String(entErr.message || '').toLowerCase().includes('duplicate')) throw new Error(entErr.message)
    } else if (!isDuplicate) {
      throw new Error(licErr.message)
    }
  }
}
