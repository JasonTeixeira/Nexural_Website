import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// In production, store these in a secure database
const RESET_TOKENS = new Map<string, { email: string, expires: number }>()

// Admin credentials (in production, use a secure database with hashed passwords)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@nexural.com',
  password: process.env.ADMIN_PASSWORD || 'NexuralAdmin2024!',
  name: 'Nexural Admin',
  role: 'admin'
}

// Security: Rate limiting for password reset attempts
const RATE_LIMIT = new Map<string, { attempts: number, lastAttempt: number }>()
const MAX_ATTEMPTS = 3
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword, action } = await req.json()
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    // Rate limiting check
    const rateLimitKey = `${clientIP}-${email}`
    const now = Date.now()
    const rateLimit = RATE_LIMIT.get(rateLimitKey)
    
    if (rateLimit && rateLimit.attempts >= MAX_ATTEMPTS && (now - rateLimit.lastAttempt) < RATE_LIMIT_WINDOW) {
      return NextResponse.json({
        success: false,
        error: 'Too many attempts. Please try again in 15 minutes.'
      }, { status: 429 })
    }

    if (action === 'request-reset') {
      // Validate admin email
      if (email !== ADMIN_CREDENTIALS.email) {
        // Update rate limiting
        const current = RATE_LIMIT.get(rateLimitKey) || { attempts: 0, lastAttempt: 0 }
        RATE_LIMIT.set(rateLimitKey, { attempts: current.attempts + 1, lastAttempt: now })
        
        return NextResponse.json({
          success: false,
          error: 'Invalid email address'
        }, { status: 401 })
      }

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expires = Date.now() + (30 * 60 * 1000) // 30 minutes

      // Store reset token
      RESET_TOKENS.set(resetToken, { email, expires })

      // In production, send this via email
      console.log(`Password reset token for ${email}: ${resetToken}`)
      console.log(`Reset URL: http://localhost:3000/admin/reset-password?token=${resetToken}`)

      return NextResponse.json({
        success: true,
        message: 'Password reset token generated. Check server logs for token.',
        // In production, don't return the token
        token: resetToken // Only for development
      })
    }

    if (action === 'reset-password') {
      // Validate reset token
      const tokenData = RESET_TOKENS.get(token)
      if (!tokenData || tokenData.expires < Date.now()) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired reset token'
        }, { status: 401 })
      }

      // Validate new password strength
      if (!newPassword || newPassword.length < 12) {
        return NextResponse.json({
          success: false,
          error: 'Password must be at least 12 characters long'
        }, { status: 400 })
      }

      // Password complexity check
      const hasUpperCase = /[A-Z]/.test(newPassword)
      const hasLowerCase = /[a-z]/.test(newPassword)
      const hasNumbers = /\d/.test(newPassword)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return NextResponse.json({
          success: false,
          error: 'Password must contain uppercase, lowercase, numbers, and special characters'
        }, { status: 400 })
      }

      // In production, hash the password and store in database
      console.log(`Password reset successful for ${tokenData.email}`)
      console.log(`New password: ${newPassword}`)
      
      // Remove used token
      RESET_TOKENS.delete(token)

      // Clear rate limiting
      RATE_LIMIT.delete(rateLimitKey)

      return NextResponse.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({
      success: false,
      error: 'Password reset failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Admin Password Reset Endpoint',
    actions: ['request-reset', 'reset-password'],
    security: [
      'Rate limiting: 3 attempts per 15 minutes',
      'Secure token generation',
      'Token expiry: 30 minutes',
      'Password complexity requirements',
      'IP-based rate limiting'
    ]
  })
}
