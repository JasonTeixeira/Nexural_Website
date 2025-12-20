/**
 * Database Connection Pool
 * Manages Supabase connections efficiently to reduce latency
 */

import { createClient } from '@supabase/supabase-js'

// Connection pool configuration
const POOL_SIZE = 10
const MAX_IDLE_TIME = 60000 // 1 minute

interface PooledConnection {
  client: ReturnType<typeof createClient>
  lastUsed: number
  inUse: boolean
}

class DatabasePool {
  private connections: PooledConnection[] = []
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Initialize pool
    this.initializePool()
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 30000) // Every 30 seconds
  }

  /**
   * Initialize the connection pool
   */
  private initializePool(): void {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      return
    }

    for (let i = 0; i < POOL_SIZE; i++) {
      this.connections.push({
        client: createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }),
        lastUsed: Date.now(),
        inUse: false,
      })
    }

    console.log(`✅ Database pool initialized with ${POOL_SIZE} connections`)
  }

  /**
   * Get a connection from the pool
   */
  async getConnection(): Promise<ReturnType<typeof createClient>> {
    // Find available connection
    const available = this.connections.find(conn => !conn.inUse)

    if (available) {
      available.inUse = true
      available.lastUsed = Date.now()
      return available.client
    }

    // If no connections available, wait and retry
    await new Promise(resolve => setTimeout(resolve, 100))
    return this.getConnection()
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(client: ReturnType<typeof createClient>): void {
    const connection = this.connections.find(conn => conn.client === client)

    if (connection) {
      connection.inUse = false
      connection.lastUsed = Date.now()
    }
  }

  /**
   * Clean up idle connections
   */
  private cleanup(): void {
    const now = Date.now()
    
    this.connections.forEach(conn => {
      if (!conn.inUse && now - conn.lastUsed > MAX_IDLE_TIME) {
        // Mark as refreshed
        conn.lastUsed = now
      }
    })
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    total: number
    inUse: number
    available: number
  } {
    const inUse = this.connections.filter(conn => conn.inUse).length

    return {
      total: this.connections.length,
      inUse,
      available: this.connections.length - inUse,
    }
  }

  /**
   * Destroy the pool
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    
    this.connections = []
  }
}

// Singleton instance
let pool: DatabasePool | null = null

/**
 * Get the database pool instance
 */
export function getPool(): DatabasePool {
  if (!pool) {
    pool = new DatabasePool()
  }
  return pool
}

/**
 * Execute a query with automatic connection management
 */
export async function withConnection<T>(
  callback: (client: ReturnType<typeof createClient>) => Promise<T>
): Promise<T> {
  const pool = getPool()
  const client = await pool.getConnection()

  try {
    return await callback(client)
  } finally {
    pool.releaseConnection(client)
  }
}

/**
 * Health check for database connections
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await withConnection(async (client) => {
      const { error } = await client.from('members').select('count').limit(1).single()
      return !error
    })

    return result
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

/**
 * Get pool statistics
 */
export function getPoolStats() {
  return getPool().getStats()
}
