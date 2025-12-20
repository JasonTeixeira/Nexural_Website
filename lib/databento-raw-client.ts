// Databento RAW TCP Client - Correct Implementation
// Uses TCP sockets with CRAM authentication and control message protocol

import { Socket } from 'net'
import { createHash } from 'crypto'
import { EventEmitter } from 'events'

interface DatabentoConfig {
  apiKey: string
  dataset: string
  encoding?: 'dbn' | 'json'
  compression?: 'none' | 'zstd'
  tsOut?: boolean
  heartbeatIntervalS?: number
}

interface Subscription {
  schema: string
  symbols: string[]
  stypeIn?: string
  start?: string | number
  snapshot?: boolean
}

export class DatabentoRawClient extends EventEmitter {
  private socket: Socket | null = null
  private config: DatabentoConfig
  private host: string
  private port: number = 13000
  private isAuthenticated = false
  private sessionStarted = false
  private buffer: Buffer = Buffer.alloc(0)
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 5000

  // Futures symbol mapping
  private readonly FUTURES_SYMBOLS = [
    'ES', 'NQ', 'YM', 'RTY',  // Equity indices
    'CL', 'NG',                // Energy
    'GC', 'SI', 'HG',          // Metals
    'ZC', 'ZS', 'ZW',          // Agriculture
    'ZN', 'ZB',                // Bonds
    '6E', '6J', '6B',          // FX (original)
    '6A', '6C', '6S',          // FX (new: AUD, CAD, CHF)
    'VX'                       // Volatility
  ]

  constructor(config: DatabentoConfig) {
    super()
    this.config = {
      encoding: 'dbn',
      compression: 'none',
      tsOut: false,
      heartbeatIntervalS: 30,
      ...config
    }

    // Convert dataset to hostname: GLBX.MDP3 -> glbx-mdp3.lsg.databento.com
    this.host = config.dataset.toLowerCase().replace('.', '-') + '.lsg.databento.com'
    
    console.log(`📊 Databento RAW client initialized for ${config.dataset}`)
    console.log(`📡 Will connect to: ${this.host}:${this.port}`)
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`📊 Connecting to ${this.host}:${this.port}...`)
      
      this.socket = new Socket()
      this.socket.setKeepAlive(true)
      
      // Connection timeout
      const timeout = setTimeout(() => {
        this.socket?.destroy()
        reject(new Error('Connection timeout'))
      }, 10000)

      this.socket.on('connect', () => {
        clearTimeout(timeout)
        console.log('✅ TCP connection established')
        this.reconnectAttempts = 0
      })

      this.socket.on('data', (data: Buffer) => {
        this.handleData(data)
      })

      this.socket.on('error', (error: Error) => {
        console.error('❌ Socket error:', error)
        this.emit('error', error)
        reject(error)
      })

      this.socket.on('close', () => {
        console.log('📊 Connection closed')
        this.isAuthenticated = false
        this.sessionStarted = false
        this.emit('disconnected')
        this.attemptReconnect()
      })

      // Connect to the gateway
      this.socket.connect(this.port, this.host)
      
