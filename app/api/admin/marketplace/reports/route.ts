import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Minimal admin tooling (API) for marketplace reports.
 *
 * GET    /api/admin/marketplace/reports
 * PATCH  /api/admin/marketplace/reports { id, status }
 *
 * NOTE: This assumes admin APIs are called with a service role capable session
 * or an admin-auth wrapper upstream. We keep this minimal and rely on service_role RLS.
 */

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('marketplace_reports')
    .select('id,product_id,reporter_user_id,reason,details,status,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data || [] }, { status: 200 })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json().catch(() => ({}))
  const id = String(body.id || '')
  const status = String(body.status || '')

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  if (!['open', 'resolved', 'dismissed'].includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 })
  }

  const { error } = await supabase
    .from('marketplace_reports')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 200 })
}

