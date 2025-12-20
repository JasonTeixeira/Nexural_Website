/**
 * Security Module - Comprehensive security utilities
 * Includes rate limiting, security headers, CORS, and more
 */

import { NextRequest, NextResponse } from 'next/server'
// Note: Rate limiting is handled in middleware.ts using lib/rate-limiter.ts

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  // Try various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  // Fallback to a default
  return 'unknown'
}

// Rate limiting is handled in middleware.ts - see lib/rate-limiter.ts for implementation

/**
 * Add comprehensive security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com https://edwbteayhvstevglrrnx.supabase.co https://www.google-analytics.com https://www.googleapis.com",
    "frame-src 'self' https://js.stripe.com https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // X-Frame-Options (clickjacking protection)
  response.headers.set('X-Frame-Options', 'DENY')
  
  // X-Content-Type-Options (MIME sniffing protection)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // X-XSS-Protection (XSS protection)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer-Policy (control referrer information)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions-Policy (feature control)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )
  
  // Strict-Transport-Security (HTTPS enforcement)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  return response
}

/**
 * Validate origin for CORS
 */
export function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3031',
    'http://localhost:3000',
    'http://localhost:3010',
    'http://localhost:3031',
  ]
  
  // In production, only allow the main app URL
  if (process.env.NODE_ENV === 'production') {
    return origin === process.env.NEXT_PUBLIC_APP_URL
  }
  
  return allowedOrigins.includes(origin)
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const origin = request.headers.get('origin')
  
  if (origin && isValidOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    )
    response.headers.set('Access-Control-Max-Age', '86400')
  }
  
  return response
}

/**
 * Validate API key (for admin endpoints)
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const adminKey = process.env.ADMIN_API_KEY
  
  if (!adminKey) {
    console.warn('ADMIN_API_KEY not configured')
    return false
  }
  
  return apiKey === adminKey
}

/**
 * Validate webhook signature (for Stripe webhooks)
 */
export function validateWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false
  
  try {
    // Stripe signature validation would go here
    // For now, just check if signature exists
    return signature.length > 0
  } catch (error) {
    console.error('Webhook signature validation error:', error)
    return false
  }
}

/**
 * Check if request is from a bot
 */
export function isBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  
  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python-requests',
  ]
  
  return botPatterns.some((pattern) =>
    userAgent.toLowerCase().includes(pattern)
  )
}

/**
 * Check if request is suspicious
 */
export function isSuspiciousRequest(request: NextRequest): boolean {
  const { pathname } = request.nextUrl
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    '.php',
    '.asp',
    '.aspx',
    'wp-admin',
    'wp-login',
    'phpmyadmin',
    '../',
    '..\\',
    '<script',
    'javascript:',
    'eval(',
  ]
  
  return suspiciousPatterns.some((pattern) =>
    pathname.toLowerCase().includes(pattern)
  )
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>
): void {
  if (process.env.NODE_ENV === 'production') {
    // In production, send to logging service
    console.warn(`[SECURITY] ${event}:`, JSON.stringify(details))
  } else {
    console.log(`[SECURITY] ${event}:`, details)
  }
}

/**
 * Create secure response with standard headers
 */
export function createSecureResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  return addSecurityHeaders(response)
}

/**
 * Create error response with security headers
 */
export function createSecureErrorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return createSecureResponse(
    {
      error: message,
      timestamp: new Date().toISOString(),
    },
    status
  )
}
