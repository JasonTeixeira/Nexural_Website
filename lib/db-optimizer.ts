/**
 * DATABASE QUERY OPTIMIZER
 * Optimizes Supabase queries with caching, batching, and performance monitoring
 */

import { SupabaseClient } from '@supabase/supabase-js'
import CacheService, { CacheTTL, CacheKeys } from './cache-service'
import ErrorHandler, { ErrorSeverity } from './error-handler'

// =============================================================================
// QUERY PERFORMANCE MONITORING
// =============================================================================

interface QueryMetrics {
  query: string
  duration: number
  cached: boolean
  timestamp: number
}

class QueryMonitor {
  private metrics: QueryMetrics[] = []
  private maxMetrics = 1000

  log(query: string, duration: number, cached: boolean = false) {
    this.metrics.push({
      query,
      duration,
      cached,
      timestamp: Date.now(),
    })

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow queries (over 1 second)
    if (duration > 1000 && !cached) {
      console.warn(`[DB] Slow query detected (${duration}ms):`, query)
      ErrorHandler.logWarning(`Slow database query: ${duration}ms`, {
        action: 'database_query',
        additionalData: { query, duration },
      })
    }
  }

  getStats() {
    const total = this.metrics.length
    const cached = this.metrics.filter(m => m.cached).length
    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / total || 0
    const slowQueries = this.metrics.filter(m => m.duration > 1000 && !m.cached)

    return {
      total,
      cached,
      cacheHitRate: total > 0 ? (cached / total * 100).toFixed(2) + '%' : '0%',
      avgDuration: avgDuration.toFixed(2) + 'ms',
      slowQueries: slowQueries.length,
    }
  }

  clear() {
    this.metrics = []
  }
}

const queryMonitor = new QueryMonitor()

// =============================================================================
// DATABASE QUERY OPTIMIZER
// =============================================================================

export class DatabaseOptimizer {
  /**
   * Execute cached query
   */
  static async cachedQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM
  ): Promise<T> {
    const startTime = Date.now()

    try {
      // Try to get from cache
      const cached = await CacheService.get<T>(cacheKey)
      
      if (cached !== null) {
        const duration = Date.now() - startTime
        queryMonitor.log(cacheKey, duration, true)
        return cached
      }

      // Cache miss - execute query
      const data = await queryFn()
      const duration = Date.now() - startTime

      // Store in cache
      await CacheService.set(cacheKey, data, ttl)
      queryMonitor.log(cacheKey, duration, false)

      return data
    } catch (error) {
      console.error('[DB] Cached query error:', error)
      ErrorHandler.report(
        error instanceof Error ? error : new Error(String(error)),
        { action: 'cached_query', additionalData: { cacheKey } },
        ErrorSeverity.HIGH
      )
      throw error
    }
  }

  /**
   * Batch multiple queries together
   */
  static async batchQueries<T extends Record<string, any>>(
    queries: Record<string, () => Promise<any>>
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const results = await Promise.all(
        Object.entries(queries).map(async ([key, queryFn]) => {
          const data = await queryFn()
          return [key, data]
        })
      )

      const duration = Date.now() - startTime
      queryMonitor.log('batch_query', duration, false)

      return Object.fromEntries(results) as T
    } catch (error) {
      console.error('[DB] Batch query error:', error)
      throw error
    }
  }

  /**
   * Paginated query with caching
   */
  static async paginatedQuery<T>(
    supabase: SupabaseClient,
    table: string,
    options: {
      page?: number
      limit?: number
      orderBy?: string
      orderDirection?: 'asc' | 'desc'
      filters?: Record<string, any>
      select?: string
      cacheTTL?: number
    } = {}
  ): Promise<{ data: T[]; total: number; page: number; pages: number }> {
    const {
      page = 1,
      limit = 20,
      orderBy = 'created_at',
      orderDirection = 'desc',
      filters = {},
      select = '*',
      cacheTTL = CacheTTL.SHORT,
    } = options

    const startTime = Date.now()
    const cacheKey = `paginated:${table}:${page}:${limit}:${orderBy}:${JSON.stringify(filters)}`

    try {
      // Check cache first
      const cached = await CacheService.get<any>(cacheKey)
      if (cached) {
        queryMonitor.log(cacheKey, Date.now() - startTime, true)
        return cached
      }

      // Calculate offset
      const from = (page - 1) * limit
      const to = from + limit - 1

      // Build query
      let query = supabase
        .from(table)
        .select(select, { count: 'exact' })
        .range(from, to)
        .order(orderBy, { ascending: orderDirection === 'asc' })

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      // Execute query
      const { data, error, count } = await query

      if (error) throw error

      const result = {
        data: data as T[],
        total: count || 0,
        page,
        pages: Math.ceil((count || 0) / limit),
      }

      // Cache result
      await CacheService.set(cacheKey, result, cacheTTL)
      queryMonitor.log(cacheKey, Date.now() - startTime, false)

      return result
    } catch (error) {
      console.error('[DB] Paginated query error:', error)
      throw error
    }
  }

  /**
   * Optimized single row fetch
   */
  static async getById<T>(
    supabase: SupabaseClient,
    table: string,
    id: string,
    options: {
      select?: string
      cacheTTL?: number
    } = {}
  ): Promise<T | null> {
    const { select = '*', cacheTTL = CacheTTL.MEDIUM } = options
    const cacheKey = `${table}:${id}`

    return this.cachedQuery(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from(table)
          .select(select)
          .eq('id', id)
          .single()

        if (error) throw error
        return data as T
      },
      cacheTTL
    )
  }

  /**
   * Bulk fetch by IDs (optimized)
   */
  static async getByIds<T>(
    supabase: SupabaseClient,
    table: string,
    ids: string[],
    options: {
      select?: string
      cacheTTL?: number
    } = {}
  ): Promise<T[]> {
    const { select = '*', cacheTTL = CacheTTL.MEDIUM } = options
    
    if (ids.length === 0) return []

    const cacheKey = `${table}:bulk:${ids.sort().join(',')}`

    return this.cachedQuery(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from(table)
          .select(select)
          .in('id', ids)

        if (error) throw error
        return data as T[]
      },
      cacheTTL
    )
  }

  /**
   * Count query with caching
   */
  static async count(
    supabase: SupabaseClient,
    table: string,
    filters: Record<string, any> = {},
    cacheTTL: number = CacheTTL.SHORT
  ): Promise<number> {
    const cacheKey = `count:${table}:${JSON.stringify(filters)}`

    return this.cachedQuery(
      cacheKey,
      async () => {
        let query = supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })

        const { count, error } = await query

        if (error) throw error
        return count || 0
      },
      cacheTTL
    )
  }

  /**
   * Search with full-text search optimization
   */
  static async search<T>(
    supabase: SupabaseClient,
    table: string,
    searchColumn: string,
    searchTerm: string,
    options: {
      limit?: number
      select?: string
      filters?: Record<string, any>
    } = {}
  ): Promise<T[]> {
    const { limit = 20, select = '*', filters = {} } = options
    const startTime = Date.now()

    try {
      let query = supabase
        .from(table)
        .select(select)
        .ilike(searchColumn, `%${searchTerm}%`)
        .limit(limit)

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      const { data, error } = await query

      if (error) throw error

      queryMonitor.log(`search:${table}:${searchColumn}`, Date.now() - startTime, false)
      return data as T[]
    } catch (error) {
      console.error('[DB] Search error:', error)
      throw error
    }
  }

  /**
   * Aggregate query with caching
   */
  static async aggregate(
    supabase: SupabaseClient,
    table: string,
    aggregations: {
      sum?: string[]
      avg?: string[]
      min?: string[]
      max?: string[]
    },
    filters: Record<string, any> = {},
    cacheTTL: number = CacheTTL.MEDIUM
  ): Promise<Record<string, number>> {
    const cacheKey = `aggregate:${table}:${JSON.stringify(aggregations)}:${JSON.stringify(filters)}`

    return this.cachedQuery(
      cacheKey,
      async () => {
        // Note: Supabase doesn't have native aggregate functions
        // You'll need to use PostgreSQL functions or do client-side aggregation
        // This is a placeholder for the implementation
        
        let query = supabase.from(table).select('*')
        
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })

        const { data, error } = await query

        if (error) throw error

        // Client-side aggregation
        const results: Record<string, number> = {}

        aggregations.sum?.forEach(field => {
          results[`sum_${field}`] = data.reduce((sum, row) => sum + (row[field] || 0), 0)
        })

        aggregations.avg?.forEach(field => {
          const sum = data.reduce((sum, row) => sum + (row[field] || 0), 0)
          results[`avg_${field}`] = data.length > 0 ? sum / data.length : 0
        })

        aggregations.min?.forEach(field => {
          results[`min_${field}`] = Math.min(...data.map(row => row[field] || Infinity))
        })

        aggregations.max?.forEach(field => {
          results[`max_${field}`] = Math.max(...data.map(row => row[field] || -Infinity))
        })

        return results
      },
      cacheTTL
    )
  }

  /**
   * Get query performance stats
   */
  static getPerformanceStats() {
    return queryMonitor.getStats()
  }

  /**
   * Clear query metrics
   */
  static clearMetrics() {
    queryMonitor.clear()
  }
}

