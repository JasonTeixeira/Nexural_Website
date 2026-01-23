import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * SSOT: Onboarding gate requires follow-admin.
 * Source: docs/PERMISSIONS_PRIVACY.md + docs/FEED_ALERTS_SPEC.md
 *
 * This endpoint is the canonical way for the member portal UI to decide whether
 * the user is fully onboarded.
 */
export async function GET(_req: NextRequest) {
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
    // Misconfigured environment. Fail closed: require follow.
    return NextResponse.json(
      {
        ok: false,
        required: { follow_admin: true },
        state: { follows_admin: false, admin_alerts_enabled: false },
        reason: 'ADMIN_USER_ID is not configured',
      },
      { status: 200 }
    )
  }

  const { data: followRow } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', adminUserId)
    .maybeSingle()

  // Alerts requirement: SSOT says onboarding success includes receiving at least
  // one admin alert. We approximate this by requiring that admin alerts are
  // enabled in preferences (delivery verification can be covered by an e2e test).
  const { data: prefs } = await supabase
    .from('alert_preferences')
    .select('admin_position_opened,admin_position_closed')
    .eq('user_id', user.id)
    .maybeSingle()

  const followsAdmin = !!followRow
  const adminAlertsEnabled = !!(prefs?.admin_position_opened || prefs?.admin_position_closed)

  const ok = followsAdmin && adminAlertsEnabled

  return NextResponse.json(
    {
      ok,
      required: {
        follow_admin: true,
        enable_admin_alerts: true,
      },
      state: {
        follows_admin: followsAdmin,
        admin_alerts_enabled: adminAlertsEnabled,
      },
    },
    { status: 200 }
  )
}

