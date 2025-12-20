import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@/lib/admin-auth'
import { 
  passwordResetRateLimiter, 
  getClientIdentifier, 
  createRateLimitResponse,
  isRateLimitingEnabled,
  fallbackRateLimit
} from '@/lib/rate-limiter'

/**
 * REQUEST PASSWORD RESET
 * 
 * Generates a secure token and sends password reset email to admin user
 * Rate limited to prevent abuse: 3 requests per hour per email
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 })
    }

    // =========================================================================
    // RATE LIMITING - Prevent password reset abuse
    // Use email as identifier to prevent spam to specific users
    // =========================================================================
    const identifier = `pwd_reset:${email.toLowerCase()}`
    
    // Check if rate limiting is enabled (Upstash configured)
    if (isRateLimitingEnabled()) {
      const { success, limit, remaining, reset } = await passwordResetRateLimiter.limit(identifier)
      
      if (!success) {
        console.warn(`[SECURITY] Password reset rate limit exceeded for ${email}`)
        return createRateLimitResponse(limit, remaining, reset)
      }
      
      console.log(`[SECURITY] Password reset request for ${email} - ${remaining}/${limit} remaining`)
    } else {
      // Fallback rate limiting (in-memory, for development)
      const { success, remaining, reset } = await fallbackRateLimit(
        identifier,
        3, // max 3 requests
        60 * 60 * 1000 // per hour
      )
      
      if (!success) {
        console.warn(`[SECURITY] Fallback rate limit exceeded for password reset: ${email}`)
        return new NextResponse(
          JSON.stringify({
            error: 'Too many password reset requests',
            message: 'Please wait before requesting another password reset.',
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        )
      }
    }

    console.log(`📧 Password reset requested for: ${email}`)

    // Request password reset (always returns success to prevent email enumeration)
    const result = await requestPasswordReset(email)

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Password reset request error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 })
  }
}
