import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Member Marketplace Reviews
 *
 * GET  /api/member/marketplace/reviews?product_id=...
 * POST /api/member/marketplace/reviews { product_id, rating, body? }
 *
 * SSOT: only verified purchasers can review (enforced via marketplace_entitlements).
 */

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const productId = url.searchParams.get('product_id')
  if (!productId) return NextResponse.json({ error: 'product_id is required' }, { status: 400 })

  // Reviews are public readable by policy, but we keep member endpoint for consistency.
  const { data, error } = await supabase
    .from('marketplace_reviews')
    .select('id,product_id,buyer_user_id,rating,body,created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reviews: data || [] }, { status: 200 })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const productId = String(body.product_id || '')
  const rating = Number(body.rating)
  const reviewBody = body.body != null ? String(body.body) : null

  if (!productId) return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating must be 1-5' }, { status: 400 })
  }

  // Verified purchaser gate
  const { data: entitlement } = await supabase
    .from('marketplace_entitlements')
    .select('id,status')
    .eq('buyer_user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (!entitlement || entitlement.status !== 'active') {
    return NextResponse.json({ error: 'Only verified purchasers can review' }, { status: 403 })
  }

  const { error } = await supabase.from('marketplace_reviews').upsert({
    product_id: productId,
    buyer_user_id: user.id,
    rating,
    body: reviewBody,
    created_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 200 })
}

