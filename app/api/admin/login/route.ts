import { NextRequest, NextResponse } from 'next/server'
import { loginAdmin } from '@/lib/admin-auth'
import { 
  adminLoginRateLimiter, 
  getClientIdentifier, 
  createRateLimitResponse,
  isRateLimitingEnabled,
  fallbackRateLimit
} from '@/lib/rate-limiter'

// SECURE DATABASE-BACKED ADMIN LOGIN
export async function POST(req: NextRequest) {
  try {
    // =========================================================================
    // STRICT RATE LIMITING FOR ADMIN - Prevent brute force attacks
    // Admin endpoints have stricter limits (3 attempts per 15 minutes)
    // =========================================================================
    const identifier = getClientIdentifier(req)
    
    // Check if rate limiting is enabled (Upstash configured)
    if (isRateLimitingEnabled()) {
      const { success, limit, remaining, reset } = await adminLoginRateLimiter.limit(identifier)
      
      if (!success) {
        console.warn(`[SECURITY ALERT] Admin rate limit exceeded from ${identifier}`)
        return createRateLimitResponse(limit, remaining, reset)
      }
      
      // Log all admin login attempts for security monitoring
      console.log(`[ADMIN SECURITY] Login attempt from ${identifier} - ${remaining}/${limit} remaining`)
    } else {
      // Fallback rate limiting (in-memory, for development)
      // Even stricter for admin: 3 attempts per 15 minutes
      const { success, remaining, reset } = await fallbackRateLimit(
        `admin:${identifier}`,
        3, // max 3 attempts (stricter than member login)
        15 * 60 * 1000 // per 15 minutes
      )
      
      if (!success) {
        console.warn(`[SECURITY ALERT] Admin fallback rate limit exceeded for ${identifier}`)
        return new NextResponse(
          JSON.stringify({
            error: 'Too many admin login attempts',
            message: 'Your IP has been temporarily blocked. Please try again later.',
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
      
      console.log(`[DEV] Admin login attempt from ${identifier} - ${remaining}/3 remaining`)
    }

    // =========================================================================
    // INPUT VALIDATION
    // =========================================================================
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Get client IP for logging
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown'

    console.log(`🔐 Admin login attempt for: ${email} from IP: ${ipAddress}`)

    // =========================================================================
    // AUTHENTICATION
    // =========================================================================

    // Authenticate with database
    const result = await loginAdmin(email, password, ipAddress)

    if (result.success && result.user) {
      console.log(`✅ Admin login SUCCESS for: ${email}`)

      const response = NextResponse.json({
        success: true,
        user: result.user
      })

      // Set secure session cookie with user ID
      response.cookies.set('admin_session', result.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      })

      // Also set simple flag for middleware
      response.cookies.set('admin_authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/'
      })

      return response
    } else {
      console.log(`❌ Admin login FAILED for: ${email}: ${result.error}`)
      return NextResponse.json({
        success: false,
        error: result.error || 'Invalid credentials'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('❌ Admin login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Login failed'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Admin Login Endpoint',
    method: 'POST',
    fields: ['email', 'password'],
    status: 'Fallback authentication system active (database temporarily unavailable)',
    test_credentials: {
      email: 'admin@nexural.io',
      password: 'admin123!'
    }
  })
}
