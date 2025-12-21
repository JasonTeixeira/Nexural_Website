/**
 * PROFESSIONAL IB GATEWAY CONNECTION MANAGER
 * Production-ready with auto-reconnect, health monitoring, and admin controls
 */

import { EventEmitter } from 'events'
import { createClient } from '@supabase/supabase-js'

export interface IBConnectionConfig {
  host: string
  port: number
  clientId: number
  accountId: string
  autoConnect: boolean
  maxReconnectAttempts: number
  reconnectDelayMs: number
  heartbeatIntervalMs: number
  connectionTimeoutMs: number
}

export interface IBConnectionStatus {
  state: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'
  isHealthy: boolean
  connectedAt?: Date
  lastHeartbeat?: Date
  uptime: number
  reconnectAttempts: number
  lastError?: string
  metrics: {
    totalConnections: number
    totalDisconnections: number
    totalErrors: number
    averageLatency: number
  }
}

export interface IBConnectionEvent {
  timestamp: Date
  type: 'connect' | 'disconnect' | 'error' | 'reconnect' | 'heartbeat' | 'order' | 'position'
  message: string
  data?: any
}

/**
 * Professional IB Gateway Connection Manager
 * Singleton pattern with auto-reconnect and health monitoring
 */
export class IBGatewayConnectionManager extends EventEmitter {
  private static instance: IBGatewayConnectionManager | null = null
  
  private ib: any = null
  private config: IBConnectionConfig
  private status: IBConnectionStatus
  private events: IBConnectionEvent[] = []
  private maxEvents = 100
  
  private heartbeatInterval: NodeJS.Timeout | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private connectionTimeout: NodeJS.Timeout | null = null
  
  private isManualDisconnect = false
  private isShuttingDown = false
  
  private nextOrderId = 1
  private orders = new Map<number, any>()
  private positions = new Map<string, any>()
  private accountSummary = new Map<string, any>()

  private constructor() {
    super()
    
    this.config = {
      host: process.env.IB_GATEWAY_HOST || '127.0.0.1',
      port: parseInt(process.env.IB_GATEWAY_PORT || '7497'), // Paper trading default
      clientId: parseInt(process.env.IB_GATEWAY_CLIENT_ID || '1'),
      accountId: process.env.IB_ACCOUNT_ID || 'DU123456',
      autoConnect: process.env.IB_GATEWAY_AUTO_CONNECT === 'true',
      maxReconnectAttempts: parseInt(process.env.IB_MAX_RECONNECT_ATTEMPTS || '10'),
      reconnectDelayMs: parseInt(process.env.IB_RECONNECT_DELAY_MS || '5000'),
      heartbeatIntervalMs: parseInt(process.env.IB_HEARTBEAT_INTERVAL_MS || '30000'),
      connectionTimeoutMs: parseInt(process.env.IB_CONNECTION_TIMEOUT_MS || '10000')
    }
    
    this.status = {
      state: 'disconnected',
      isHealthy: false,
      uptime: 0,
      reconnectAttempts: 0,
      metrics: {
        totalConnections: 0,
        totalDisconnections: 0,
        totalErrors: 0,
        averageLatency: 0
      }
    }
    
    this.setupProcessHandlers()
  }

  static getInstance(): IBGatewayConnectionManager {
    if (!IBGatewayConnectionManager.instance) {
      IBGatewayConnectionManager.instance = new IBGatewayConnectionManager()
    }
    return IBGatewayConnectionManager.instance
  }

  /**
   * Connect to IB Gateway
   */
  async connect(): Promise<boolean> {
    if (this.status.state === 'connected') {
      console.log('ℹ️  Already connected to IB Gateway')
      return true
    }

    if (this.status.state === 'connecting') {
      console.log('ℹ️  Connection already in progress')
      return false
    }

    this.isManualDisconnect = false
    this.status.state = 'connecting'
    this.addEvent('connect', 'Initiating connection to IB Gateway...')

    try {
      console.log(`🔌 Connecting to IB Gateway at ${this.config.host}:${this.config.port}...`)
      
      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        this.handleConnectionTimeout()
      }, this.config.connectionTimeoutMs)

      // Dynamically import @stoqey/ib
      const { IBApi, EventName, Contract, Order } = await import('@stoqey/ib')
      
      // Create IB API instance
      this.ib = new IBApi({
        host: this.config.host,
        port: this.config.port,
        clientId: this.config.clientId
      })

      // Setup IB event handlers
      this.setupIBEventHandlers(EventName)

      // Connect
      await this.ib.connect()
      
