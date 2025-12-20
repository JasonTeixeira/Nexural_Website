import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Member } from './member-auth'

// Server-side JWT validation (NEVER trust client-side)
export function verifyMemberTokenServer(token: string): Member | null {
  try {
    // Use strong JWT secret (must be set in environment)
    const secret = process.env.JWT_SECRET
    if (!secret || secret.length < 32) {
      console.error('JWT_SECRET must be at least 32 characters long')
      return null
    }

    const decoded = jwt.verify(token, secret) as any
    
    if (decoded.type === "member" && decoded.exp > Date.now() / 1000) {
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        subscriptionId: decoded.subscriptionId,
        subscriptionStatus: decoded.subscriptionStatus,
        discordAccess: decoded.discordAccess,
        joinedAt: decoded.joinedAt
      }
    }
    
    return null
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Middleware to protect member routes
export function requireMemberAuth(handler: (req: NextRequest, member: Member) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      const member = verifyMemberTokenServer(token)
      
      if (!member) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      }

      // Call the protected handler with verified member
      return await handler(req, member)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    }
  }
}

// Admin authentication with proper session management
export function requireAdminAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Check for admin JWT token (not simple key comparison)
      const authHeader = req.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
      }

      const token = authHeader.substring(7)
      
      // Verify admin JWT token
      const secret = process.env.ADMIN_JWT_SECRET
      if (!secret) {
        console.error('ADMIN_JWT_SECRET not configured')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      }

      const decoded = jwt.verify(token, secret) as any
      
      if (decoded.type !== 'admin' || decoded.exp < Date.now() / 1000) {
        return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
      }

      // Log admin action for audit trail
      console.log(`Admin action: ${req.method} ${req.url} by ${decoded.adminId} at ${new Date().toISOString()}`)

      return await handler(req)
    } catch (error) {
      console.error('Admin auth error:', error)
      return NextResponse.json({ error: 'Admin authentication failed' }, { status: 401 })
    }
  }
}

// Input validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateDiscordId(id: string): boolean {
  // Discord IDs are 17-19 digit numbers
  return /^\d{17,19}$/.test(id)
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input.replace(/[<>\"'&]/g, '').trim()
}

// Rate limiting helper for specific endpoints
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>()
  
  return (identifier: string): boolean => {
    const now = Date.now()
    const userRequests = requests.get(identifier)
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (userRequests.count >= maxRequests) {
      return false
    }
    
    userRequests.count++
    return true
  }
}

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string, 
  signature: string, 
  secret: string
): boolean {
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return false
  }
}
