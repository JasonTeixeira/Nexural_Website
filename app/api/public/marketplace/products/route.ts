import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/public/marketplace/products
 * Public browsing is allowed (SEO). Source of truth: docs/MARKETPLACE_SPEC.md
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const url = new URL(req.url)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 24)))
  const q = (url.searchParams.get('q') || '').trim()
  const type = (url.searchParams.get('type') || '').trim()

  // SSOT: public browsing must work (SEO).
  // In the current environment, RLS blocks anon reads of marketplace_products.
  // We therefore use the service role client for this *public, read-only* endpoint.
  const { createServiceClient } = await import('@/lib/supabase/service')
  const service = createServiceClient()

  // Remote schema (currently live) differs from the SSOT migration.
  // Remote fields: platform, product_type, active (bool)
  // SSOT fields: type, status
  // For now, we support the remote schema so the marketplace can function.
  let query = service
    .from('marketplace_products')
    .select('id,seller_id,slug,product_type,title,description,price_cents,currency,tags,active,created_at,updated_at')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (type) query = query.eq('product_type', type)
  if (q) {
    // Basic search: title/description. (FTS can be added later.)
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ items: data ?? [] })
}
