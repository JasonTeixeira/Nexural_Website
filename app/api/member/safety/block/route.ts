import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST { user_id: string } -> block
// DELETE ?user_id=...      -> unblock

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const blockedUserId = String(body.user_id || '')
  if (!blockedUserId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  if (blockedUserId === user.id) return NextResponse.json({ error: 'cannot block self' }, { status: 400 })

  const { error } = await supabase.from('user_blocks').insert({
    blocker_user_id: user.id,
    blocked_user_id: blockedUserId,
    created_at: new Date().toISOString(),
  })

  // idempotent
  if (error && !String(error.message || '').toLowerCase().includes('duplicate')) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const blockedUserId = url.searchParams.get('user_id')
  if (!blockedUserId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })

  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_user_id', user.id)
    .eq('blocked_user_id', blockedUserId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 200 })
}

