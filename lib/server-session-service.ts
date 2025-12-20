/**
 * SERVER-SIDE SESSION SERVICE
 * Handles secure session management with Redis caching
 * Validates JWT tokens and manages admin sessions
 */

import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

// In-memory session store (use Redis in production)
const sessionStore = new Map<string, SessionData>()

interface SessionData {
  userId: string
  email: string
  role: 'admin' | 'member'
  createdAt: number
  lastActivity: number
  ipAddress?: string
  userAgent?: string
}

interface ValidationResult {
  valid: boolean
  session?: SessionData
  error?: string
}

export class ServerSessionService {
  
  /**
   * Create a new session for authenticated user
   */
  static async createSession(
    userId: string,
    email: string,
    role: 'admin' | 'member',
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ token: string; session: SessionData }> {
    
    // Generate JWT token
    const token = jwt.sign(
      { userId, email, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    // Create session data
    const session: SessionData = {
      userId,
      email,
      role,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ipAddress,
      userAgent
    }
    
    // Store session
    sessionStore.set(token, session)
    
    // Log session creation
    await this.logAuditEvent('session_created', userId, {
      ipAddress,
      userAgent
    })
    
    return { token, session }
  }
  
  /**
   * Validate session token
   */
  static async validateSession(token: string): Promise<ValidationResult> {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // Get session from store
      const session = sessionStore.get(token)
      
      if (!session) {
        return {
          valid: false,
          error: 'Session not found'
        }
      }
      
      // Check if session expired
      const now = Date.now()
      if (now - session.createdAt > SESSION_DURATION) {
        sessionStore.delete(token)
        return {
          valid: false,
          error: 'Session expired'
        }
      }
      
      // Check inactivity timeout
      if (now - session.lastActivity > INACTIVITY_TIMEOUT) {
        sessionStore.delete(token)
        await this.logAuditEvent('session_timeout', session.userId, {
          reason: 'inactivity'
        })
        return {
          valid: false,
          error: 'Session timed out due to inactivity'
        }
      }
      
      // Update last activity
      session.lastActivity = now
      sessionStore.set(token, session)
      
      return {
        valid: true,
        session
      }
      
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token'
      }
    }
  }
  
  /**
   * Destroy session (logout)
   */
  static async destroySession(token: string): Promise<boolean> {
    const session = sessionStore.get(token)
    
    if (session) {
      sessionStore.delete(token)
      await this.logAuditEvent('session_destroyed', session.userId, {
        reason: 'logout'
      })
      return true
    }
    
    return false
  }
  
  /**
   * Get all active sessions for a user
   */
  static getActiveSessions(userId: string): SessionData[] {
    const sessions: SessionData[] = []
    
    for (const [token, session] of sessionStore.entries()) {
      if (session.userId === userId) {
        sessions.push(session)
      }
    }
    
    return sessions
  }
  
  /**
   * Destroy all sessions for a user
   */
  static async destroyAllUserSessions(userId: string): Promise<number> {
    let count = 0
    
    for (const [token, session] of sessionStore.entries()) {
      if (session.userId === userId) {
        sessionStore.delete(token)
        count++
      }
    }
    
    if (count > 0) {
      await this.logAuditEvent('all_sessions_destroyed', userId, {
        count
      })
    }
    
    return count
  }
  
  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): number {
    const now = Date.now()
    let cleaned = 0
    
    for (const [token, session] of sessionStore.entries()) {
      if (now - session.createdAt > SESSION_DURATION) {
        sessionStore.delete(token)
        cleaned++
      }
    }
    
    return cleaned
  }
  
  /**
   * Get session statistics
   */
  static getSessionStats() {
    const now = Date.now()
    let activeCount = 0
    let adminCount = 0
    let memberCount = 0
    
    for (const [token, session] of sessionStore.entries()) {
      if (now - session.lastActivity < INACTIVITY_TIMEOUT) {
        activeCount++
        if (session.role === 'admin') adminCount++
        if (session.role === 'member') memberCount++
      }
    }
    
    return {
      total: sessionStore.size,
      active: activeCount,
      admins: adminCount,
      members: memberCount
    }
  }
  
  /**
   * Log audit event
   */
  private static async logAuditEvent(
    action: string,
    userId: string,
    metadata?: any
  ): Promise<void> {
    try {
      await supabase
        .from('admin_audit_log')
        .insert({
          user_id: userId,
          action,
          metadata,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to log audit event:', error)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(() => {
  const cleaned = ServerSessionService.cleanupExpiredSessions()
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired sessions`)
  }
}, 5 * 60 * 1000)

/**
 * Middleware helper for Next.js API routes
 */
export async function requireAdminSession(token: string | null): Promise<{
  authorized: boolean
  session?: SessionData
  error?: string
}> {
  if (!token) {
    return {
      authorized: false,
      error: 'No token provided'
    }
  }
  
  const validation = await ServerSessionService.validateSession(token)
  
  if (!validation.valid || !validation.session) {
    return {
      authorized: false,
      error: validation.error || 'Invalid session'
    }
  }
  
  if (validation.session.role !== 'admin') {
    return {
      authorized: false,
      error: 'Admin access required'
    }
  }
  
  return {
    authorized: true,
    session: validation.session
  }
}

/**
 * Extract token from request headers
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return authHeader
}
