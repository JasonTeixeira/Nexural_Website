import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Member Marketplace Reports
 *
 * POST /api/member/marketplace/reports { product_id?, reason, details? }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const productId = body.product_id != null ? String(body.product_id) : null
  const reason = String(body.reason || '')
  const details = body.details != null ? String(body.details) : null

  if (!reason) return NextResponse.json({ error: 'reason is required' }, { status: 400 })

  const { error } = await supabase.from('marketplace_reports').insert({
    product_id: productId,
    reporter_user_id: user.id,
    reason,
    details,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 200 })
}