// =============================================================================
// QUERY BUILDER HELPERS
// =============================================================================

export class QueryBuilder {
  /**
   * Build optimized select clause
   */
  static buildSelect(fields: string[], relations?: string[]): string {
    const baseFields = fields.join(', ')
    
    if (!relations || relations.length === 0) {
      return baseFields
    }

    const relationFields = relations.map(rel => `${rel}(*)`).join(', ')
    return `${baseFields}, ${relationFields}`
  }

  /**
   * Build filter clause
   */
  static applyFilters(
    query: any,
    filters: Record<string, any>
  ) {
    let filteredQuery = query

    Object.entries(filters).forEach(([key, value]) => {
      if (value === null) {
        filteredQuery = filteredQuery.is(key, null)
      } else if (Array.isArray(value)) {
        filteredQuery = filteredQuery.in(key, value)
      } else if (typeof value === 'object' && value.operator) {
        // Advanced operators: { operator: 'gt', value: 10 }
        switch (value.operator) {
          case 'gt':
            filteredQuery = filteredQuery.gt(key, value.value)
            break
          case 'gte':
            filteredQuery = filteredQuery.gte(key, value.value)
            break
          case 'lt':
            filteredQuery = filteredQuery.lt(key, value.value)
            break
          case 'lte':
            filteredQuery = filteredQuery.lte(key, value.value)
            break
          case 'like':
            filteredQuery = filteredQuery.ilike(key, value.value)
            break
          case 'not':
            filteredQuery = filteredQuery.neq(key, value.value)
            break
        }
      } else {
        filteredQuery = filteredQuery.eq(key, value)
      }
    })

    return filteredQuery
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default DatabaseOptimizer

// Named exports
export const {
  cachedQuery,
  batchQueries,
  paginatedQuery,
  getById,
  getByIds,
  count,
  search,
  aggregate,
  getPerformanceStats,
  clearMetrics,
} = DatabaseOptimizer
