// UNIFIED SIGNAL EXECUTION SYSTEM
// ONE SIGNAL → DISCORD + IB GATEWAY PAPER TRADING
// Tracks performance for BOTH Discord signals AND paper trading results

import { createClient } from '@supabase/supabase-js'
import { FuturesSignal, FuturesSymbol } from './futures-trading-integration-complete'
import { getPerformanceTracker } from './performance-tracker-complete'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedSignalExecution {
  signal: FuturesSignal
  tradingMode: 'paper' | 'live'
  discordSent: boolean
  discordMessageId?: string
  ibOrderPlaced: boolean
  ibOrderId?: number
  ibFillPrice?: number
  performanceTrackingId?: string
  timestamp: number
}

export interface SignalPerformanceTracking {
  signalId: string
  symbol: string
  direction: 'LONG' | 'SHORT'
  
  // Discord tracking
  discordSignalSent: boolean
  discordMessageId?: string
  discordSentAt?: Date
  
  // IB Gateway tracking
  ibOrderPlaced: boolean
  ibOrderId?: number
  ibEntryPrice?: number
  ibEntryTime?: Date
  ibExitPrice?: number
  ibExitTime?: Date
  ibExitReason?: string
  
  // Performance
  ibPnl?: number
  ibRMultiple?: number
  ibDurationMinutes?: number
  
  // Status
  status: 'pending' | 'open' | 'closed' | 'failed'
  tradingMode: 'paper' | 'live'
}

// ============================================================================
// UNIFIED SIGNAL EXECUTOR
// ============================================================================

export class UnifiedSignalExecutor {
  private performanceTracker = getPerformanceTracker()

  /**
   * Execute signal with SEPARATION:
   * - Discord: ALWAYS sent
   * - Paper Trading: SELECTIVE (based on config)
   */
  async executeSignal(
    signal: FuturesSignal,
    tradingMode: 'paper' | 'live' = 'paper'
  ): Promise<UnifiedSignalExecution> {
    console.log('\n🎯 UNIFIED SIGNAL EXECUTION (SEPARATED)')
    console.log('='.repeat(80))
    console.log(`Signal: ${signal.symbol} ${signal.direction}`)
    console.log(`Strategy: ${signal.strategy}`)
    console.log(`Entry: ${signal.entry}`)
    console.log(`Stop: ${signal.stopLoss}`)
    console.log(`Targets: ${signal.target1} / ${signal.target2}`)
    console.log(`Confidence: ${(signal.confidence * 100).toFixed(1)}%`)
    console.log(`Mode: ${tradingMode.toUpperCase()}`)
    console.log('='.repeat(80))

    const execution: UnifiedSignalExecution = {
      signal,
      tradingMode,
      discordSent: false,
      ibOrderPlaced: false,
      timestamp: Date.now()
    }

    let paperTradingSkipReason: string | null = null

    try {
      // STEP 1: Send to Discord (ALWAYS - NO EXCEPTIONS)
      console.log('\n📢 Step 1: Sending to Discord (ALWAYS)...')
      const discordResult = await this.sendToDiscord(signal, tradingMode)
      execution.discordSent = discordResult.success
      execution.discordMessageId = discordResult.messageId
      
      if (discordResult.success) {
        console.log('✅ Discord signal sent successfully')
      } else {
        console.log('❌ Discord signal failed')
      }

      // STEP 2: Check Paper Trading Config (SELECTIVE)
      console.log('\n🔍 Step 2: Checking paper trading config...')
      const paperConfig = await this.checkPaperTradingAllowed(signal.strategy || 'Unknown')
      
      if (paperConfig.allowed) {
        console.log('✅ Paper trading ENABLED for this strategy')
        console.log(`   Reason: ${paperConfig.reason}`)
        
        // Execute on IB Gateway
        console.log('\n🔄 Step 3: Executing on IB Gateway...')
        const ibResult = await this.executeOnIBGateway(signal, tradingMode)
        execution.ibOrderPlaced = ibResult.success
        execution.ibOrderId = ibResult.orderId
        execution.ibFillPrice = ibResult.fillPrice
        
        if (ibResult.success) {
          console.log(`✅ IB Gateway order placed: Order ID ${ibResult.orderId}`)
          
          // Increment position count
          await this.incrementPaperPosition(signal.strategy || 'Unknown')
        } else {
          console.log('❌ IB Gateway order failed')
          paperTradingSkipReason = 'IB Gateway execution failed'
        }
      } else {
        console.log('⏭️ Paper trading SKIPPED for this strategy')
        console.log(`   Reason: ${paperConfig.reason}`)
        paperTradingSkipReason = paperConfig.reason
      }

      // STEP 3: Start Performance Tracking (if paper traded)
      if (execution.ibOrderPlaced) {
        console.log('\n📊 Step 4: Starting performance tracking...')
        const trackingId = await this.startPerformanceTracking(signal, execution)
        execution.performanceTrackingId = trackingId
        console.log(`✅ Performance tracking started: ${trackingId}`)
      }

      // STEP 4: Log to database (ALWAYS - tracks both Discord and paper trading)
      console.log('\n💾 Step 5: Logging to database...')
      await this.logUnifiedExecution(execution, paperConfig.allowed, paperTradingSkipReason)
      console.log('✅ Execution logged to database')

      console.log('\n' + '='.repeat(80))
      console.log('🎉 EXECUTION COMPLETE!')
      console.log(`   Discord: ${execution.discordSent ? '✅ SENT' : '❌ FAILED'}`)
      console.log(`   Paper Trading: ${execution.ibOrderPlaced ? '✅ EXECUTED' : `⏭️ SKIPPED (${paperTradingSkipReason})`}`)
      console.log(`   Tracking: ${execution.performanceTrackingId ? '✅ ACTIVE' : '⏭️ N/A'}`)
      console.log('='.repeat(80) + '\n')

      return execution

    } catch (error) {
      console.error('❌ Error in unified signal execution:', error)
      throw error
    }
  }

