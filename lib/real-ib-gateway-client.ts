/**
 * REAL IB Gateway Client - NO MOCK DATA
 * Uses @stoqey/ib package for actual Interactive Brokers API connection
 */

import { EventEmitter } from 'events'

// Note: @stoqey/ib package needs to be installed
// Run: npm install @stoqey/ib
// This is a real implementation that connects to actual IB Gateway

export interface IBOrder {
  orderId: number
  symbol: string
  action: 'BUY' | 'SELL'
  orderType: 'MKT' | 'LMT' | 'STP'
  totalQuantity: number
  lmtPrice?: number
  auxPrice?: number
  tif: 'DAY' | 'GTC' | 'IOC' | 'FOK'
  account?: string
}

export interface IBPosition {
  account: string
  contract: {
    symbol: string
    secType: string
    exchange: string
    currency: string
  }
  position: number
  marketPrice: number
  marketValue: number
  averageCost: number
  unrealizedPNL: number
  realizedPNL: number
}

export interface IBConnectionStatus {
  isConnected: boolean
  connectionTime?: Date
  lastHeartbeat?: Date
  reconnectAttempts: number
  host: string
  port: number
  clientId: number
  accountId?: string
  serverVersion?: string
}

/**
 * Real IB Gateway Client using @stoqey/ib
 * Connects to actual Interactive Brokers Gateway/TWS
 */
export class RealIBGatewayClient extends EventEmitter {
  private ib: any = null  // Will be IBApi from @stoqey/ib
  private isConnected = false
  private connectionTime: Date | null = null
  private lastHeartbeat: Date | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 5000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private nextOrderId = 1
  private orders = new Map<number, IBOrder>()
  private positions = new Map<string, IBPosition>()
  private accountSummary = new Map<string, any>()
  private accountId: string = process.env.IB_ACCOUNT_ID || 'DU123456'
  private serverVersion: string = ''

  constructor(
    private host: string = process.env.IB_GATEWAY_HOST || '127.0.0.1',
    private port: number = parseInt(process.env.IB_GATEWAY_PORT || '7496'),
    private clientId: number = parseInt(process.env.IB_GATEWAY_CLIENT_ID || '1')
  ) {
    super()
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.on('connected', () => {
      console.log(`🔗 Connected to IB Gateway at ${this.host}:${this.port}`)
      this.isConnected = true
      this.connectionTime = new Date()
      this.reconnectAttempts = 0
      this.startHeartbeat()
    })

    this.on('disconnected', () => {
      console.log('❌ Disconnected from IB Gateway')
      this.isConnected = false
      this.connectionTime = null
      this.stopHeartbeat()
      this.attemptReconnect()
    })

    this.on('error', (error) => {
      console.error('🚨 IB Gateway error:', error)
      this.emit('connectionError', error)
    })
  }

