import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * SSOT onboarding helper: attempt to complete onboarding by:
 *  - ensuring follow-admin exists
 *  - ensuring admin alerts are enabled
 */
export async function POST(_req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminUserId = process.env.ADMIN_USER_ID
  if (!adminUserId) {
    return NextResponse.json({ error: 'ADMIN_USER_ID is not configured' }, { status: 500 })
  }

  // 1) Ensure follow-admin
  const { error: followErr } = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: adminUserId,
    created_at: new Date().toISOString(),
  })

  // Ignore unique violations / already-following; treat other errors as warnings.
  if (followErr && !String(followErr.message || '').toLowerCase().includes('duplicate')) {
    console.warn('onboarding.complete follow insert error:', followErr)
  }

  // 2) Ensure admin alerts enabled (idempotent upsert)
  const { error: prefErr } = await supabase.from('alert_preferences').upsert({
    user_id: user.id,
    admin_position_opened: true,
    admin_position_closed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (prefErr) {
    return NextResponse.json({ error: prefErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