      return true

    } catch (error: any) {
      console.error('❌ Connection failed:', error)
      
      this.status.state = 'error'
      this.status.lastError = error.message
      this.status.metrics.totalErrors++
      
      this.addEvent('error', `Connection failed: ${error.message}`, { error })
      
      // Check if package is missing
      if (error.message.includes('Cannot find module')) {
        console.error('⚠️  @stoqey/ib package not found!')
        console.error('📦 Install it with: npm install @stoqey/ib')
        this.addEvent('error', '@stoqey/ib package not installed')
      }
      
      // Attempt reconnect if not manual disconnect
      if (!this.isManualDisconnect && !this.isShuttingDown) {
        this.scheduleReconnect()
      }
      
      return false
    }
  }

  /**
   * Disconnect from IB Gateway
   */
  async disconnect(manual: boolean = true): Promise<void> {
    console.log(`🔌 Disconnecting from IB Gateway${manual ? ' (manual)' : ''}...`)
    
    this.isManualDisconnect = manual
    
    // Clear all timers
    this.clearAllTimers()
    
    // Disconnect from IB
    if (this.ib) {
      try {
        this.ib.disconnect()
      } catch (error) {
        console.error('Error during disconnect:', error)
      }
      this.ib = null
    }
    
    // Update status
    this.status.state = 'disconnected'
    this.status.isHealthy = false
    this.status.connectedAt = undefined
    this.status.lastHeartbeat = undefined
    
    // Clear data
    this.orders.clear()
    this.positions.clear()
    this.accountSummary.clear()
    
    this.addEvent('disconnect', manual ? 'Manually disconnected' : 'Disconnected')
    this.emit('disconnected', { manual })
  }

  /**
   * Get current connection status
   */
  getStatus(): IBConnectionStatus {
    // Calculate uptime
    if (this.status.connectedAt) {
      this.status.uptime = Date.now() - this.status.connectedAt.getTime()
    } else {
      this.status.uptime = 0
    }
    
    return { ...this.status }
  }

  /**
   * Get recent events
   */
  getEvents(limit: number = 100): IBConnectionEvent[] {
    return this.events.slice(-limit)
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<boolean> {
    if (this.status.state !== 'connected' || !this.ib) {
      return false
    }

    try {
      // Request current time to test connection
      this.ib.reqCurrentTime()
      
      // Check if last heartbeat was recent
      if (this.status.lastHeartbeat) {
        const timeSinceHeartbeat = Date.now() - this.status.lastHeartbeat.getTime()
        if (timeSinceHeartbeat > this.config.heartbeatIntervalMs * 2) {
          console.warn('⚠️  Heartbeat timeout detected')
          return false
        }
      }
      
      this.status.isHealthy = true
      return true

    } catch (error) {
      console.error('❌ Health check failed:', error)
      this.status.isHealthy = false
      return false
    }
  }

  /**
   * Get positions
   */
  getPositions(): any[] {
    return Array.from(this.positions.values())
  }

  /**
   * Get account summary
   */
  getAccountSummary(): any[] {
    return Array.from(this.accountSummary.values())
  }

  /**
   * Get orders
   */
  getOrders(): any[] {
    return Array.from(this.orders.values())
  }

  /**
   * Setup IB event handlers
   */
  private setupIBEventHandlers(EventName: any): void {
    if (!this.ib) return

    this.ib.on(EventName.connected, () => {
      this.clearConnectionTimeout()
      
      console.log('✅ Successfully connected to IB Gateway')
      
      this.status.state = 'connected'
      this.status.isHealthy = true
      this.status.connectedAt = new Date()
      this.status.reconnectAttempts = 0
      this.status.metrics.totalConnections++
      
      this.addEvent('connect', 'Successfully connected to IB Gateway')
      this.emit('connected')
      
      // Start heartbeat
      this.startHeartbeat()
      
      // Request initial data
      this.ib.reqIds()
      this.ib.reqAccountUpdates(true, this.config.accountId)
      this.ib.reqPositions()
      
      // Log to database
      this.logConnectionEvent('connected')
    })

    this.ib.on(EventName.disconnected, () => {
      console.log('❌ Disconnected from IB Gateway')
      
      this.status.state = 'disconnected'
      this.status.isHealthy = false
      this.status.metrics.totalDisconnections++
      
      this.stopHeartbeat()
      this.addEvent('disconnect', 'Disconnected from IB Gateway')
      this.emit('disconnected', { manual: this.isManualDisconnect })
      
      // Log to database
      this.logConnectionEvent('disconnected')
      
      // Attempt reconnect if not manual
      if (!this.isManualDisconnect && !this.isShuttingDown) {
        this.scheduleReconnect()
      }
    })

    this.ib.on(EventName.error, (err: Error, code: number, reqId: number) => {
      console.error(`IB Error ${code}:`, err.message)
      
      this.status.lastError = `${code}: ${err.message}`
      this.status.metrics.totalErrors++
      
      this.addEvent('error', `Error ${code}: ${err.message}`, { code, reqId })
      this.emit('error', { error: err, code, reqId })
    })

    this.ib.on(EventName.nextValidId, (orderId: number) => {
      console.log(`📋 Next valid order ID: ${orderId}`)
      this.nextOrderId = orderId
    })

    this.ib.on(EventName.orderStatus, (
      orderId: number,
      status: string,
      filled: number,
      remaining: number,
      avgFillPrice: number
    ) => {
      console.log(`📊 Order ${orderId}: ${status}`)
      this.addEvent('order', `Order ${orderId}: ${status}`, { orderId, status, filled, remaining })
      this.emit('orderStatus', { orderId, status, filled, remaining, avgFillPrice })
    })

    this.ib.on(EventName.position, (
      account: string,
      contract: any,
      pos: number,
      avgCost: number
    ) => {
      const key = `${account}_${contract.symbol}`
      this.positions.set(key, {
        account,
        contract,
        position: pos,
        averageCost: avgCost
      })
      
      this.addEvent('position', `Position: ${contract.symbol} = ${pos}`)
      this.emit('position', this.positions.get(key))
    })

    this.ib.on(EventName.accountSummary, (
      reqId: number,
      account: string,
      tag: string,
      value: string,
      currency: string
    ) => {
      const key = `${account}_${tag}`
      this.accountSummary.set(key, { account, tag, value, currency })
    })
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()
    
    this.heartbeatInterval = setInterval(() => {
      if (this.status.state === 'connected' && this.ib) {
        try {
          this.ib.reqCurrentTime()
          this.status.lastHeartbeat = new Date()
          this.addEvent('heartbeat', 'Heartbeat sent')
        } catch (error) {
          console.error('❌ Heartbeat failed:', error)
          this.status.isHealthy = false
        }
      }
    }, this.config.heartbeatIntervalMs)
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.status.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      this.status.state = 'error'
      this.addEvent('error', 'Max reconnection attempts reached')
      return
    }

    this.status.reconnectAttempts++
    this.status.state = 'reconnecting'
    
    // Exponential backoff
    const delay = this.config.reconnectDelayMs * Math.pow(2, this.status.reconnectAttempts - 1)
    
    console.log(`🔄 Scheduling reconnect attempt ${this.status.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms...`)
    this.addEvent('reconnect', `Reconnect attempt ${this.status.reconnectAttempts} scheduled`)
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  /**
   * Handle connection timeout
   */
  private handleConnectionTimeout(): void {
    console.error('❌ Connection timeout')
    
    this.status.state = 'error'
    this.status.lastError = 'Connection timeout'
    this.status.metrics.totalErrors++
    
    this.addEvent('error', 'Connection timeout')
    
    if (this.ib) {
      this.ib.disconnect()
      this.ib = null
    }
    
    if (!this.isManualDisconnect && !this.isShuttingDown) {
      this.scheduleReconnect()
    }
  }

  /**
   * Clear connection timeout
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
  }

  /**
   * Clear all timers
   */
  private clearAllTimers(): void {
    this.stopHeartbeat()
    this.clearConnectionTimeout()
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  /**
   * Add event to history
   */
  private addEvent(type: IBConnectionEvent['type'], message: string, data?: any): void {
    const event: IBConnectionEvent = {
      timestamp: new Date(),
      type,
      message,
      data
    }
    
    this.events.push(event)
    
    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
    
    // Emit event
    this.emit('event', event)
  }

  /**
   * Log connection event to database
   */
  private async logConnectionEvent(event: 'connected' | 'disconnected'): Promise<void> {
    try {
      // Only log if env vars are available (skip during build)
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return
      }
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      
      await supabase.from('ib_gateway_status').insert({
        event,
        host: this.config.host,
        port: this.config.port,
        client_id: this.config.clientId,
        account_id: this.config.accountId,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to log connection event:', error)
    }
  }

  /**
   * Setup process handlers for graceful shutdown
   */
  private setupProcessHandlers(): void {
    const shutdown = async () => {
      console.log('\n🛑 Shutting down IB Gateway connection...')
      this.isShuttingDown = true
      await this.disconnect(false)
      process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  }

  /**
   * Initialize (auto-connect if enabled)
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing IB Gateway Connection Manager')
    console.log(`   Auto-connect: ${this.config.autoConnect}`)
    console.log(`   Host: ${this.config.host}:${this.config.port}`)
    console.log(`   Account: ${this.config.accountId}`)
    
    if (this.config.autoConnect) {
      console.log('🔌 Auto-connecting to IB Gateway...')
      await this.connect()
    }
  }
}

// Export singleton instance
export const ibGatewayManager = IBGatewayConnectionManager.getInstance()

// Export convenience functions
export async function connectToIBGateway(): Promise<boolean> {
  return await ibGatewayManager.connect()
}

export async function disconnectFromIBGateway(manual: boolean = true): Promise<void> {
  return await ibGatewayManager.disconnect(manual)
}

export function getIBGatewayStatus(): IBConnectionStatus {
  return ibGatewayManager.getStatus()
}

export async function performIBHealthCheck(): Promise<boolean> {
  return await ibGatewayManager.healthCheck()
}

export function getIBGatewayEvents(limit?: number): IBConnectionEvent[] {
  return ibGatewayManager.getEvents(limit)
}
