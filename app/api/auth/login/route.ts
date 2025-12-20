import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { 
  loginRateLimiter, 
  getClientIdentifier, 
  createRateLimitResponse,
  isRateLimitingEnabled,
  fallbackRateLimit
} from '@/lib/rate-limiter'
import { validateRequestBody, loginSchema } from '@/lib/validation'
import { createAuthError, createValidationError } from '@/lib/error-handler'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // =========================================================================
    // RATE LIMITING - Prevent brute force attacks
    // =========================================================================
    const identifier = getClientIdentifier(request)
    
    // Check if rate limiting is enabled (Upstash configured)
    if (isRateLimitingEnabled()) {
      const { success, limit, remaining, reset } = await loginRateLimiter.limit(identifier)
      
      if (!success) {
        console.warn(`[SECURITY] Rate limit exceeded for login attempt from ${identifier}`)
        return createRateLimitResponse(limit, remaining, reset)
      }
      
      // Log rate limit info (for monitoring)
      console.log(`[SECURITY] Login attempt from ${identifier} - ${remaining}/${limit} remaining`)
    } else {
      // Fallback rate limiting (in-memory, for development)
      const { success, remaining, reset } = await fallbackRateLimit(
        identifier,
        5, // max 5 attempts
        15 * 60 * 1000 // per 15 minutes
      )
      
      if (!success) {
        console.warn(`[SECURITY] Fallback rate limit exceeded for ${identifier}`)
        return new NextResponse(
          JSON.stringify({
            error: 'Too many login attempts',
            message: 'Please try again later',
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
      
      console.log(`[DEV] Login attempt from ${identifier} - ${remaining}/5 remaining`)
    }

    // =========================================================================
    // INPUT VALIDATION
    // =========================================================================
    const validation = await validateRequestBody(request, loginSchema)
    
    if (!validation.success) {
      console.warn(`[SECURITY] Invalid login input from ${identifier}:`, validation.errors)
      return NextResponse.json(
        { 
          error: 'Invalid input',
          errors: validation.errors 
        },
        { status: 400 }
      )
    }
    
    const { email, password } = validation.data

    // =========================================================================
    // AUTHENTICATION
    // =========================================================================

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('members')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if subscription is active - allow trial and active users
    if (user.subscription_status !== 'active' && user.subscription_status !== 'trial' && user.subscription_status !== 'trialing') {
      return NextResponse.json(
        { error: 'Your subscription is not active. Please renew your subscription.' },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        subscriptionStatus: user.subscription_status,
        subscriptionTier: user.subscription_tier
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Update last login
    await supabase
      .from('members')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscription_status,
        subscriptionTier: user.subscription_tier
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