      // Resolve when authenticated
      this.once('authenticated', () => resolve())
    })
  }

  private handleData(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data])

    // Before authentication, handle control messages (text)
    if (!this.sessionStarted) {
      this.handleControlMessages()
    } else {
      // After session start, handle binary data records
      this.handleDataRecords()
    }
  }

  private handleControlMessages(): void {
    let newlineIndex: number
    
    while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, newlineIndex).toString('utf-8')
      this.buffer = this.buffer.slice(newlineIndex + 1)
      
      if (line.trim()) {
        this.processControlMessage(line)
      }
    }
  }

  private processControlMessage(message: string): void {
    console.log('📨 Received:', message)
    
    const fields = this.parseControlMessage(message)
    
    // Handle greeting
    if (fields.lsg_version) {
      console.log(`📊 Gateway version: ${fields.lsg_version}`)
    }
    
    // Handle challenge
    if (fields.cram) {
      console.log('🔐 Received authentication challenge')
      this.sendAuthRequest(fields.cram)
    }
    
    // Handle auth response
    if (fields.success !== undefined) {
      if (fields.success === '1') {
        console.log(`✅ Authentication successful! Session ID: ${fields.session_id}`)
        this.isAuthenticated = true
        this.emit('authenticated')
      } else {
        console.error(`❌ Authentication failed: ${fields.error || 'Unknown error'}`)
        this.emit('error', new Error(fields.error || 'Authentication failed'))
      }
    }
  }

  private parseControlMessage(message: string): Record<string, string> {
    const fields: Record<string, string> = {}
    const parts = message.split('|')
    
    for (const part of parts) {
      const [key, value] = part.split('=')
      if (key && value !== undefined) {
        fields[key] = value
      }
    }
    
    return fields
  }

  private sendAuthRequest(cram: string): void {
    // CRAM authentication algorithm
    // 1. Concatenate cram + "|" + api_key
    const input = `${cram}|${this.config.apiKey}`
    
    // 2. SHA-256 hash
    const hash = createHash('sha256').update(input).digest('hex')
    
    // 3. Append last 5 characters of API key (bucket_id)
    const bucketId = this.config.apiKey.slice(-5)
    const auth = `${hash}-${bucketId}`
    
    // 4. Send authentication request
    const authMessage = [
      `auth=${auth}`,
      `dataset=${this.config.dataset}`,
      `encoding=${this.config.encoding}`,
      `compression=${this.config.compression}`,
      `ts_out=${this.config.tsOut ? '1' : '0'}`,
      `heartbeat_interval_s=${this.config.heartbeatIntervalS}`
    ].join('|') + '\n'
    
    console.log('🔐 Sending authentication request...')
    this.socket?.write(authMessage)
  }

  async subscribe(subscription: Subscription): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Must authenticate before subscribing')
    }

    const {
      schema,
      symbols,
      stypeIn = 'raw_symbol',
      start,
      snapshot
    } = subscription

    const parts = [
      `schema=${schema}`,
      `stype_in=${stypeIn}`,
      `symbols=${symbols.join(',')}`
    ]

    if (start !== undefined) {
      parts.push(`start=${start}`)
    }

    if (snapshot) {
      parts.push('snapshot=1')
    }

    const subscribeMessage = parts.join('|') + '\n'
    
    console.log(`📊 Subscribing to ${schema} for ${symbols.length} symbols...`)
    this.socket?.write(subscribeMessage)
  }

  async subscribeToAllFutures(schema: string = 'trades'): Promise<void> {
    await this.subscribe({
      schema,
      symbols: this.FUTURES_SYMBOLS,
      stypeIn: 'raw_symbol'
    })
  }

  startSession(): void {
    if (!this.isAuthenticated) {
      throw new Error('Must authenticate before starting session')
    }

    if (this.sessionStarted) {
      throw new Error('Session already started')
    }

    console.log('🚀 Starting session...')
    this.socket?.write('start_session=1\n')
    this.sessionStarted = true
    
    console.log('✅ Session started - now receiving data records')
  }

  private handleDataRecords(): void {
    // Handle binary DBN data or JSON lines
    if (this.config.encoding === 'json') {
      this.handleJsonRecords()
    } else {
      this.handleDbnRecords()
    }
  }

  private handleJsonRecords(): void {
    let newlineIndex: number
    
    while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, newlineIndex).toString('utf-8')
      this.buffer = this.buffer.slice(newlineIndex + 1)
      
      if (line.trim()) {
        try {
          const record = JSON.parse(line)
          this.emit('data', record)
          
          // Log sample data
          if (record.symbol) {
            console.log(`📊 ${record.symbol}: $${(record.price / 1e9).toFixed(2)} @ ${new Date(record.ts_event / 1000000).toISOString()}`)
          }
        } catch (error) {
          console.error('❌ Error parsing JSON record:', error)
        }
      }
    }
  }

  private handleDbnRecords(): void {
    // For DBN binary format, we'd need to parse the binary structure
    // This is complex and would require the full DBN specification
    // For now, emit raw buffer chunks
    if (this.buffer.length > 0) {
      const chunk = this.buffer
      this.buffer = Buffer.alloc(0)
      this.emit('dbn_data', chunk)
      console.log(`📊 Received ${chunk.length} bytes of DBN data`)
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      this.emit('max_reconnects')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Reconnection failed:', error)
      })
    }, delay)
  }

  disconnect(): void {
    console.log('📊 Disconnecting...')
    this.socket?.destroy()
    this.socket = null
    this.isAuthenticated = false
    this.sessionStarted = false
  }

  isConnected(): boolean {
    return this.socket !== null && !this.socket.destroyed && this.isAuthenticated
  }
}

// Singleton instance
let databentoClient: DatabentoRawClient | null = null

export function getDatabentoClient(): DatabentoRawClient {
  if (!databentoClient) {
    const apiKey = process.env.DATABENTO_API_KEY
    if (!apiKey) {
      throw new Error('DATABENTO_API_KEY not found in environment variables')
    }

    databentoClient = new DatabentoRawClient({
      apiKey,
      dataset: 'GLBX.MDP3',
      encoding: 'json', // Use JSON for easier debugging
      compression: 'none',
      tsOut: true,
      heartbeatIntervalS: 30
    })
  }

  return databentoClient
}
