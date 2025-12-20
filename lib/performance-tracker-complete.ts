// COMPLETE PERFORMANCE TRACKING SERVICE
// Tracks trade execution, calculates metrics, enables optimization

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// TYPES
// ============================================================================

export interface TradeEntry {
  signalId: string
  symbol: string
  direction: 'LONG' | 'SHORT'
  strategy: string
  strategies?: string[]
  entryPrice: number
  positionSize: number
  stopLoss: number
  target1: number
  target2: number
  riskAmount: number
  tradingMode: 'paper' | 'live'
  ibOrderId?: number
  marketRegime?: any
  indicatorsAtEntry?: any
}

export interface TradeExit {
  tradeId: string
  exitPrice: number
  exitReason: 'target1' | 'target2' | 'stop_loss' | 'manual' | 'time_stop'
  ibFillPrice?: number
  ibCommission?: number
}

export interface StrategyPerformance {
  strategyName: string
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnl: number
  avgWin: number
  avgLoss: number
  avgRMultiple: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  recentWinRate: number
  recentAvgR: number
}

// ============================================================================
// PERFORMANCE TRACKER CLASS
// ============================================================================

export class PerformanceTracker {
  
  // ========================================================================
  // TRADE ENTRY
  // ========================================================================
  
  async recordTradeEntry(entry: TradeEntry): Promise<string> {
    try {
      // Calculate risk metrics
      const riskRewardRatio = this.calculateRiskRewardRatio(
        entry.entryPrice,
        entry.stopLoss,
        entry.target1,
        entry.direction
      )

      const rewardAmount = Math.abs(entry.target1 - entry.entryPrice) * entry.positionSize

      // Insert trade result (entry only, exit will be updated later)
      const { data, error } = await supabase
        .from('trade_results')
        .insert({
          signal_id: entry.signalId,
          symbol: entry.symbol,
          direction: entry.direction,
          strategy: entry.strategy,
          strategies: entry.strategies || [entry.strategy],
          entry_price: entry.entryPrice,
          entry_time: new Date().toISOString(),
          position_size: entry.positionSize,
          risk_amount: entry.riskAmount,
          reward_amount: rewardAmount,
          risk_reward_ratio: riskRewardRatio,
          trading_mode: entry.tradingMode,
          ib_order_id: entry.ibOrderId,
          market_regime: entry.marketRegime,
          indicators_at_entry: entry.indicatorsAtEntry
        })
        .select()
        .single()

      if (error) throw error

      // Add to open positions
      await this.addOpenPosition(entry, data.id)

      console.log(`✅ Trade entry recorded: ${entry.symbol} ${entry.direction} @ ${entry.entryPrice}`)
      
      return data.id

    } catch (error) {
      console.error('❌ Error recording trade entry:', error)
      throw error
    }
  }

  // ========================================================================
  // TRADE EXIT
  // ========================================================================
  
  async recordTradeExit(exit: TradeExit): Promise<void> {
    try {
      // Get the trade
      const { data: trade, error: fetchError } = await supabase
        .from('trade_results')
        .select('*')
        .eq('id', exit.tradeId)
        .single()

      if (fetchError) throw fetchError

      // Calculate P&L
      const pnl = this.calculatePnL(
        trade.entry_price,
        exit.exitPrice,
        trade.position_size,
        trade.direction
      )

      const pnlPercent = (pnl / (trade.entry_price * trade.position_size)) * 100

      // Calculate R-multiple
      const rMultiple = pnl / trade.risk_amount

      // Calculate duration
      const entryTime = new Date(trade.entry_time).getTime()
      const exitTime = Date.now()
      const durationMinutes = Math.floor((exitTime - entryTime) / 60000)

      // Update trade result
      const { error: updateError } = await supabase
        .from('trade_results')
        .update({
          exit_price: exit.exitPrice,
          exit_time: new Date().toISOString(),
          exit_reason: exit.exitReason,
          pnl,
          pnl_percent: pnlPercent,
          r_multiple: rMultiple,
          duration_minutes: durationMinutes,
          ib_fill_price: exit.ibFillPrice,
          ib_commission: exit.ibCommission
        })
        .eq('id', exit.tradeId)

      if (updateError) throw updateError

      // Remove from open positions
      await this.removeOpenPosition(trade.symbol, trade.strategy)

      // Update daily performance
      await this.updateDailyPerformance(trade.strategy, pnl, rMultiple, pnl > 0)

      console.log(`✅ Trade exit recorded: ${trade.symbol} ${exit.exitReason}`)
      console.log(`   P&L: $${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`)
      console.log(`   R-Multiple: ${rMultiple.toFixed(2)}R`)

    } catch (error) {
      console.error('❌ Error recording trade exit:', error)
      throw error
    }
  }

