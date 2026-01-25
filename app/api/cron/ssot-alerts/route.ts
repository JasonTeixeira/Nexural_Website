import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { activityWriter } from '@/lib/activity-writer'
import { acquireRedisLock } from '@/lib/redis-lock'
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

  // Concurrency guard: prevent overlapping cron runs.
  const lock = await acquireRedisLock({ key: 'lock:cron:ssot-alerts', ttlSeconds: 60 })
  if (!lock.acquired) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'lock_held' })
  }

  const svc = createServiceClient()
  const adminUserId = process.env.ADMIN_USER_ID || null
  const sinceMinutes = Number(new URL(request.url).searchParams.get('sinceMinutes') || '60')
  const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString()

  const { data: events, error: evErr } = await svc
    .from('position_events')
    .select('id,position_id,event_type,created_at,created_by')
    .in('event_type', ['position.opened', 'position.closed', 'position.stop_hit', 'position.target_hit', 'position.amended'])
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 })

  let sent = 0
  try {
  for (const ev of events || []) {
    // Only alert for amendments if economic and opted-in (default OFF).
    // (DB doesn't currently store amendment_class; treat all amendments as eligible for now.)

    const dedupeKey = `ssot_event:${ev.id}`

    // Determine if this is an admin position.
    const { data: adminPos } = await svc
      .from('trading_positions')
      .select('id,symbol')
      .eq('id', ev.position_id)
      .maybeSingle()

    const isAdmin = !!adminPos?.id

    // Followers of the actor (member events) OR followers of admin
    let followingId: string | null = null
    if (isAdmin) {
      // SSOT: admin follow is mandatory; we use ADMIN_USER_ID as the canonical anchor.
      followingId = adminUserId
    } else {
      // Member position: created_by should be the owner.
      followingId = (ev as any).created_by || null
    }

    // Fetch followers
    const followersRes = followingId
      ? await svc.from('follows').select('follower_id').eq('following_id', followingId)
      : { data: [] as any[] }

    // user_notifications.user_id references public.members(id), not auth.users.
    // Followers may contain auth user ids; filter to only member ids to avoid FK failures.
    const followerIds = Array.from(new Set((followersRes.data || []).map((r: any) => r.follower_id))).filter(Boolean)

    const { data: memberRows } = followerIds.length
      ? await svc.from('members').select('id').in('id', followerIds)
      : { data: [] as any[] }

    const memberIds = new Set((memberRows || []).map((m: any) => m.id))
    const deliverableFollowerIds = followerIds.filter((id) => memberIds.has(id))
    if (!isAdmin && deliverableFollowerIds.length === 0) continue

    // Admin alerts: default ON via alert_preferences (row may not exist; treat as true).
    let recipients: string[] = deliverableFollowerIds

    // Admin alerts: filter recipients by alert_preferences (default ON if row missing).
    if (isAdmin) {
      if (!adminUserId) {
        recipients = []
      } else {
        const { data: prefs } = await svc
          .from('alert_preferences')
          .select('user_id,admin_trade_alerts_enabled')
          .in('user_id', deliverableFollowerIds)

        const enabled = new Set(
          (prefs || [])
            .filter((p: any) => p.admin_trade_alerts_enabled !== false)
            .map((p: any) => p.user_id)
        )

        // If a user has no row in alert_preferences, treat as enabled.
        const hasRow = new Set((prefs || []).map((p: any) => p.user_id))
        recipients = deliverableFollowerIds.filter((id) => enabled.has(id) || !hasRow.has(id))
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

    // NOTE: `user_notifications.notification_type` is currently constrained.
    // Until we extend the DB constraint/migration, map SSOT alerts to an
    // existing allowed value.
    const notifType = 'system_alert'

    // Member alerts: OFF by default (SSOT). Only notify followers who opted in.
    if (!isAdmin && followerIds.length > 0) {
      const { data: settings } = await svc
        .from('follow_notification_settings')
        .select('user_id,position_opened,position_closed,position_stop_hit,position_target_hit')
        .in('user_id', deliverableFollowerIds)
        .eq('following_id', (ev as any).created_by)

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
          type: notifType as any,
          title,
          message: adminPos?.symbol ? `${adminPos.symbol}` : null,
          link: `/positions/${ev.position_id}`,
          dedupeKey,
        })
      )
    )
    sent += recipients.length
  }

  return NextResponse.json({ ok: true, events: (events || []).length, notificationsSent: sent })
  } finally {
    await lock.release()
  }
}
