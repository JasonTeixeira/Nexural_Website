import { redis, isRedisConfigured } from '@/lib/redis-client'

/**
 * Simple Redis lock for serverless concurrency control.
 *
 * Uses SET NX + EX. Returns a release() function.
 */
export async function acquireRedisLock(opts: {
  key: string
  ttlSeconds: number
}): Promise<{ acquired: boolean; release: () => Promise<void> }> {
  if (!isRedisConfigured() || !redis) {
    // If Redis is down/unconfigured, don't block execution.
    return { acquired: true, release: async () => {} }
  }

  // Upstash supports SET with options: { nx: true, ex: seconds }
  const res = await redis.set(opts.key, '1', { nx: true, ex: opts.ttlSeconds })
  const acquired = res === 'OK'

  return {
    acquired,
    release: async () => {
      if (!acquired) return
      try {
        await redis.del(opts.key)
      } catch {
        // ignore
      }
    },
  }
}