  // ========================================================================
  // OPEN POSITIONS
  // ========================================================================
  
  private async addOpenPosition(entry: TradeEntry, tradeId: string): Promise<void> {
    try {
      await supabase.from('open_positions').insert({
        symbol: entry.symbol,
        direction: entry.direction,
        strategy: entry.strategy,
        entry_price: entry.entryPrice,
        entry_time: new Date().toISOString(),
        position_size: entry.positionSize,
        stop_loss: entry.stopLoss,
        target1: entry.target1,
        target2: entry.target2,
        risk_amount: entry.riskAmount,
        ib_order_id: entry.ibOrderId,
        trading_mode: entry.tradingMode,
        current_price: entry.entryPrice,
        unrealized_pnl: 0,
        unrealized_pnl_percent: 0
      })
    } catch (error) {
      console.error('❌ Error adding open position:', error)
    }
  }

  private async removeOpenPosition(symbol: string, strategy: string): Promise<void> {
    try {
      await supabase
        .from('open_positions')
        .delete()
        .eq('symbol', symbol)
        .eq('strategy', strategy)
    } catch (error) {
      console.error('❌ Error removing open position:', error)
    }
  }

  async updateOpenPositions(currentPrices: Record<string, number>): Promise<void> {
    try {
      const { data: positions, error } = await supabase
        .from('open_positions')
        .select('*')

      if (error) throw error

      for (const position of positions || []) {
        const currentPrice = currentPrices[position.symbol]
        if (!currentPrice) continue

        const unrealizedPnl = this.calculatePnL(
          position.entry_price,
          currentPrice,
          position.position_size,
          position.direction
        )

        const unrealizedPnlPercent = (unrealizedPnl / (position.entry_price * position.position_size)) * 100

        await supabase
          .from('open_positions')
          .update({
            current_price: currentPrice,
            unrealized_pnl: unrealizedPnl,
            unrealized_pnl_percent: unrealizedPnlPercent
          })
          .eq('id', position.id)
      }
    } catch (error) {
      console.error('❌ Error updating open positions:', error)
    }
  }

  // ========================================================================
  // PERFORMANCE METRICS
  // ========================================================================
  
  async getStrategyPerformance(strategyName: string): Promise<StrategyPerformance | null> {
    try {
      const { data, error } = await supabase
        .from('strategy_performance')
        .select('*')
        .eq('strategy_name', strategyName)
        .single()

      if (error) throw error

      return {
        strategyName: data.strategy_name,
        totalTrades: data.total_trades,
        winningTrades: data.winning_trades,
        losingTrades: data.losing_trades,
        winRate: data.win_rate,
        totalPnl: parseFloat(data.total_pnl),
        avgWin: parseFloat(data.avg_win),
        avgLoss: parseFloat(data.avg_loss),
        avgRMultiple: parseFloat(data.avg_r_multiple),
        profitFactor: parseFloat(data.profit_factor),
        sharpeRatio: parseFloat(data.sharpe_ratio),
        maxDrawdown: parseFloat(data.max_drawdown),
        recentWinRate: parseFloat(data.recent_win_rate),
        recentAvgR: parseFloat(data.recent_avg_r)
      }
    } catch (error) {
      console.error('❌ Error getting strategy performance:', error)
      return null
    }
  }

