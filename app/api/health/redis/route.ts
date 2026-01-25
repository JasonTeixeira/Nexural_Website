import { NextResponse } from 'next/server'
import { redis, isRedisConfigured } from '@/lib/redis-client'

// Lightweight health check for Redis connectivity.
// Safe to expose (does not leak secrets); returns only boolean + latency.
export async function GET() {
  if (!isRedisConfigured()) {
    return NextResponse.json({ ok: false, configured: false }, { status: 200 })
  }

  const start = Date.now()
  try {
    // Simple ping-like operation.
    // Upstash accepts `{ ex: number }` as an option, but some clients vary.
    // We don't need TTL for a health check, so keep it simple.
    await redis.set('health:redis', 'ok')
    const v = await redis.get('health:redis')
    return NextResponse.json(
      {
        ok: true,
        configured: true,
        latencyMs: Date.now() - start,
        canReadWrite: typeof v === 'string' && v.length > 0,
      },
      { status: 200 }
    )
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, configured: true, error: e?.message || 'redis_error' },
      { status: 200 }
    )
  }
}
