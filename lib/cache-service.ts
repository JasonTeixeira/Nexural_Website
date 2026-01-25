/**
 * CACHE SERVICE
 * Production-ready caching layer using Redis
 * Handles query caching, invalidation, and TTL management
 */

import { Redis } from '@upstash/redis'

// =============================================================================
// CONFIGURATION
// =============================================================================

// Initialize Redis client (lazy loaded)
let redis: Redis | null = null

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[CACHE] Redis not configured - caching disabled')
    return null
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }

  return redis
}

// Cache TTL (Time To Live) in seconds
export const CacheTTL = {
  VERY_SHORT: 30,        // 30 seconds - live data
  SHORT: 60,             // 1 minute - frequently changing
  MEDIUM: 300,           // 5 minutes - moderately dynamic
  LONG: 900,             // 15 minutes - semi-static
  VERY_LONG: 3600,       // 1 hour - mostly static
  DAY: 86400,            // 24 hours - rarely changing
  WEEK: 604800,          // 7 days - static content
} as const

// Cache key prefixes for organization
export const CachePrefix = {
  USER: 'user',
  POSITION: 'position',
  PORTFOLIO: 'portfolio',
  STATS: 'stats',
  LEADERBOARD: 'leaderboard',
  MARKET_DATA: 'market',
  ANALYTICS: 'analytics',
  COMMUNITY: 'community',
  NOTIFICATIONS: 'notifications',
} as const

// =============================================================================
// IN-MEMORY FALLBACK CACHE (for development)
// =============================================================================

class InMemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup expired entries every minute
    // Avoid keeping Jest alive with open handles.
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)

    // `unref()` tells Node this timer should not keep the process running.
    // Safe in production/serverless and fixes Jest open-handle warnings.
    this.cleanupInterval.unref?.()
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key)
      }
    }
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (entry.expiry < Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value
  }

  set(key: string, value: any, ttl: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.cache.clear()
  }
}

const memoryCache = new InMemoryCache()

// =============================================================================
// CACHE SERVICE
// =============================================================================

export class CacheService {
  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedis()
      
      if (!client) {
        // Fallback to memory cache
        return memoryCache.get(key)
      }

      const value = await client.get(key)
      
      if (value === null || value === undefined) {
        return null
      }

      return value as T
    } catch (error) {
      console.error('[CACHE] Get error:', error)
      return null
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set(key: string, value: any, ttl: number = CacheTTL.MEDIUM): Promise<boolean> {
    try {
      const client = getRedis()
      
      if (!client) {
        // Fallback to memory cache
        memoryCache.set(key, value, ttl)
        return true
      }

      await client.setex(key, ttl, value)
      return true
    } catch (error) {
      console.error('[CACHE] Set error:', error)
      return false
    }
  }

  /**
   * Delete specific key
   */
  static async delete(key: string): Promise<boolean> {
    try {
      const client = getRedis()
      
      if (!client) {
        memoryCache.delete(key)
        return true
      }

      await client.del(key)
      return true
    } catch (error) {
      console.error('[CACHE] Delete error:', error)
      return false
    }
  }

  /**
   * Delete keys matching pattern
   */
  static async deletePattern(pattern: string): Promise<boolean> {
    try {
      const client = getRedis()
      
      if (!client) {
        memoryCache.deletePattern(pattern)
        return true
      }

      // Upstash Redis doesn't support SCAN, so we'll use a list of keys
      // In production, you might want to maintain a set of active keys
      console.warn('[CACHE] Pattern deletion not fully supported on Upstash')
      return true
    } catch (error) {
      console.error('[CACHE] Delete pattern error:', error)
      return false
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const client = getRedis()
      
      if (!client) {
        return memoryCache.get(key) !== null
      }

      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      console.error('[CACHE] Exists error:', error)
      return false
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }

      // Cache miss - fetch data
      const data = await fetcher()

      // Store in cache
      await this.set(key, data, ttl)

      return data
    } catch (error) {
      console.error('[CACHE] GetOrSet error:', error)
      // On error, just fetch without caching
      return await fetcher()
    }
  }

  /**
   * Increment counter
   */
  static async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const client = getRedis()
      
      if (!client) {
        const current = memoryCache.get(key) || 0
        const newValue = current + amount
        memoryCache.set(key, newValue, CacheTTL.VERY_LONG)
        return newValue
      }

      return await client.incrby(key, amount)
    } catch (error) {
      console.error('[CACHE] Increment error:', error)
      return 0
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  static async clear(): Promise<boolean> {
    try {
      const client = getRedis()
      
      if (!client) {
        memoryCache.clear()
        return true
      }

      // Note: Upstash Redis doesn't support FLUSHALL
      // You'll need to manage keys manually or use a different strategy
      console.warn('[CACHE] Full cache clear not supported on Upstash')
      return true
    } catch (error) {
      console.error('[CACHE] Clear error:', error)
      return false
    }
  }

  /**
   * Get cache statistics
   */
  static async stats(): Promise<{
    enabled: boolean
    backend: 'redis' | 'memory'
    size?: number
  }> {
    const client = getRedis()
    
    if (!client) {
      return {
        enabled: true,
        backend: 'memory',
        size: memoryCache.size(),
      }
    }

    return {
      enabled: true,
      backend: 'redis',
    }
  }
}