  async getAllStrategyPerformance(): Promise<StrategyPerformance[]> {
    try {
      const { data, error } = await supabase
        .from('strategy_performance')
        .select('*')
        .order('total_pnl', { ascending: false })

      if (error) throw error

      return (data || []).map(d => ({
        strategyName: d.strategy_name,
        totalTrades: d.total_trades,
        winningTrades: d.winning_trades,
        losingTrades: d.losing_trades,
        winRate: d.win_rate,
        totalPnl: parseFloat(d.total_pnl),
        avgWin: parseFloat(d.avg_win),
        avgLoss: parseFloat(d.avg_loss),
        avgRMultiple: parseFloat(d.avg_r_multiple),
        profitFactor: parseFloat(d.profit_factor),
        sharpeRatio: parseFloat(d.sharpe_ratio),
        maxDrawdown: parseFloat(d.max_drawdown),
        recentWinRate: parseFloat(d.recent_win_rate),
        recentAvgR: parseFloat(d.recent_avg_r)
      }))
    } catch (error) {
      console.error('❌ Error getting all strategy performance:', error)
      return []
    }
  }

  async getRecentTrades(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('trade_results')
        .select('*')
        .order('entry_time', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error getting recent trades:', error)
      return []
    }
  }

  async getOpenPositions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('open_positions')
        .select('*')
        .order('entry_time', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error getting open positions:', error)
      return []
    }
  }

  // ========================================================================
  // DAILY PERFORMANCE
  // ========================================================================
  
  private async updateDailyPerformance(
    strategy: string,
    pnl: number,
    rMultiple: number,
    isWin: boolean
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get existing daily performance
      const { data: existing } = await supabase
        .from('daily_performance')
        .select('*')
        .eq('trade_date', today)
        .eq('strategy_name', strategy)
        .single()

      if (existing) {
        // Update existing
        const newTradesCount = existing.trades_count + 1
        const newWinningTrades = existing.winning_trades + (isWin ? 1 : 0)
        const newLosingTrades = existing.losing_trades + (isWin ? 0 : 1)
        const newDailyPnl = parseFloat(existing.daily_pnl) + pnl
        const newDailyWinRate = (newWinningTrades / newTradesCount) * 100
        const newDailyAvgR = (parseFloat(existing.daily_avg_r) * existing.trades_count + rMultiple) / newTradesCount

        await supabase
          .from('daily_performance')
          .update({
            trades_count: newTradesCount,
            winning_trades: newWinningTrades,
            losing_trades: newLosingTrades,
            daily_pnl: newDailyPnl,
            daily_win_rate: newDailyWinRate,
            daily_avg_r: newDailyAvgR
          })
          .eq('trade_date', today)
          .eq('strategy_name', strategy)
      } else {
        // Insert new
        await supabase.from('daily_performance').insert({
          trade_date: today,
          strategy_name: strategy,
          trades_count: 1,
          winning_trades: isWin ? 1 : 0,
          losing_trades: isWin ? 0 : 1,
          daily_pnl: pnl,
          daily_win_rate: isWin ? 100 : 0,
          daily_avg_r: rMultiple
        })
      }
    } catch (error) {
      console.error('❌ Error updating daily performance:', error)
    }
  }

  // ========================================================================
  // CALCULATIONS
  // ========================================================================
  
  private calculatePnL(
    entryPrice: number,
    exitPrice: number,
    positionSize: number,
    direction: 'LONG' | 'SHORT'
  ): number {
    if (direction === 'LONG') {
      return (exitPrice - entryPrice) * positionSize
    } else {
      return (entryPrice - exitPrice) * positionSize
    }
  }

  private calculateRiskRewardRatio(
    entryPrice: number,
    stopLoss: number,
    target: number,
    direction: 'LONG' | 'SHORT'
  ): number {
    const risk = Math.abs(entryPrice - stopLoss)
    const reward = Math.abs(target - entryPrice)
    return reward / risk
  }

  // ========================================================================
  // ANALYTICS
  // ========================================================================
  
  async calculateSharpeRatio(strategyName: string, riskFreeRate: number = 0.02): Promise<number> {
    try {
      const { data: trades, error } = await supabase
        .from('trade_results')
        .select('pnl_percent')
        .eq('strategy', strategyName)
        .not('exit_price', 'is', null)

      if (error) throw error
      if (!trades || trades.length < 2) return 0

      const returns = trades.map(t => parseFloat(t.pnl_percent) / 100)
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
      
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)
      const stdDev = Math.sqrt(variance)

      if (stdDev === 0) return 0

      const sharpe = (avgReturn - riskFreeRate) / stdDev
      
      // Update in database
      await supabase
        .from('strategy_performance')
        .update({ sharpe_ratio: sharpe })
        .eq('strategy_name', strategyName)

      return sharpe
    } catch (error) {
      console.error('❌ Error calculating Sharpe ratio:', error)
      return 0
    }
  }

  async calculateMaxDrawdown(strategyName: string): Promise<number> {
    try {
      const { data: trades, error } = await supabase
        .from('trade_results')
        .select('pnl, exit_time')
        .eq('strategy', strategyName)
        .not('exit_price', 'is', null)
        .order('exit_time', { ascending: true })

      if (error) throw error
      if (!trades || trades.length === 0) return 0

      let peak = 0
      let maxDrawdown = 0
      let cumulative = 0

      for (const trade of trades) {
        cumulative += parseFloat(trade.pnl)
        if (cumulative > peak) {
          peak = cumulative
        }
        const drawdown = peak - cumulative
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown
        }
      }

      // Update in database
      await supabase
        .from('strategy_performance')
        .update({ max_drawdown: maxDrawdown })
        .eq('strategy_name', strategyName)

      return maxDrawdown
    } catch (error) {
      console.error('❌ Error calculating max drawdown:', error)
      return 0
    }
  }

  async updateRecentPerformance(strategyName: string, days: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data: recentTrades, error } = await supabase
        .from('trade_results')
        .select('pnl, r_multiple')
        .eq('strategy', strategyName)
        .not('exit_price', 'is', null)
        .gte('exit_time', cutoffDate.toISOString())

      if (error) throw error
      if (!recentTrades || recentTrades.length === 0) return

      const recentWins = recentTrades.filter(t => parseFloat(t.pnl) > 0).length
      const recentWinRate = (recentWins / recentTrades.length) * 100
      const recentAvgR = recentTrades.reduce((sum, t) => sum + parseFloat(t.r_multiple), 0) / recentTrades.length

      await supabase
        .from('strategy_performance')
        .update({
          recent_win_rate: recentWinRate,
          recent_avg_r: recentAvgR,
          recent_trades: recentTrades.length
        })
        .eq('strategy_name', strategyName)

    } catch (error) {
      console.error('❌ Error updating recent performance:', error)
    }
  }

  // ========================================================================
  // REPORTING
  // ========================================================================
  
  async generatePerformanceReport(): Promise<string> {
    const strategies = await this.getAllStrategyPerformance()
    
    let report = '\n📊 PERFORMANCE REPORT\n'
    report += '='.repeat(80) + '\n\n'

    for (const strategy of strategies) {
      report += `Strategy: ${strategy.strategyName}\n`
      report += `-`.repeat(80) + '\n'
      report += `Total Trades: ${strategy.totalTrades}\n`
      report += `Win Rate: ${strategy.winRate.toFixed(2)}%\n`
      report += `Total P&L: $${strategy.totalPnl.toFixed(2)}\n`
      report += `Avg Win: $${strategy.avgWin.toFixed(2)}\n`
      report += `Avg Loss: $${strategy.avgLoss.toFixed(2)}\n`
      report += `Avg R-Multiple: ${strategy.avgRMultiple.toFixed(2)}R\n`
      report += `Profit Factor: ${strategy.profitFactor.toFixed(2)}\n`
      report += `Sharpe Ratio: ${strategy.sharpeRatio.toFixed(2)}\n`
      report += `Max Drawdown: $${strategy.maxDrawdown.toFixed(2)}\n`
      report += `Recent Win Rate (30d): ${strategy.recentWinRate.toFixed(2)}%\n`
      report += `Recent Avg R (30d): ${strategy.recentAvgR.toFixed(2)}R\n`
      report += '\n'
    }

    return report
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

let globalTracker: PerformanceTracker | null = null

export function getPerformanceTracker(): PerformanceTracker {
  if (!globalTracker) {
    globalTracker = new PerformanceTracker()
  }
  return globalTracker
}
