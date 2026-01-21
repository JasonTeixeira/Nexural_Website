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

  let query = supabase
    .from('marketplace_products')
    .select('id,seller_id,slug,type,title,description,price_cents,currency,tags,status,created_at,updated_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (type) query = query.eq('type', type)
  if (q) {
    // Basic search: title/description. (FTS can be added later.)
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ items: data ?? [] })
}

