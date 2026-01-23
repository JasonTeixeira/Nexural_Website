import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { activityWriter } from '@/lib/activity-writer'
// NOTE: ADMIN_USER_ID is optional; if missing, admin-event fanout is skipped.

export const dynamic = 'force-dynamic'

/**
 * POST /api/cron/ssot-alerts
 *
 * SSOT Alerts dispatcher.
 * Source of truth: docs/FEED_ALERTS_SPEC.md
 *
 * Design (Phase 2, minimal):
 * - Poll recent `position_events` and fan-out in-app notifications.
 * - Idempotent via `dedupe_key` stored in notification metadata.
 * - Later: move to webhook/queue based pipeline.
 */
export async function POST(request: Request) {
  // Basic shared-secret gate for cron endpoints
  const token = request.headers.get('x-cron-token')
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const svc = createServiceClient()
  const adminUserId = process.env.ADMIN_USER_ID || null
  const sinceMinutes = Number(new URL(request.url).searchParams.get('sinceMinutes') || '60')
  const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString()

  const { data: events, error: evErr } = await svc
    .from('position_events')
    .select('id,position_id,event_type,event_date,actor_id,amendment_class')
    .in('event_type', ['position.opened', 'position.closed', 'position.stop_hit', 'position.target_hit', 'position.amended'])
    .gte('event_date', since)
    .order('event_date', { ascending: true })

  if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 })

  let sent = 0
  for (const ev of events || []) {
    // Only alert for amendments if economic and opted-in (default OFF).
    if (ev.event_type === 'position.amended' && ev.amendment_class !== 'economic') continue

    const dedupeKey = `ssot_event:${ev.id}`

    // Determine if this is an admin position.
    const { data: adminPos } = await svc
      .from('trading_positions')
      .select('id,ticker,company_name,created_by')
      .eq('id', ev.position_id)
      .maybeSingle()

    const isAdmin = !!adminPos?.id

    // Followers of the actor (member events) OR followers of admin
    let followingId: string | null = null
    if (isAdmin) {
      // SSOT: admin follow is mandatory; we use ADMIN_USER_ID as the canonical anchor.
      followingId = adminUserId
    } else {
      // Member position: actor_id should be the owner.
      followingId = ev.actor_id || null
    }

    // Fetch followers
    const followersRes = followingId
      ? await svc.from('follows').select('follower_id').eq('following_id', followingId)
      : { data: [] as any[] }

    const followerIds = Array.from(new Set((followersRes.data || []).map((r: any) => r.follower_id))).filter(Boolean)
    if (!isAdmin && followerIds.length === 0) continue

    // Admin alerts: default ON via alert_preferences (row may not exist; treat as true).
    let recipients: string[] = followerIds

    // Admin alerts: filter recipients by alert_preferences (default ON if row missing).
    if (isAdmin) {
      if (!adminUserId) {
        recipients = []
      } else {
        const { data: prefs } = await svc
          .from('alert_preferences')
          .select('user_id,admin_trade_alerts_enabled')
          .in('user_id', followerIds)

        const enabled = new Set(
          (prefs || [])
            .filter((p: any) => p.admin_trade_alerts_enabled !== false)
            .map((p: any) => p.user_id)
        )

        // If a user has no row in alert_preferences, treat as enabled.
        const hasRow = new Set((prefs || []).map((p: any) => p.user_id))
        recipients = followerIds.filter((id) => enabled.has(id) || !hasRow.has(id))
      }
    }

    const title =
      ev.event_type === 'position.opened'
        ? 'Position opened'
        : ev.event_type === 'position.closed'
          ? 'Position closed'
          : ev.event_type === 'position.stop_hit'
            ? 'Stop hit'
            : ev.event_type === 'position.target_hit'
              ? 'Target hit'
              : 'Position amended'

    const notifType =
      ev.event_type === 'position.opened'
        ? 'position_opened'
        : ev.event_type === 'position.closed'
          ? 'position_closed'
          : ev.event_type === 'position.stop_hit'
            ? 'position_stop_hit'
            : ev.event_type === 'position.target_hit'
              ? 'position_target_hit'
              : 'position_closed'

    // Member alerts: OFF by default (SSOT). Only notify followers who opted in.
    if (!isAdmin && followerIds.length > 0) {
      const { data: settings } = await svc
        .from('follow_notification_settings')
        .select('user_id,position_opened,position_closed,position_stop_hit,position_target_hit')
        .in('user_id', followerIds)
        .eq('following_id', ev.actor_id)

      const allow = new Set(
        (settings || [])
          .filter((s: any) => {
            if (ev.event_type === 'position.opened') return s.position_opened === true
            if (ev.event_type === 'position.closed') return s.position_closed === true
            if (ev.event_type === 'position.stop_hit') return s.position_stop_hit === true
            if (ev.event_type === 'position.target_hit') return s.position_target_hit === true
            return false
          })
          .map((s: any) => s.user_id)
      )

      recipients = recipients.filter((id) => allow.has(id))
    }

    if (recipients.length === 0) continue

    await Promise.all(
      recipients.map((userId) =>
        activityWriter.notify({
          userId,
          actorId: ev.actor_id || null,
          type: notifType as any,
          title,
          message: adminPos?.ticker ? `${adminPos.ticker}` : null,
          link: `/positions/${ev.position_id}`,
          metadata: { position_id: ev.position_id, event_type: ev.event_type },
          dedupeKey,
        })
      )
    )
    sent += recipients.length
  }

  return NextResponse.json({ ok: true, events: (events || []).length, notificationsSent: sent })
}
