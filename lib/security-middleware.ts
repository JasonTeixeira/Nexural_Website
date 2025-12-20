import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// CSRF token store (in production, use Redis)
const csrfTokenStore = new Map<string, { token: string; expires: number }>()

// Audit log interface
interface AuditLogEntry {
  id: string
  userId: string
  userEmail: string
  action: string
  resource: string
  method: string
  ip: string
  userAgent: string
  timestamp: string
  success: boolean
  errorMessage?: string
  metadata?: any
}

// Input validation schemas
export const ValidationSchemas = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  symbol: /^[A-Z]{1,5}$/,
  tradeId: /^[A-Z0-9_-]{1,50}$/,
  strategy: /^[A-Za-z0-9\s_-]{1,100}$/,
  numeric: /^-?\d+(\.\d+)?$/,
  positiveInteger: /^\d+$/,
  percentage: /^-?\d+(\.\d{1,4})?$/
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// Validate input against schema
export function validateInput(input: any, schema: RegExp | 'object' | 'array'): boolean {
  if (schema === 'object') {
    return typeof input === 'object' && input !== null && !Array.isArray(input)
  }
  
  if (schema === 'array') {
    return Array.isArray(input)
  }
  
  if (schema instanceof RegExp) {
    return typeof input === 'string' && schema.test(input)
  }
  
  return false
}

// Generate CSRF token
export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  
  csrfTokenStore.set(sessionId, { token, expires })
  
  // Clean up expired tokens
  for (const [key, value] of csrfTokenStore.entries()) {
    if (value.expires < Date.now()) {
      csrfTokenStore.delete(key)
    }
  }
  
  return token
}

// Verify CSRF token
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokenStore.get(sessionId)
  
  if (!stored || stored.expires < Date.now()) {
    csrfTokenStore.delete(sessionId)
    return false
  }
  
  return stored.token === token
}

// Rate limiting
export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `${identifier}_${Math.floor(now / windowMs)}`
  
  const current = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs }
  
  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    }
  }
  
  current.count++
  rateLimitStore.set(key, current)
  
  // Clean up old entries
  for (const [storeKey, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(storeKey)
    }
  }
  
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  }
}

// Audit logging
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }
    
    // Store in database (using trading_signals table as workaround)
    await supabase
      .from('trading_signals')
      .insert({
        symbol: 'AUDIT',
        signal_type: entry.action,
        confidence: entry.success ? 100 : 0,
        strategy: 'audit_log',
        metadata: JSON.stringify(auditEntry)
      })
    
    console.log('📋 Audit log:', auditEntry)
  } catch (error) {
    console.error('❌ Failed to log audit event:', error)
  }
}

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.databento.com wss://live.databento.com",
    "frame-ancestors 'none'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}

// Main security middleware
export async function securityMiddleware(
  request: NextRequest,
  options: {
    requireAuth?: boolean
    requireCSRF?: boolean
    rateLimit?: { maxRequests: number; windowMs: number }
    validateInput?: boolean
    auditLog?: boolean
  } = {}
): Promise<{ 
  success: boolean
  response?: NextResponse
  user?: any
  sanitizedBody?: any
}> {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const method = request.method
    const url = request.url
    
    // Rate limiting
    if (options.rateLimit) {
      const rateLimitResult = checkRateLimit(
        ip,
        options.rateLimit.maxRequests,
        options.rateLimit.windowMs
      )
      
      if (!rateLimitResult.allowed) {
        const response = NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        )
        
        response.headers.set('X-RateLimit-Limit', options.rateLimit.maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', '0')
        response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
        
        return { success: false, response: addSecurityHeaders(response) }
      }
    }
    
    // Authentication check
    let user = null
    if (options.requireAuth) {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      
      if (!token) {
        const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        return { success: false, response: addSecurityHeaders(response) }
      }
      
      // Verify token (implement your token verification logic)
      try {
        const { getAdminUser } = await import('@/lib/database-auth')
        user = await getAdminUser(token)
        
        if (!user) {
          const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 })
          return { success: false, response: addSecurityHeaders(response) }
        }
      } catch (error) {
        const response = NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
        return { success: false, response: addSecurityHeaders(response) }
      }
    }
    
    // CSRF protection
    if (options.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfToken = request.headers.get('x-csrf-token')
      const sessionId = request.headers.get('x-session-id') || ip
      
      if (!csrfToken || !verifyCSRFToken(sessionId, csrfToken)) {
        const response = NextResponse.json({ error: 'CSRF token invalid' }, { status: 403 })
        return { success: false, response: addSecurityHeaders(response) }
      }
    }
    
    // Input validation and sanitization
    let sanitizedBody = null
    if (options.validateInput && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const body = await request.json()
        sanitizedBody = sanitizeInput(body)
      } catch (error) {
        const response = NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
        return { success: false, response: addSecurityHeaders(response) }
      }
    }
    
    // Audit logging
    if (options.auditLog) {
      await logAuditEvent({
        userId: user?.id || 'anonymous',
        userEmail: user?.email || 'anonymous',
        action: method,
        resource: new URL(url).pathname,
        method,
        ip,
        userAgent,
        success: true,
        metadata: {
          query: Object.fromEntries(new URL(url).searchParams),
          body: sanitizedBody ? Object.keys(sanitizedBody) : undefined
        }
      })
    }
    
    return {
      success: true,
      user,
      sanitizedBody
    }
    
  } catch (error) {
    console.error('❌ Security middleware error:', error)
    
    const response = NextResponse.json(
      { error: 'Security check failed' },
      { status: 500 }
    )
    
    return { success: false, response: addSecurityHeaders(response) }
  }
}

// Specific validation functions
export const Validators = {
  tradeData: (data: any) => {
    const errors: string[] = []
    
    if (!validateInput(data.symbol, ValidationSchemas.symbol)) {
      errors.push('Invalid symbol format')
    }
    
    if (!validateInput(data.quantity?.toString(), ValidationSchemas.positiveInteger)) {
      errors.push('Invalid quantity')
    }
    
    if (!validateInput(data.price?.toString(), ValidationSchemas.numeric)) {
      errors.push('Invalid price')
    }
    
    if (!['BUY', 'SELL', 'LONG', 'SHORT'].includes(data.side)) {
      errors.push('Invalid side')
    }
    
    return { isValid: errors.length === 0, errors }
  },
  
  backtestData: (data: any) => {
    const errors: string[] = []
    
    if (!data.strategyName || data.strategyName.length < 1 || data.strategyName.length > 100) {
      errors.push('Strategy name must be 1-100 characters')
    }
    
    if (!Array.isArray(data.symbols) || data.symbols.length === 0) {
      errors.push('Symbols array is required')
    }
    
    if (!validateInput(data.initialCapital?.toString(), ValidationSchemas.numeric)) {
      errors.push('Invalid initial capital')
    }
    
    try {
      new Date(data.startDate)
      new Date(data.endDate)
    } catch {
      errors.push('Invalid date format')
    }
    
    return { isValid: errors.length === 0, errors }
  },
  
  emailData: (data: any) => {
    const errors: string[] = []
    
    if (!validateInput(data.email, ValidationSchemas.email)) {
      errors.push('Invalid email format')
    }
    
    if (data.name && (data.name.length < 1 || data.name.length > 100)) {
      errors.push('Name must be 1-100 characters')
    }
    
    return { isValid: errors.length === 0, errors }
  }
}

// Export utility functions
export {
  rateLimitStore,
  csrfTokenStore
}
