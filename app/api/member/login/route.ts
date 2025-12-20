import { NextRequest, NextResponse } from 'next/server'
import { FallbackAuth } from '@/lib/fallback-auth'
import { ServerSessionService } from '@/lib/server-session-service'
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, getRateLimitHeaders } from '@/lib/rate-limiter'

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request body'
      }, { status: 400 })
    }

    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Validate email format
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 })
    }

    // Validate password
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters'
      }, { status: 400 })
    }

    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Rate limiting - strict for auth endpoints
    const identifier = getClientIdentifier(req)
    const rateLimit = checkRateLimit(identifier, rateLimitConfigs.auth)
    
    if (!rateLimit.allowed) {
      console.warn(`🚫 Rate limit exceeded for IP: ${clientIP}`)
      return NextResponse.json({
        success: false,
        error: 'Too many login attempts. Please try again later.'
      }, { 
        status: 429,
        headers: getRateLimitHeaders(
          rateLimit.remaining,
          rateLimit.resetTime,
          rateLimitConfigs.auth.maxRequests
        )
      })
    }

    console.log(`👤 Member login attempt from IP: ${clientIP} for email: ${email}`)

    // Use fallback authentication system
    const loginResult = await FallbackAuth.login(email, password)

    if (loginResult.success && loginResult.user && loginResult.token) {
      // Only allow member role for member login (but also allow admin for testing)
      if (loginResult.user.role !== 'member' && loginResult.user.role !== 'admin') {
        console.warn(`❌ Invalid role attempted member login: ${email} (role: ${loginResult.user.role})`)
        return NextResponse.json({
          success: false,
          error: 'Access denied'
        }, { status: 403 })
      }

      // Create server-side session
      const { token: sessionToken } = await ServerSessionService.createSession(
        loginResult.user.id.toString(),
        loginResult.user.email,
        'member',
        clientIP,
        userAgent
      )

      console.log(`✅ Member login successful from IP: ${clientIP} at ${new Date().toISOString()}`)

      const response = NextResponse.json({
        success: true,
        token: sessionToken,
        user: {
          id: loginResult.user.id,
          email: loginResult.user.email,
          name: loginResult.user.name,
          role: loginResult.user.role
        }
      })

      // Set secure HTTP-only cookie for middleware authentication
      response.cookies.set('member_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      })

      return response

    } else {
      console.warn(`❌ Failed member login attempt from IP: ${clientIP} for email: ${email} at ${new Date().toISOString()}`)

      return NextResponse.json({
        success: false,
        error: loginResult.error || 'Invalid credentials'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('❌ Member login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Login failed'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Member Login Endpoint',
    method: 'POST',
    fields: ['email', 'password'],
    status: 'Fallback authentication system active (database temporarily unavailable)',
    test_credentials: {
      email: 'member@test.com',
      password: 'member123!'
    }
  })
}
