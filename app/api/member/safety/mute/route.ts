import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST { user_id: string } -> mute
// DELETE ?user_id=...      -> unmute

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const mutedUserId = String(body.user_id || '')
  if (!mutedUserId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  if (mutedUserId === user.id) return NextResponse.json({ error: 'cannot mute self' }, { status: 400 })

  const { error } = await supabase.from('user_mutes').insert({
    muter_user_id: user.id,
    muted_user_id: mutedUserId,
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
  const mutedUserId = url.searchParams.get('user_id')
  if (!mutedUserId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })

  const { error } = await supabase
    .from('user_mutes')
    .delete()
    .eq('muter_user_id', user.id)
    .eq('muted_user_id', mutedUserId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 200 })
}

