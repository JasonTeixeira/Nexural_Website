/**
 * UNIVERSAL REDIS CLIENT
 * Works with both Upstash REST API and Railway standard Redis
 * Auto-detects which type based on environment variables
 */

import { Redis as UpstashRedis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Check which Redis type we're using
const isUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

const isRailway = !!process.env.REDIS_URL

// =============================================================================
// REDIS CLIENT INITIALIZATION
// =============================================================================

let redisClient: UpstashRedis | any

if (isUpstash) {
  // Upstash REST API (serverless-optimized)
  redisClient = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  console.log('✅ Using Upstash Redis (REST API)')
} else if (isRailway) {
  // Railway standard Redis (requires ioredis)
  try {
    // Dynamic import to avoid errors if ioredis not installed
    const IORedis = require('ioredis')
    const railwayRedis = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) return null
        return Math.min(times * 200, 1000)
      },
    })

    // Wrap IORedis to match Upstash interface
    redisClient = {
      get: async (key: string) => railwayRedis.get(key),
      set: async (key: string, value: any, options?: any) => {
        if (options?.ex) {
          return railwayRedis.setex(key, options.ex, value)
        }
        return railwayRedis.set(key, value)
      },
      incr: async (key: string) => railwayRedis.incr(key),
      expire: async (key: string, seconds: number) => railwayRedis.expire(key, seconds),
      del: async (...keys: string[]) => railwayRedis.del(...keys),
      exists: async (...keys: string[]) => railwayRedis.exists(...keys),
      ttl: async (key: string) => railwayRedis.ttl(key),
      ping: async () => railwayRedis.ping(),
    }
    console.log('✅ Using Railway Redis (Standard Protocol)')
  } catch (error) {
    console.error('❌ Failed to initialize Railway Redis. Install ioredis: npm install ioredis')
    throw new Error('ioredis is required for Railway Redis. Run: npm install ioredis')
  }
} else {
  console.warn('⚠️  No Redis configured. Rate limiting will use in-memory fallback.')
  redisClient = null
}

// =============================================================================
// EXPORTS
// =============================================================================

export const redis = redisClient

export function isRedisConfigured(): boolean {
  return redisClient !== null
}

export function getRedisType(): 'upstash' | 'railway' | 'none' {
  if (isUpstash) return 'upstash'
  if (isRailway) return 'railway'
  return 'none'
}

// =============================================================================
// RATE LIMITER WITH REDIS
// =============================================================================

/**
 * Create rate limiter instance
 * Works with both Upstash and Railway Redis
 */
export function createRateLimiter(config: {
  maxRequests: number
  windowMs: number
  prefix: string
}) {
  if (!redis) {
    console.warn(`⚠️  Rate limiter '${config.prefix}' using fallback (no Redis configured)`)
    return null
  }

  if (isUpstash) {
    // Use Upstash's built-in rate limiter
    return new Ratelimit({
      redis: redis as UpstashRedis,
      limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowMs}ms`),
      analytics: true,
      prefix: config.prefix,
    })
  } else {
    // Custom rate limiter for standard Redis
    return {
      limit: async (identifier: string) => {
        const key = `${config.prefix}:${identifier}`
        const now = Date.now()
        const windowStart = now - config.windowMs

        try {
          // Use sorted set for sliding window
          const multi = (redis as any).pipeline
            ? (redis as any).pipeline()
            : null

          if (multi) {
            // Remove old entries
            await redis.zremrangebyscore(key, 0, windowStart)
            // Count current requests
            const count = await redis.zcard(key)
            // Add new request
            await redis.zadd(key, now, `${now}`)
            // Set expiration
            await redis.expire(key, Math.ceil(config.windowMs / 1000))

            const success = count < config.maxRequests
            const remaining = Math.max(0, config.maxRequests - count - 1)
            const reset = now + config.windowMs

            return {
              success,
              limit: config.maxRequests,
              remaining,
              reset,
            }
          } else {
            // Fallback to simple counter
            const count = await redis.incr(key)
            if (count === 1) {
              await redis.expire(key, Math.ceil(config.windowMs / 1000))
            }

            const success = count <= config.maxRequests
            const remaining = Math.max(0, config.maxRequests - count)
            const reset = now + config.windowMs

            return {
              success,
              limit: config.maxRequests,
              remaining,
              reset,
            }
          }
        } catch (error) {
          console.error('Rate limiter error:', error)
          // Allow request on error (fail open for better UX)
          return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests,
            reset: now + config.windowMs,
          }
        }
      },
    }
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  if (!redis) return false

  try {
    if (isUpstash) {
      await redis.ping()
    } else {
      await redis.ping()
    }
    return true
  } catch (error) {
    console.error('Redis connection test failed:', error)
    return false
  }
}

/**
 * Get Redis info for health check
 */
export async function getRedisInfo() {
  return {
    configured: isRedisConfigured(),
    type: getRedisType(),
    connected: await testRedisConnection(),
    url: isUpstash
      ? process.env.UPSTASH_REDIS_REST_URL?.split('@')[1]
      : isRailway
      ? process.env.REDIS_URL?.split('@')[1]
      : null,
  }
}
