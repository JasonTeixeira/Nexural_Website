import {
  strictApiRateLimiter,
  apiRateLimiter,
  referralConsumeRateLimiter,
  checkRateLimit,
  createRateLimitResponse,
  getClientIdentifier,
  getUserIdentifier,
} from '@/lib/rate-limiter'

// Central helpers so we enforce rate limiting consistently across routes.

export async function enforceApiRateLimit(request: Request) {
  const ip = getClientIdentifier(request)
  const { success, limit, remaining, reset } = await checkRateLimit(request, apiRateLimiter, ip)
  if (!success) return createRateLimitResponse(limit, remaining, reset)
  return null
}

export async function enforceStrictUserRateLimit(request: Request, userId: string) {
  const ip = getClientIdentifier(request)
  const key = getUserIdentifier(userId, ip)
  const { success, limit, remaining, reset } = await checkRateLimit(request, strictApiRateLimiter, key)
  if (!success) return createRateLimitResponse(limit, remaining, reset)
  return null
}

export async function enforceReferralConsumeRateLimit(request: Request, userId?: string) {
  const ip = getClientIdentifier(request)
  const key = userId ? getUserIdentifier(userId, ip) : ip
  const { success, limit, remaining, reset } = await checkRateLimit(request, referralConsumeRateLimiter, key)
  if (!success) return createRateLimitResponse(limit, remaining, reset)
  return null
}
