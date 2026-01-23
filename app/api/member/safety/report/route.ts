import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST { reported_user_id?: string, reason: string, details?: string }

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const reason = String(body.reason || '')
  const details = body.details != null ? String(body.details) : null
  const reportedUserId = body.reported_user_id != null ? String(body.reported_user_id) : null

  if (!reason) return NextResponse.json({ error: 'reason is required' }, { status: 400 })
  if (reportedUserId && reportedUserId === user.id) {
    return NextResponse.json({ error: 'cannot report self' }, { status: 400 })
  }

  const { error } = await supabase.from('user_reports').insert({
    reporter_user_id: user.id,
    reported_user_id: reportedUserId,
    reason,
    details,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 200 })
}