// =============================================================================
// CACHE KEY GENERATORS
// =============================================================================

export const CacheKeys = {
  // User caching
  user: (userId: string) => `${CachePrefix.USER}:${userId}`,
  userProfile: (userId: string) => `${CachePrefix.USER}:profile:${userId}`,
  userStats: (userId: string) => `${CachePrefix.USER}:stats:${userId}`,
  userFollowers: (userId: string) => `${CachePrefix.USER}:followers:${userId}`,
  userFollowing: (userId: string) => `${CachePrefix.USER}:following:${userId}`,

  // Position caching
  position: (positionId: string) => `${CachePrefix.POSITION}:${positionId}`,
  positions: (userId: string) => `${CachePrefix.POSITION}:list:${userId}`,
  positionsBySymbol: (symbol: string) => `${CachePrefix.POSITION}:symbol:${symbol}`,
  activePositions: () => `${CachePrefix.POSITION}:active`,

  // Portfolio caching
  portfolio: (userId: string) => `${CachePrefix.PORTFOLIO}:${userId}`,
  portfolioStats: (userId: string) => `${CachePrefix.PORTFOLIO}:stats:${userId}`,
  portfolioPerformance: (userId: string) => `${CachePrefix.PORTFOLIO}:performance:${userId}`,

  // Stats & Analytics
  globalStats: () => `${CachePrefix.STATS}:global`,
  userRank: (userId: string) => `${CachePrefix.STATS}:rank:${userId}`,
  leaderboard: (period: string = 'all') => `${CachePrefix.LEADERBOARD}:${period}`,
  topTraders: (limit: number = 10) => `${CachePrefix.STATS}:top:${limit}`,

  // Market data
  marketData: (symbol: string) => `${CachePrefix.MARKET_DATA}:${symbol}`,
  marketStatus: () => `${CachePrefix.MARKET_DATA}:status`,
  quotes: (symbols: string[]) => `${CachePrefix.MARKET_DATA}:quotes:${symbols.join(',')}`,

  // Community
  activityFeed: (userId?: string) => 
    userId ? `${CachePrefix.COMMUNITY}:feed:${userId}` : `${CachePrefix.COMMUNITY}:feed:global`,
  trending: () => `${CachePrefix.COMMUNITY}:trending`,

  // Notifications
  notifications: (userId: string) => `${CachePrefix.NOTIFICATIONS}:${userId}`,
  unreadCount: (userId: string) => `${CachePrefix.NOTIFICATIONS}:unread:${userId}`,
}

// =============================================================================
// CACHE INVALIDATION HELPERS
// =============================================================================

export const CacheInvalidation = {
  /**
   * Invalidate user-related caches
   */
  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      CacheService.delete(CacheKeys.user(userId)),
      CacheService.delete(CacheKeys.userProfile(userId)),
      CacheService.delete(CacheKeys.userStats(userId)),
      CacheService.delete(CacheKeys.portfolio(userId)),
      CacheService.delete(CacheKeys.portfolioStats(userId)),
    ])
  },

  /**
   * Invalidate position-related caches
   */
  async invalidatePosition(positionId: string, userId: string, symbol?: string): Promise<void> {
    await Promise.all([
      CacheService.delete(CacheKeys.position(positionId)),
      CacheService.delete(CacheKeys.positions(userId)),
      CacheService.delete(CacheKeys.portfolio(userId)),
      CacheService.delete(CacheKeys.portfolioStats(userId)),
      CacheService.delete(CacheKeys.activePositions()),
      symbol ? CacheService.delete(CacheKeys.positionsBySymbol(symbol)) : Promise.resolve(),
    ])
  },

  /**
   * Invalidate leaderboard caches
   */
  async invalidateLeaderboard(): Promise<void> {
    await Promise.all([
      CacheService.delete(CacheKeys.leaderboard('all')),
      CacheService.delete(CacheKeys.leaderboard('month')),
      CacheService.delete(CacheKeys.leaderboard('week')),
      CacheService.delete(CacheKeys.globalStats()),
    ])
  },

  /**
   * Invalidate community feed
   */
  async invalidateCommunity(userId?: string): Promise<void> {
    await Promise.all([
      CacheService.delete(CacheKeys.activityFeed(userId)),
      CacheService.delete(CacheKeys.activityFeed()),
      CacheService.delete(CacheKeys.trending()),
    ])
  },
}

// =============================================================================
// EXPORTS
// =============================================================================

export default CacheService

// Named exports for convenience
export const {
  get: getCache,
  set: setCache,
  delete: deleteCache,
  getOrSet: getCachedOrFetch,
  exists: cacheExists,
  increment: incrementCache,
  clear: clearCache,
  stats: cacheStats,
} = CacheService
