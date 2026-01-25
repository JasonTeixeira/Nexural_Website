import { redis, isRedisConfigured } from '@/lib/redis-client'

/**
 * Redis-backed idempotency guard for webhook event processing.
 * Stripe retries aggressively; this prevents double-processing.
 */
export async function wasWebhookEventProcessed(opts: {
  provider: 'stripe'
  eventId: string
}): Promise<boolean> {
  if (!isRedisConfigured() || !redis) return false
  const key = `webhook:${opts.provider}:processed:${opts.eventId}`
  const v = await redis.get(key)
  return v === '1'
}

export async function markWebhookEventProcessed(opts: {
  provider: 'stripe'
  eventId: string
  ttlSeconds?: number
}): Promise<void> {
  if (!isRedisConfigured() || !redis) return
  const key = `webhook:${opts.provider}:processed:${opts.eventId}`
  // Keep for 7 days to cover retries/delays.
  const ex = opts.ttlSeconds ?? 7 * 24 * 60 * 60
  await redis.set(key, '1', { ex })
}