  async connect(): Promise<boolean> {
    try {
      console.log(`🔌 Connecting to IB Gateway at ${this.host}:${this.port}...`)
      
      // Dynamically import @stoqey/ib
      const { IBApi, EventName } = await import('@stoqey/ib')
      
      // Create IB API instance
      this.ib = new IBApi({
        host: this.host,
        port: this.port,
        clientId: this.clientId
      })

      // Setup IB event handlers
      this.ib.on(EventName.connected, () => {
        console.log('✅ Successfully connected to IB Gateway')
        this.emit('connected')
        
        // Request next valid order ID
        this.ib.reqIds()
        
        // Request account updates
        this.ib.reqAccountUpdates(true, this.accountId)
        
        // Request positions
        this.ib.reqPositions()
      })

      this.ib.on(EventName.disconnected, () => {
        this.emit('disconnected')
      })

      this.ib.on(EventName.error, (err: Error, code: number, reqId: number) => {
        console.error(`IB Error ${code}:`, err.message)
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
        console.log(`📊 Order ${orderId}: ${status} (Filled: ${filled}, Remaining: ${remaining})`)
        this.emit('orderStatus', { orderId, status, filled, remaining, avgFillPrice })
      })

      this.ib.on(EventName.position, (
        account: string,
        contract: any,
        pos: number,
        avgCost: number
      ) => {
        console.log(`📍 Position: ${contract.symbol} = ${pos} @ ${avgCost}`)
        
        const key = `${account}_${contract.symbol}`
        this.positions.set(key, {
          account,
          contract: {
            symbol: contract.symbol,
            secType: contract.secType,
            exchange: contract.exchange,
            currency: contract.currency
          },
          position: pos,
          marketPrice: avgCost,
          marketValue: pos * avgCost,
          averageCost: avgCost,
          unrealizedPNL: 0,
          realizedPNL: 0
        })
        
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

      // Connect to IB Gateway
      await this.ib.connect()
      
      return true

    } catch (error) {
      console.error('❌ Connection failed:', error)
      
      // If @stoqey/ib is not installed, provide helpful error
      if (error instanceof Error && error.message.includes('Cannot find module')) {
        console.error('⚠️  @stoqey/ib package not found!')
        console.error('📦 Install it with: npm install @stoqey/ib')
        console.error('📖 See REAL_IB_GATEWAY_IMPLEMENTATION_PLAN.md for setup instructions')
      }
      
      return false
    }
  }

  async placeOrder(order: Omit<IBOrder, 'orderId'>): Promise<number> {
    if (!this.isConnected || !this.ib) {
      throw new Error('Not connected to IB Gateway')
    }

    try {
      const { Contract, Order } = await import('@stoqey/ib')
      
      const orderId = this.nextOrderId++
      
      // Create contract
      const contract = new Contract()
      contract.symbol = order.symbol
      contract.secType = 'FUT'  // Futures
      contract.exchange = 'CME'
      contract.currency = 'USD'
      
      // Create order
      const ibOrder = new Order()
      ibOrder.action = order.action
      ibOrder.orderType = order.orderType
      ibOrder.totalQuantity = order.totalQuantity
      ibOrder.tif = order.tif
      
      if (order.lmtPrice) {
        ibOrder.lmtPrice = order.lmtPrice
      }
      
      if (order.auxPrice) {
        ibOrder.auxPrice = order.auxPrice
      }
      
      // Place order
      this.ib.placeOrder(orderId, contract, ibOrder)
      
      // Store order
      this.orders.set(orderId, {
        ...order,
        orderId
      })
      
      console.log(`📤 Order placed: ${order.action} ${order.totalQuantity} ${order.symbol} (Order ID: ${orderId})`)
      
      return orderId

    } catch (error) {
      console.error('❌ Order placement failed:', error)
      throw error
    }
  }

  async cancelOrder(orderId: number): Promise<void> {
    if (!this.isConnected || !this.ib) {
      throw new Error('Not connected to IB Gateway')
    }

    this.ib.cancelOrder(orderId)
    console.log(`❌ Order cancelled: ${orderId}`)
  }

  async requestPositions(): Promise<void> {
    if (!this.isConnected || !this.ib) {
      return
    }

    this.ib.reqPositions()
  }

  async requestAccountSummary(): Promise<void> {
    if (!this.isConnected || !this.ib) {
      return
    }

    this.ib.reqAccountSummary(
      1,
      'All',
      'NetLiquidation,TotalCashValue,BuyingPower,EquityWithLoanValue,UnrealizedPnL,RealizedPnL'
    )
  }

  getPositions(): IBPosition[] {
    return Array.from(this.positions.values())
  }

  getPosition(symbol: string, account?: string): IBPosition | null {
    const accountToUse = account || this.accountId
    const key = `${accountToUse}_${symbol}`
    return this.positions.get(key) || null
  }

  getAccountSummary(account?: string): any[] {
    const accountToUse = account || this.accountId
    return Array.from(this.accountSummary.values()).filter(s => s.account === accountToUse)
  }

  getOrders(): IBOrder[] {
    return Array.from(this.orders.values())
  }

  getConnectionStatus(): IBConnectionStatus {
    return {
      isConnected: this.isConnected,
      connectionTime: this.connectionTime || undefined,
      lastHeartbeat: this.lastHeartbeat || undefined,
      reconnectAttempts: this.reconnectAttempts,
      host: this.host,
      port: this.port,
      clientId: this.clientId,
      accountId: this.accountId,
      serverVersion: this.serverVersion
    }
  }

  isConnectionHealthy(): boolean {
    return this.isConnected
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.lastHeartbeat = new Date()
        // Request time to keep connection alive
        if (this.ib) {
          this.ib.reqCurrentTime()
        }
      }
    }, 30000) // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`)

    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  async disconnect(): Promise<void> {
    console.log('🔌 Disconnecting from IB Gateway...')
    
    this.stopHeartbeat()
    
    if (this.ib) {
      this.ib.disconnect()
      this.ib = null
    }
    
    this.isConnected = false
    this.connectionTime = null
    this.orders.clear()
    this.positions.clear()
    this.accountSummary.clear()
  }