  // ========================================================================
  // DISCORD EXECUTION
  // ========================================================================

  private async sendToDiscord(
    signal: FuturesSignal,
    tradingMode: 'paper' | 'live'
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Format Discord message
      const message = this.formatDiscordMessage(signal, tradingMode)
      
      // Send to Discord webhook
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL
      if (!webhookUrl) {
        console.error('❌ Discord webhook URL not configured')
        return { success: false }
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [message]
        })
      })

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status}`)
      }

      // Get message ID from response (if available)
      const messageId = response.headers.get('x-message-id') || `discord_${Date.now()}`

      return { success: true, messageId }

    } catch (error) {
      console.error('❌ Error sending to Discord:', error)
      return { success: false }
    }
  }

  private formatDiscordMessage(signal: FuturesSignal, tradingMode: 'paper' | 'live'): any {
    const color = signal.direction === 'LONG' ? 0x00ff00 : 0xff0000
    const emoji = signal.direction === 'LONG' ? '🟢' : '🔴'
    const modeEmoji = tradingMode === 'paper' ? '📄' : '💰'

    return {
      title: `${emoji} ${signal.symbol} ${signal.direction} SIGNAL ${modeEmoji}`,
      color,
      fields: [
        {
          name: '📍 Entry',
          value: `$${signal.entry.toFixed(2)}`,
          inline: true
        },
        {
          name: '🛑 Stop Loss',
          value: `$${signal.stopLoss.toFixed(2)}`,
          inline: true
        },
        {
          name: '🎯 Target 1',
          value: `$${signal.target1.toFixed(2)}`,
          inline: true
        },
        {
          name: '🎯 Target 2',
          value: `$${signal.target2.toFixed(2)}`,
          inline: true
        },
        {
          name: '📊 Confidence',
          value: `${(signal.confidence * 100).toFixed(1)}%`,
          inline: true
        },
        {
          name: '📈 Position Size',
          value: `${signal.positionSize} contracts`,
          inline: true
        },
        {
          name: '🧠 Strategy',
          value: signal.strategy || 'Multi-Strategy',
          inline: false
        },
        {
          name: '💡 Reasoning',
          value: signal.reasoning || 'Technical analysis',
          inline: false
        },
        {
          name: '🔄 Trading Mode',
          value: tradingMode.toUpperCase(),
          inline: true
        },
        {
          name: '⏰ Time',
          value: new Date().toLocaleString(),
          inline: true
        }
      ],
      footer: {
        text: `Signal ID: ${signal.id} | Nexural Trading System`
      },
      timestamp: new Date().toISOString()
    }
  }

  // ========================================================================
  // IB GATEWAY EXECUTION
  // ========================================================================

  private async executeOnIBGateway(
    signal: FuturesSignal,
    tradingMode: 'paper' | 'live'
  ): Promise<{ success: boolean; orderId?: number; fillPrice?: number }> {
    try {
      // For now, simulate order placement
      // TODO: Implement actual IB Gateway API calls
      
      const orderId = Math.floor(Math.random() * 1000000)
      const fillPrice = signal.entry
      
      console.log(`   Order Type: ${signal.direction === 'LONG' ? 'BUY' : 'SELL'}`)
      console.log(`   Quantity: ${signal.positionSize} contracts`)
      console.log(`   Entry Price: $${fillPrice.toFixed(2)}`)
      console.log(`   Stop Loss: $${signal.stopLoss.toFixed(2)}`)
      console.log(`   Target 1: $${signal.target1.toFixed(2)}`)
      console.log(`   Target 2: $${signal.target2.toFixed(2)}`)

      // Simulate successful order placement
      return {
        success: true,
        orderId,
        fillPrice
      }

    } catch (error) {
      console.error('❌ Error executing on IB Gateway:', error)
      return { success: false }
    }
  }

  // ========================================================================
  // PERFORMANCE TRACKING
  // ========================================================================

  private async startPerformanceTracking(
    signal: FuturesSignal,
    execution: UnifiedSignalExecution
  ): Promise<string> {
    try {
      // Calculate risk amount
      const riskAmount = Math.abs(signal.entry - signal.stopLoss) * signal.positionSize

      // Record trade entry in performance tracker
      const trackingId = await this.performanceTracker.recordTradeEntry({
        signalId: signal.id,
        symbol: signal.symbol,
        direction: signal.direction,
        strategy: signal.strategy || 'Multi-Strategy',
        strategies: signal.strategy ? [signal.strategy] : [],
        entryPrice: execution.ibFillPrice || signal.entry,
        positionSize: signal.positionSize,
        stopLoss: signal.stopLoss,
        target1: signal.target1,
        target2: signal.target2,
        riskAmount,
        tradingMode: execution.tradingMode,
        ibOrderId: execution.ibOrderId,
        marketRegime: signal.market_regime,
        indicatorsAtEntry: {}
      })

      // Also create unified tracking record
      await supabase.from('unified_signal_tracking').insert({
        signal_id: signal.id,
        tracking_id: trackingId,
        symbol: signal.symbol,
        direction: signal.direction,
        discord_signal_sent: execution.discordSent,
        discord_message_id: execution.discordMessageId,
        discord_sent_at: execution.discordSent ? new Date().toISOString() : null,
        ib_order_placed: execution.ibOrderPlaced,
        ib_order_id: execution.ibOrderId,
        ib_entry_price: execution.ibFillPrice || signal.entry,
        ib_entry_time: execution.ibOrderPlaced ? new Date().toISOString() : null,
        status: execution.ibOrderPlaced ? 'open' : 'pending',
        trading_mode: execution.tradingMode,
        created_at: new Date().toISOString()
      })

      return trackingId

    } catch (error) {
      console.error('❌ Error starting performance tracking:', error)
      throw error
    }
  }

  // ========================================================================
  // PAPER TRADING CONFIG
  // ========================================================================

  private async checkPaperTradingAllowed(strategy: string): Promise<{ allowed: boolean; reason: string }> {
    try {
      const { data, error } = await supabase
        .rpc('can_execute_paper_trade', {
          p_strategy_name: strategy,
          p_risk_amount: 100 // Placeholder, will be calculated properly
        })
        .single()

      if (error) throw error

      return {
        allowed: (data as any).allowed,
        reason: (data as any).reason
      }
    } catch (error) {
      console.error('❌ Error checking paper trading config:', error)
      return {
        allowed: false,
        reason: 'Error checking configuration'
      }
    }
  }

  private async incrementPaperPosition(strategy: string): Promise<void> {
    try {
      await supabase.rpc('increment_paper_position', {
        p_strategy_name: strategy
      })
    } catch (error) {
      console.error('❌ Error incrementing paper position:', error)
    }
  }

  private async decrementPaperPosition(strategy: string): Promise<void> {
    try {
      await supabase.rpc('decrement_paper_position', {
        p_strategy_name: strategy
      })
    } catch (error) {
      console.error('❌ Error decrementing paper position:', error)
    }
  }

  // ========================================================================
  // DATABASE LOGGING
  // ========================================================================

  private async logUnifiedExecution(
    execution: UnifiedSignalExecution,
    paperTradingEnabled: boolean,
    paperTradingSkipReason: string | null
  ): Promise<void> {
    try {
      // Log to unified_executions
      await supabase.from('unified_executions').insert({
        signal_id: execution.signal.id,
        symbol: execution.signal.symbol,
        direction: execution.signal.direction,
        entry: execution.signal.entry,
        stop_loss: execution.signal.stopLoss,
        target1: execution.signal.target1,
        target2: execution.signal.target2,
        confidence: execution.signal.confidence,
        position_size: execution.signal.positionSize,
        strategy: execution.signal.strategy,
        trading_mode: execution.tradingMode,
        discord_sent: execution.discordSent,
        discord_message_id: execution.discordMessageId,
        ib_order_placed: execution.ibOrderPlaced,
        ib_order_id: execution.ibOrderId,
        performance_tracking_id: execution.performanceTrackingId,
        timestamp: new Date(execution.timestamp).toISOString(),
        created_at: new Date().toISOString()
      })

      // Log to signal_execution_log (for ML training data)
      await supabase.from('signal_execution_log').insert({
        signal_id: execution.signal.id,
        symbol: execution.signal.symbol,
        direction: execution.signal.direction,
        strategy: execution.signal.strategy || 'Unknown',
        confidence: execution.signal.confidence,
        discord_sent: execution.discordSent,
        discord_sent_at: execution.discordSent ? new Date().toISOString() : null,
        paper_trading_enabled: paperTradingEnabled,
        paper_trading_executed: execution.ibOrderPlaced,
        paper_trading_skip_reason: paperTradingSkipReason,
        ib_order_id: execution.ibOrderId,
        ib_executed_at: execution.ibOrderPlaced ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Error logging unified execution:', error)
    }
  }

  // ========================================================================
  // TRADE EXIT & PERFORMANCE UPDATE
  // ========================================================================

  async recordTradeExit(
    signalId: string,
    exitPrice: number,
    exitReason: 'target1' | 'target2' | 'stop_loss' | 'manual'
  ): Promise<void> {
    try {
      console.log('\n📊 RECORDING TRADE EXIT')
      console.log('='.repeat(80))
      console.log(`Signal ID: ${signalId}`)
      console.log(`Exit Price: $${exitPrice.toFixed(2)}`)
      console.log(`Exit Reason: ${exitReason}`)
      console.log('='.repeat(80))

      // Get tracking record
      const { data: tracking } = await supabase
        .from('unified_signal_tracking')
        .select('*')
        .eq('signal_id', signalId)
        .single()

      if (!tracking) {
        throw new Error('Tracking record not found')
      }

      // Update performance tracker
      await this.performanceTracker.recordTradeExit({
        tradeId: tracking.tracking_id,
        exitPrice,
        exitReason,
        ibFillPrice: exitPrice
      })

      // Update unified tracking
      const { data: updatedTracking } = await supabase
        .from('unified_signal_tracking')
        .update({
          ib_exit_price: exitPrice,
          ib_exit_time: new Date().toISOString(),
          ib_exit_reason: exitReason,
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('signal_id', signalId)
        .select()
        .single()

      // Decrement position count
      const { data: tradeResult } = await supabase
        .from('trade_results')
        .select('strategy')
        .eq('id', tracking.tracking_id)
        .single()

      if (tradeResult) {
        await this.decrementPaperPosition(tradeResult.strategy)
        
        // Update daily P&L
        if (updatedTracking && updatedTracking.ib_pnl) {
          await supabase.rpc('update_paper_pnl', {
            p_strategy_name: tradeResult.strategy,
            p_pnl: updatedTracking.ib_pnl
          })
        }
      }

      console.log('✅ Trade exit recorded successfully')
      console.log('✅ Position count decremented')
      console.log('✅ Daily P&L updated\n')

    } catch (error) {
      console.error('❌ Error recording trade exit:', error)
      throw error
    }
  }

  // ========================================================================
  // PERFORMANCE QUERIES
  // ========================================================================

  async getSignalPerformance(signalId: string): Promise<SignalPerformanceTracking | null> {
    try {
      const { data, error } = await supabase
        .from('unified_signal_tracking')
        .select('*')
        .eq('signal_id', signalId)
        .single()

      if (error) throw error
      if (!data) return null

      return {
        signalId: data.signal_id,
        symbol: data.symbol,
        direction: data.direction,
        discordSignalSent: data.discord_signal_sent,
        discordMessageId: data.discord_message_id,
        discordSentAt: data.discord_sent_at ? new Date(data.discord_sent_at) : undefined,
        ibOrderPlaced: data.ib_order_placed,
        ibOrderId: data.ib_order_id,
        ibEntryPrice: data.ib_entry_price,
        ibEntryTime: data.ib_entry_time ? new Date(data.ib_entry_time) : undefined,
        ibExitPrice: data.ib_exit_price,
        ibExitTime: data.ib_exit_time ? new Date(data.ib_exit_time) : undefined,
        ibExitReason: data.ib_exit_reason,
        ibPnl: data.ib_pnl,
        ibRMultiple: data.ib_r_multiple,
        ibDurationMinutes: data.ib_duration_minutes,
        status: data.status,
        tradingMode: data.trading_mode
      }
    } catch (error) {
      console.error('❌ Error getting signal performance:', error)
      return null
    }
  }

  async getAllSignalPerformance(limit: number = 50): Promise<SignalPerformanceTracking[]> {
    try {
      const { data, error } = await supabase
        .from('unified_signal_tracking')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map(d => ({
        signalId: d.signal_id,
        symbol: d.symbol,
        direction: d.direction,
        discordSignalSent: d.discord_signal_sent,
        discordMessageId: d.discord_message_id,
        discordSentAt: d.discord_sent_at ? new Date(d.discord_sent_at) : undefined,
        ibOrderPlaced: d.ib_order_placed,
        ibOrderId: d.ib_order_id,
        ibEntryPrice: d.ib_entry_price,
        ibEntryTime: d.ib_entry_time ? new Date(d.ib_entry_time) : undefined,
        ibExitPrice: d.ib_exit_price,
        ibExitTime: d.ib_exit_time ? new Date(d.ib_exit_time) : undefined,
        ibExitReason: d.ib_exit_reason,
        ibPnl: d.ib_pnl,
        ibRMultiple: d.ib_r_multiple,
        ibDurationMinutes: d.ib_duration_minutes,
        status: d.status,
        tradingMode: d.trading_mode
      }))
    } catch (error) {
      console.error('❌ Error getting all signal performance:', error)
      return []
    }
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

let globalExecutor: UnifiedSignalExecutor | null = null

export function getUnifiedExecutor(): UnifiedSignalExecutor {
  if (!globalExecutor) {
    globalExecutor = new UnifiedSignalExecutor()
  }
  return globalExecutor
}
