import { createServiceClient } from '@/lib/supabase/service'

export type ActivityType =
  | 'post_created'
  | 'post_liked'
  | 'post_commented'
  | 'position_shared'
  | 'followed_user'
  | 'followed_portfolio'

export type NotificationType = 'new_follower' | 'post_like' | 'post_comment' | 'trade_shared'

// SSOT: position event alerts (docs/FEED_ALERTS_SPEC.md)
export type PositionAlertType = 'position_opened' | 'position_closed' | 'position_stop_hit' | 'position_target_hit'

/**
 * Centralized writer for activity + in-app notifications.
 * Uses service role (bypasses RLS) and performs lightweight idempotency.
 */
export class ActivityWriter {
  private svc = createServiceClient()

  async writeActivity(args: {
    actorId: string
    activityType: ActivityType
    visibility?: 'public' | 'followers' | 'private'
    targetUserId?: string | null
    portfolioId?: string | null
    positionId?: string | null
    postId?: string | null
    shareId?: string | null
    metadata?: Record<string, any>
    // If provided, we avoid duplicates for the same actor/type + key.
    dedupeKey?: string
  }) {
    const visibility = args.visibility || 'public'
    const metadata = args.metadata || {}

    // Optional idempotency: if dedupeKey set, check recent duplicates.
    if (args.dedupeKey) {
      const { data: existing } = await this.svc
        .from('activity_items')
        .select('id')
        .eq('actor_id', args.actorId)
        .eq('activity_type', args.activityType)
        .contains('metadata', { dedupe_key: args.dedupeKey })
        .maybeSingle()

      if (existing?.id) return existing
    }

    const { data, error } = await this.svc
      .from('activity_items')
      .insert({
        actor_id: args.actorId,
        activity_type: args.activityType,
        visibility,
        target_user_id: args.targetUserId || null,
        portfolio_id: args.portfolioId || null,
        position_id: args.positionId || null,
        post_id: args.postId || null,
        share_id: args.shareId || null,
        metadata: {
          ...metadata,
          ...(args.dedupeKey ? { dedupe_key: args.dedupeKey } : {}),
        },
      })
      .select('id')
      .single()

    if (error) throw error
    return data
  }

  async notify(args: {
    userId: string
    actorId?: string | null
    type: NotificationType | PositionAlertType
    title: string
    message?: string | null
    link?: string | null
    metadata?: Record<string, any>
    dedupeKey?: string
  }) {
    const metadata = args.metadata || {}

    if (args.dedupeKey) {
      const { data: existing } = await this.svc
        .from('user_notifications')
        .select('id')
        .eq('user_id', args.userId)
        .eq('notification_type', args.type)
        .contains('metadata', { dedupe_key: args.dedupeKey })
        .maybeSingle()

      if (existing?.id) return existing
    }

    const { data, error } = await this.svc
      .from('user_notifications')
      .insert({
        user_id: args.userId,
        actor_id: args.actorId || null,
        notification_type: args.type,
        title: args.title,
        message: args.message || null,
        link: args.link || null,
        metadata: {
          ...metadata,
          ...(args.dedupeKey ? { dedupe_key: args.dedupeKey } : {}),
        },
      })
      .select('id')
      .single()

    if (error) throw error
    return data
  }
}

export const activityWriter = new ActivityWriter()