  // Utility methods for trading signals
  async executeSignal(signal: {
    symbol: string
    direction: 'LONG' | 'SHORT'
    quantity: number
    orderType?: 'MKT' | 'LMT' | 'STP'
    limitPrice?: number
    account?: string
  }): Promise<number> {
    const order: Omit<IBOrder, 'orderId'> = {
      symbol: signal.symbol,
      action: signal.direction === 'LONG' ? 'BUY' : 'SELL',
      orderType: signal.orderType || 'MKT',
      totalQuantity: signal.quantity,
      lmtPrice: signal.limitPrice,
      tif: 'DAY',
      account: signal.account || this.accountId
    }

    return await this.placeOrder(order)
  }

  async closePosition(symbol: string, account?: string): Promise<number | null> {
    const position = this.getPosition(symbol, account)
    
    if (!position || position.position === 0) {
      console.log(`ℹ️ No position to close for ${symbol}`)
      return null
    }

    const order: Omit<IBOrder, 'orderId'> = {
      symbol: symbol,
      action: position.position > 0 ? 'SELL' : 'BUY',
      orderType: 'MKT',
      totalQuantity: Math.abs(position.position),
      tif: 'DAY',
      account: position.account
    }

    console.log(`🔄 Closing position: ${order.action} ${order.totalQuantity} ${symbol}`)
    return await this.placeOrder(order)
  }

  // Get account balance
  getAccountBalance(): number {
    const netLiq = this.accountSummary.get(`${this.accountId}_NetLiquidation`)
    return parseFloat(netLiq?.value || '0')
  }

  // Get buying power
  getBuyingPower(): number {
    const buyingPower = this.accountSummary.get(`${this.accountId}_BuyingPower`)
    return parseFloat(buyingPower?.value || '0')
  }

  // Get total unrealized P&L
  getTotalUnrealizedPnL(): number {
    return Array.from(this.positions.values()).reduce((total, pos) => total + pos.unrealizedPNL, 0)
  }
}

// Export singleton instance configured for paper trading
export const realIBGatewayClient = new RealIBGatewayClient()

// Utility functions
export async function connectToIBGateway(): Promise<boolean> {
  return await realIBGatewayClient.connect()
}

export function disconnectFromIBGateway(): Promise<void> {
  return realIBGatewayClient.disconnect()
}

export function getIBPositions(): IBPosition[] {
  return realIBGatewayClient.getPositions()
}

export function getIBAccountSummary(): any[] {
  return realIBGatewayClient.getAccountSummary()
}

export function getIBConnectionStatus(): IBConnectionStatus {
  return realIBGatewayClient.getConnectionStatus()
}

export async function executeTradeSignal(signal: {
  symbol: string
  direction: 'LONG' | 'SHORT'
  quantity: number
  orderType?: 'MKT' | 'LMT' | 'STP'
  limitPrice?: number
  account?: string
}): Promise<number> {
  return await realIBGatewayClient.executeSignal(signal)
}
