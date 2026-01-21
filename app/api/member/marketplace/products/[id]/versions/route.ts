import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireSupabaseUser } from '@/lib/auth/server-helpers'

const BUCKET = 'marketplace'

async function requireSellerAndProduct(supabase: any, userId: string, productId: string) {
  const { data: seller, error: sErr } = await supabase
    .from('marketplace_sellers')
    .select('id,status,terms_accepted_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (sErr) throw new Error(sErr.message)
  if (!seller) return { seller: null, product: null }
  if (!seller.terms_accepted_at) throw new Error('Marketplace terms must be accepted first')
  if (seller.status !== 'active') throw new Error('Seller is not active')

  const { data: product, error: pErr } = await supabase
    .from('marketplace_products')
    .select('*')
    .eq('id', productId)
    .eq('seller_id', seller.id)
    .maybeSingle()
  if (pErr) throw new Error(pErr.message)
  return { seller, product }
}

/**
 * GET/POST /api/member/marketplace/products/[id]/versions
 * Versions are append-only.
 */

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response

  const { seller, product } = await requireSellerAndProduct(supabase, auth.user.id, id)
  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 400 })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('marketplace_product_versions')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response

  const { seller, product } = await requireSellerAndProduct(supabase, auth.user.id, id)
  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 400 })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.status !== 'active') return NextResponse.json({ error: 'Cannot add versions to removed product' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const version = String(body.version || '').trim()
  const changelog = body.changelog != null ? String(body.changelog).trim() : null
  const fileName = String(body.fileName || '').trim()
  const contentType = String(body.contentType || 'application/octet-stream').trim() || 'application/octet-stream'

  if (!version) return NextResponse.json({ error: 'version is required' }, { status: 400 })
  if (!fileName) return NextResponse.json({ error: 'fileName is required' }, { status: 400 })

  // Create a unique storage path for this version.
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '_')
  const nonce = crypto.randomBytes(8).toString('hex')
  const storagePath = `seller/${seller.id}/product/${id}/version/${encodeURIComponent(version)}/${nonce}-${safeName}`

  // Create a signed upload URL via service role client.
  const service = createServiceClient()
  const { data: signed, error: signErr } = await service.storage.from(BUCKET).createSignedUploadUrl(storagePath)
  if (signErr) return NextResponse.json({ error: signErr.message }, { status: 500 })

  // Record version row now (append-only). The client uploads using signed.token, then we can later validate.
  const { data: row, error: insErr } = await supabase
    .from('marketplace_product_versions')
    .insert({
      product_id: id,
      version,
      changelog,
      storage_path: storagePath,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  return NextResponse.json({
    version: row,
    upload: {
      bucket: BUCKET,
      path: storagePath,
      token: signed?.token,
      signedUrl: signed?.signedUrl,
      contentType,
    },
  })
}

