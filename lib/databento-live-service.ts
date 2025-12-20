/**
 * Databento Live Service
 * Maintains 24/7 connection to Databento and saves data to database
 */

import { getDatabentoClient } from './databento-raw-client'
import { createClient } from '@supabase/supabase-js'
import { EventEmitter } from 'events'

export class DatabentoLiveService extends EventEmitter {
  private client: any
  private supabase: any
  private isRunning = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private recordCount = 0
  private startTime: Date | null = null
  private lastHeartbeat: Date = new Date()
  
  constructor() {
    super()
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  
  async start() {
    console.log('🚀 Starting Databento live data collection service...')
    console.log('=' .repeat(60))
    
    this.startTime = new Date()
    this.client = getDatabentoClient()
    
    try {
      // Connect to Databento
      console.log('📡 Connecting to Databento...')
      await this.client.connect()
      
      // Subscribe to all 21 futures symbols
      console.log('📊 Subscribing to 21 futures symbols...')
      await this.client.subscribeToAllFutures('trades')
      
      // Start session (begins data flow)
      console.log('🎬 Starting data session...')
      this.client.startSession()
      
      // Set up event handlers
      this.setupEventHandlers()
      
      this.isRunning = true
      this.reconnectAttempts = 0
      
      console.log('✅ Databento live service started successfully!')
      console.log('📊 Now collecting data for 21 symbols...')
      
      // Start heartbeat
      this.startHeartbeat()
      
      // Emit started event
      this.emit('started')
      
    } catch (error: any) {
      console.error('❌ Failed to start Databento service:', error.message)
      this.handleReconnect()
    }
  }
  
  private setupEventHandlers() {
    // Handle incoming data
    this.client.on('data', async (record: any) => {
      await this.handleMarketData(record)
    })
    
    // Handle errors
    this.client.on('error', (error: Error) => {
      console.error('❌ Databento error:', error.message)
      this.emit('error', error)
      this.handleReconnect()
    })
    
    // Handle disconnections
    this.client.on('disconnected', () => {
      console.log('📊 Disconnected from Databento')
      this.isRunning = false
      this.emit('disconnected')
      this.handleReconnect()
    })
    
    // Handle authentication
    this.client.on('authenticated', () => {
      console.log('✅ Authenticated with Databento')
      this.emit('authenticated')
    })
  }
  
  private async handleMarketData(record: any) {
    try {
      // Save to database
      await this.supabase.from('live_market_data').insert({
        symbol: record.symbol,
        price: record.price / 1e9, // Databento uses fixed-point
        volume: record.volume || 0,
        timestamp: new Date(record.ts_event / 1000000), // Nanoseconds to milliseconds
        bid: record.bid_px ? record.bid_px / 1e9 : null,
        ask: record.ask_px ? record.ask_px / 1e9 : null,
        open: record.open ? record.open / 1e9 : null,
        high: record.high ? record.high / 1e9 : null,
        low: record.low ? record.low / 1e9 : null,
        close: record.close ? record.close / 1e9 : null,
        created_at: new Date().toISOString()
      })
      
      this.recordCount++
      this.lastHeartbeat = new Date()
      
      // Log every 100 records
      if (this.recordCount % 100 === 0) {
        console.log(`📊 Saved ${this.recordCount} records | Latest: ${record.symbol} @ $${(record.price / 1e9).toFixed(2)}`)
      }
      
      // Emit data event
      this.emit('data', record)
      
    } catch (error: any) {
      console.error('❌ Error saving market data:', error.message)
      this.emit('save_error', error)
    }
  }
  
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Service stopped.')
      this.emit('max_reconnects')
      return
    }
    
    this.reconnectAttempts++
    const delay = Math.min(5000 * this.reconnectAttempts, 60000) // Max 1 minute
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    
    setTimeout(() => {
      console.log('🔄 Attempting to reconnect...')
      this.start()
    }, delay)
  }
  
  private startHeartbeat() {
    // Log status every minute
    setInterval(() => {
      if (this.isRunning) {
        const uptime = this.getUptime()
        const rate = this.getRecordsPerMinute()
        console.log(`💓 Service alive | Uptime: ${uptime} | Records: ${this.recordCount} | Rate: ${rate}/min`)
        this.emit('heartbeat', {
          uptime,
          recordCount: this.recordCount,
          rate,
          isRunning: this.isRunning
        })
      }
    }, 60000) // Every minute
  }
  
  private getUptime(): string {
    if (!this.startTime) return 'N/A'
    
    const now = new Date()
    const diff = now.getTime() - this.startTime.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }
  
  private getRecordsPerMinute(): number {
    if (!this.startTime) return 0
    
    const now = new Date()
    const minutes = (now.getTime() - this.startTime.getTime()) / (1000 * 60)
    
    return Math.round(this.recordCount / minutes)
  }
  
  stop() {
    console.log('🛑 Stopping Databento service...')
    this.isRunning = false
    this.client?.disconnect()
    this.emit('stopped')
    console.log('✅ Service stopped')
  }
  
  getStatus() {
    return {
      isRunning: this.isRunning,
      uptime: this.getUptime(),
      recordCount: this.recordCount,
      recordsPerMinute: this.getRecordsPerMinute(),
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat
    }
  }
}

// Singleton instance
let liveService: DatabentoLiveService | null = null

export function getDatabentoLiveService(): DatabentoLiveService {
  if (!liveService) {
    liveService = new DatabentoLiveService()
  }
  return liveService
}
