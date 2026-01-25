import { CacheService } from '@/lib/cache-service'

/**
 * Small helper to add Redis-backed caching to API routes with consistent
 * headers for observability.
 */
export async function withApiCache<T>(opts: {
  key: string
  ttlSeconds: number
  compute: () => Promise<T>
  responseInit?: ResponseInit
}): Promise<Response> {
  const cached = await CacheService.get<T>(opts.key)
  if (cached !== null) {
    return Response.json(cached as any, {
      ...(opts.responseInit || {}),
      headers: {
        ...(opts.responseInit?.headers || {}),
        'X-Cache': 'HIT',
        'X-Cache-Key': opts.key,
      },
    })
  }

  const start = Date.now()
  const data = await opts.compute()
  await CacheService.set(opts.key, data, opts.ttlSeconds)

  return Response.json(data as any, {
    ...(opts.responseInit || {}),
    headers: {
      ...(opts.responseInit?.headers || {}),
      'X-Cache': 'MISS',
      'X-Cache-Key': opts.key,
      'X-Compute-Ms': String(Date.now() - start),
    },
  })
}
