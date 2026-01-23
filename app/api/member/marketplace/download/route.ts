import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireSupabaseUser } from '@/lib/auth/server-helpers'

const BUCKET = 'marketplace'

/**
 * POST /api/member/marketplace/download
 * Returns a short-lived signed download URL for the latest product version,
 * if the member has an active entitlement.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response

  const body = await req.json().catch(() => ({}))
  const productId = String(body.productId || '').trim()
  if (!productId) return NextResponse.json({ error: 'productId is required' }, { status: 400 })

  // Check entitlement
  const { data: ent, error: eErr } = await supabase
    .from('marketplace_entitlements')
    .select('id,status')
    .eq('buyer_user_id', auth.user.id)
    .eq('product_id', productId)
    .maybeSingle()
  if (eErr) return NextResponse.json({ error: eErr.message }, { status: 500 })
  if (!ent || ent.status !== 'active') return NextResponse.json({ error: 'Not entitled' }, { status: 403 })

  // Get latest version
  const { data: v, error: vErr } = await supabase
    .from('marketplace_product_versions')
    .select('id,storage_path,version,created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 })
  if (!v?.storage_path) return NextResponse.json({ error: 'No downloadable version available' }, { status: 404 })

  // Signed URL using service role.
  const service = createServiceClient()
  const { data, error } = await service.storage.from(BUCKET).createSignedUrl(v.storage_path, 60)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    url: data?.signedUrl,
    version: { id: v.id, version: v.version, created_at: v.created_at },
  })
}

