/**
 * PRODUCTION RATE LIMITER
 * Protects against brute force, DOS, and API abuse
 * Works with both Upstash REST API and Railway standard Redis
 */

import { redis, createRateLimiter, isRedisConfigured } from './redis-client'

// =============================================================================
// FALLBACK LIMITER (In-Memory)
// =============================================================================

const inMemoryLimiters = new Map<string, Map<string, { count: number; resetAt: number }>>()

function createFallbackLimiter(maxRequests: number, windowMs: number) {
  return {
    limit: async (identifier: string) => {
      const now = Date.now()
      const storageKey = `${maxRequests}:${windowMs}`
      
      if (!inMemoryLimiters.has(storageKey)) {
        inMemoryLimiters.set(storageKey, new Map())
      }
      
      const store = inMemoryLimiters.get(storageKey)!
      const record = store.get(identifier)
      
      if (!record || record.resetAt < now) {
        store.set(identifier, { count: 1, resetAt: now + windowMs })
        return {
          success: true,
          limit: maxRequests,
          remaining: maxRequests - 1,
          reset: now + windowMs,
        }
      }
      
      if (record.count >= maxRequests) {
        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          reset: record.resetAt,
        }
      }
      
      record.count++
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - record.count,
        reset: record.resetAt,
      }
    },
  }
}

// =============================================================================
// RATE LIMIT CONFIGURATIONS
// =============================================================================

/**
 * Login attempts - Strict limit to prevent brute force
 * 5 attempts per 15 minutes per IP
 */
export const loginRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  prefix: 'ratelimit:login',
}) || createFallbackLimiter(5, 15 * 60 * 1000)

/**
 * Admin login - Even stricter
 * 3 attempts per 15 minutes per IP
 */
export const adminLoginRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  prefix: 'ratelimit:admin_login',
}) || createFallbackLimiter(3, 15 * 60 * 1000)

/**
 * Password reset - Prevent abuse
 * 3 requests per hour per email
 */
export const passwordResetRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:password_reset',
}) || createFallbackLimiter(3, 60 * 60 * 1000)

/**
 * General API - Prevent abuse
 * 100 requests per minute per IP
 */
export const apiRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  prefix: 'ratelimit:api',
}) || createFallbackLimiter(100, 60 * 1000)

/**
 * Strict API (mutations) - Write operations
 * 30 requests per minute per user
 */
export const strictApiRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
  prefix: 'ratelimit:api_strict',
}) || createFallbackLimiter(30, 60 * 1000)

/**
 * Webhook endpoints - External integrations
 * 10 requests per minute per IP
 */
export const webhookRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  prefix: 'ratelimit:webhook',
}) || createFallbackLimiter(10, 60 * 1000)

/**
 * Email sending - Prevent spam
 * 5 emails per hour per user
 */
export const emailRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:email',
}) || createFallbackLimiter(5, 60 * 60 * 1000)

/**
 * Signup - Prevent fake accounts
 * 3 signups per hour per IP
 */
export const signupRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:signup',
}) || createFallbackLimiter(3, 60 * 60 * 1000)

/**
 * Referrals consume endpoint - prevent cookie stuffing / abuse
 * 10 requests per hour per user+ip (or ip if unauth)
 */
export const referralConsumeRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:referral_consume',
}) || createFallbackLimiter(10, 60 * 60 * 1000)

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get client identifier from request
 * Tries multiple methods to identify the client
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for production behind proxies)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  // Return first available identifier
  return (
    cfConnectingIp ||
    realIp ||
    forwardedFor?.split(',')[0] ||
    'unknown'
  )
}

/**
 * Get user identifier (for authenticated rate limits)
 */
export function getUserIdentifier(userId: string, ip: string): string {
  return `user:${userId}:${ip}`
}

/**
 * Apply rate limit and return formatted response
 */
export async function applyRateLimit(
  limiter: any,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  if (!limiter) {
    // Fallback if Redis not configured
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 60000,
    }
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier)
  
  return {
    success,
    limit,
    remaining,
    reset,
  }
}

/**
 * Create rate limit response with proper headers
 */
export function createRateLimitResponse(
  limit: number,
  remaining: number,
  reset: number
): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    }
  )
}

/**
 * Rate limit middleware for API routes
 * Usage: const { success, ...rest } = await checkRateLimit(request, apiRateLimiter)
 */
export async function checkRateLimit(
  request: Request,
  limiter: any = apiRateLimiter,
  customIdentifier?: string
) {
  const identifier = customIdentifier || getClientIdentifier(request)
  const result = await applyRateLimit(limiter, identifier)
  
  return result
}

/**
 * Verify webhook request (for Discord, etc.)
 */
export async function verifyWebhookRequest(request: Request): Promise<boolean> {
  const identifier = getClientIdentifier(request)
  const { success } = await checkRateLimit(request, webhookRateLimiter, identifier)
  return success
}

// =============================================================================
// RATE LIMIT CONFIGS EXPORT
// =============================================================================

export const rateLimitConfigs = {
  login: { max: 5, window: '15m', message: 'Too many login attempts' },
  adminLogin: { max: 3, window: '15m', message: 'Too many admin login attempts' },
  passwordReset: { max: 3, window: '1h', message: 'Too many password reset requests' },
  api: { max: 100, window: '1m', message: 'Too many API requests' },
  strictApi: { max: 30, window: '1m', message: 'Too many write operations' },
  webhook: { max: 10, window: '1m', message: 'Too many webhook requests' },
  email: { max: 5, window: '1h', message: 'Too many emails sent' },
  signup: { max: 3, window: '1h', message: 'Too many signup attempts' },
  referralConsume: { max: 10, window: '1h', message: 'Too many referral attempts' },
}

// =============================================================================
// UTILITY: CHECK IF REDIS IS CONFIGURED
// =============================================================================

export function isRateLimitingEnabled(): boolean {
  return isRedisConfigured()
}

/**
 * Fallback rate limit check (in-memory, for development)
 * Not recommended for production - use Redis
 */
const inMemoryStore = new Map<string, { count: number; resetAt: number }>()

export async function fallbackRateLimit(
  identifier: string,
  max: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Date.now()
  const record = inMemoryStore.get(identifier)
  
  if (!record || record.resetAt < now) {
    inMemoryStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    })
    return { success: true, remaining: max - 1, reset: now + windowMs }
  }
  
  if (record.count >= max) {
    return { success: false, remaining: 0, reset: record.resetAt }
  }
  
  record.count++
  return { success: true, remaining: max - record.count, reset: record.resetAt }
}
