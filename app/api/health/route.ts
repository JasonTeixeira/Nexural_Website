/**
 * HEALTH CHECK ENDPOINT
 * Monitors system health and dependencies
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    database: ServiceStatus
    redis: ServiceStatus
    email: ServiceStatus
    sentry: ServiceStatus
  }
  metadata: {
    uptime: number
    memory: {
      used: number
      total: number
      percentage: number
    }
    environment: string
  }
}

interface ServiceStatus {
  status: 'up' | 'down' | 'unknown'
  responseTime?: number
  error?: string
  details?: Record<string, any>
}

export async function GET() {
  const startTime = Date.now()
  const results: Partial<HealthCheckResult> = {
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'unknown' },
      redis: { status: 'unknown' },
      email: { status: 'unknown' },
      sentry: { status: 'unknown' },
    },
  }

  // Check Database (Supabase)
  try {
    const dbStart = Date.now()
    const supabase = await createClient()
    const { error } = await supabase.from('members').select('count').limit(1)
    
    results.services!.database = {
      status: error ? 'down' : 'up',
      responseTime: Date.now() - dbStart,
      error: error?.message,
      details: {
        provider: 'Supabase',
        connected: !error,
      },
    }
  } catch (error: any) {
    results.services!.database = {
      status: 'down',
      error: error.message,
    }
  }

  // Check Redis (Upstash)
  try {
    const redisStart = Date.now()
    
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Simple ping to Redis
      const response = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
        {
          headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          },
        }
      )
      
      const isHealthy = response.ok
      results.services!.redis = {
        status: isHealthy ? 'up' : 'down',
        responseTime: Date.now() - redisStart,
        details: {
          provider: 'Upstash',
          connected: isHealthy,
        },
      }
    } else {
      results.services!.redis = {
        status: 'unknown',
        error: 'Redis not configured',
      }
    }
  } catch (error: any) {
    results.services!.redis = {
      status: 'down',
      error: error.message,
    }
  }

  // Check Email Service (Resend)
  try {
    if (process.env.RESEND_API_KEY) {
      // Check if API key is valid (quick check)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
      })
      
      results.services!.email = {
        status: response.ok || response.status === 404 ? 'up' : 'down',
        details: {
          provider: 'Resend',
          configured: true,
        },
      }
    } else {
      results.services!.email = {
        status: 'unknown',
        error: 'Email service not configured',
      }
    }
  } catch (error: any) {
    results.services!.email = {
      status: 'down',
      error: error.message,
    }
  }

  // Check Sentry
  try {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      results.services!.sentry = {
        status: 'up',
        details: {
          provider: 'Sentry',
          configured: true,
        },
      }
    } else {
      results.services!.sentry = {
        status: 'unknown',
        error: 'Sentry not configured',
      }
    }
  } catch (error: any) {
    results.services!.sentry = {
      status: 'down',
      error: error.message,
    }
  }

  // System Metadata
  const memoryUsage = process.memoryUsage()
  results.metadata = {
    uptime: process.uptime(),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    },
    environment: process.env.NODE_ENV || 'development',
  }

  // Determine overall status
  const services = results.services!
  const downServices = Object.values(services).filter(s => s.status === 'down').length
  const upServices = Object.values(services).filter(s => s.status === 'up').length

  if (downServices > 0 && upServices === 0) {
    results.status = 'unhealthy'
  } else if (downServices > 0) {
    results.status = 'degraded'
  } else {
    results.status = 'healthy'
  }

  // Set appropriate status code
  const statusCode = results.status === 'healthy' ? 200 : 
                     results.status === 'degraded' ? 207 : 503

  return NextResponse.json(results, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  })
}
