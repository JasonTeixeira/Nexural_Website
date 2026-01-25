import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminSession, extractToken } from '@/lib/server-session-service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/deletion-gates?days=14
 *
 * Returns deletion-gate hit counts per tag over the last N days.
 * This is the authoritative "traffic=0" measurement.
 */
export async function GET(req: NextRequest) {
  // Support both header-based auth (API clients) and cookie-based auth (admin UI).
  const authHeader = req.headers.get('authorization')
  const bearer = extractToken(authHeader)
  const cookieToken = req.cookies.get('admin_token')?.value
  const token = bearer || cookieToken || null
  const auth = await requireAdminSession(token)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase service role not configured' }, { status: 500 })
  }

  const days = Math.min(Math.max(Number(new URL(req.url).searchParams.get('days') || 14), 1), 60)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Pull recent hits and aggregate in code (portable; avoids SQL RPC dependency).
  const { data, error } = await supabase
    .from('deletion_gate_hits')
    .select('tag,created_at')
    .gte('created_at', since)
    .limit(5000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const counts: Record<string, number> = {}
  for (const row of data || []) {
    counts[row.tag] = (counts[row.tag] || 0) + 1
  }

  const tags = Object.keys(counts).sort()

  return NextResponse.json({ ok: true, days, since, tags, counts })
}
