import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSupabaseUser } from '@/lib/auth/server-helpers'
import { slugify } from '@/lib/marketplace/slug'

/**
 * GET/POST /api/member/marketplace/products
 * Seller product management.
 * Source of truth: docs/MARKETPLACE_SPEC.md
 */

export async function GET() {
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response
  const user = auth.user

  // Resolve seller
  const { data: seller, error: sErr } = await supabase
    .from('marketplace_sellers')
    .select('id,status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 })
  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 400 })
  if (seller.status !== 'active') return NextResponse.json({ error: 'Seller is not active' }, { status: 403 })

  const { data, error } = await supabase
    .from('marketplace_products')
    .select('*')
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response
  const user = auth.user

  const body = await req.json().catch(() => ({}))
  const type = String(body.type || '').trim()
  const title = String(body.title || '').trim()
  const description = String(body.description || '').trim()
  const priceCents = Number(body.price_cents ?? body.priceCents ?? NaN)
  const currency = String(body.currency || 'USD').trim() || 'USD'
  const tags = Array.isArray(body.tags) ? body.tags.map((t: any) => String(t).trim()).filter(Boolean) : []

  if (!type) return NextResponse.json({ error: 'type is required' }, { status: 400 })
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
  if (!description) return NextResponse.json({ error: 'description is required' }, { status: 400 })
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    return NextResponse.json({ error: 'price_cents must be >= 0' }, { status: 400 })
  }

  const { data: seller, error: sErr } = await supabase
    .from('marketplace_sellers')
    .select('id,status,stripe_connect_onboarded,terms_accepted_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 })
  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 400 })
  if (!seller.terms_accepted_at) return NextResponse.json({ error: 'Marketplace terms must be accepted first' }, { status: 400 })
  if (seller.status !== 'active') return NextResponse.json({ error: 'Seller is not active' }, { status: 403 })

  // SSOT: payout setup required for sellers (Stripe Connect).
  // We require onboarding before creating paid products.
  if (priceCents > 0 && seller.stripe_connect_onboarded !== true) {
    return NextResponse.json({ error: 'Stripe payout onboarding must be completed before listing paid products' }, { status: 400 })
  }

  const baseSlug = slugify(title)
  if (!baseSlug) return NextResponse.json({ error: 'Unable to generate slug from title' }, { status: 400 })

  // Ensure uniqueness by suffixing.
  let slug = baseSlug
  for (let i = 0; i < 10; i++) {
    const { data: existing } = await supabase
      .from('marketplace_products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!existing?.id) break
    slug = `${baseSlug}-${i + 2}`
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('marketplace_products')
    .insert({
      seller_id: seller.id,
      slug,
      type,
      title,
      description,
      price_cents: Math.round(priceCents),
      currency,
      tags,
      status: 'active',
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}

