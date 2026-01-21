import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSupabaseUser } from '@/lib/auth/server-helpers'
import { slugify } from '@/lib/marketplace/slug'

async function getSellerIdForUser(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('marketplace_sellers')
    .select('id,status,stripe_connect_onboarded,terms_accepted_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

/**
 * PATCH/DELETE /api/member/marketplace/products/[id]
 * Ownership is enforced by seller_id.
 */

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response
  const user = auth.user

  const seller = await getSellerIdForUser(supabase, user.id)
  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 400 })
  if (!seller.terms_accepted_at) return NextResponse.json({ error: 'Marketplace terms must be accepted first' }, { status: 400 })
  if (seller.status !== 'active') return NextResponse.json({ error: 'Seller is not active' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const patch: any = {}

  if (body.type != null) patch.type = String(body.type).trim()
  if (body.title != null) patch.title = String(body.title).trim()
  if (body.description != null) patch.description = String(body.description).trim()
  if (body.currency != null) patch.currency = String(body.currency).trim() || 'USD'
  if (body.tags != null) {
    patch.tags = Array.isArray(body.tags) ? body.tags.map((t: any) => String(t).trim()).filter(Boolean) : []
  }
  if (body.status != null) patch.status = String(body.status).trim()

  if (body.price_cents != null || body.priceCents != null) {
    const priceCents = Number(body.price_cents ?? body.priceCents)
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      return NextResponse.json({ error: 'price_cents must be >= 0' }, { status: 400 })
    }
    // Require Stripe onboarding before transitioning to paid.
    if (priceCents > 0 && seller.stripe_connect_onboarded !== true) {
      return NextResponse.json({ error: 'Stripe payout onboarding must be completed before listing paid products' }, { status: 400 })
    }
    patch.price_cents = Math.round(priceCents)
  }

  if (patch.title) {
    const baseSlug = slugify(patch.title)
    if (!baseSlug) return NextResponse.json({ error: 'Unable to generate slug from title' }, { status: 400 })
    // try unique
    let slug = baseSlug
    for (let i = 0; i < 10; i++) {
      const { data: existing, error: exErr } = await supabase
        .from('marketplace_products')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 })
      if (!existing?.id || existing.id === id) break
      slug = `${baseSlug}-${i + 2}`
    }
    patch.slug = slug
  }

  patch.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('marketplace_products')
    .update(patch)
    .eq('id', id)
    .eq('seller_id', seller.id)
    .select('*')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response
  const user = auth.user

  const seller = await getSellerIdForUser(supabase, user.id)
  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 400 })
  if (seller.status !== 'active') return NextResponse.json({ error: 'Seller is not active' }, { status: 403 })

  // Soft-remove (keeps referential integrity for orders/reviews)
  const { data, error } = await supabase
    .from('marketplace_products')
    .update({ status: 'removed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('seller_id', seller.id)
    .select('*')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product: data })
}

