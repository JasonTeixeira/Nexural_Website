// SIGNAL COMBINER - WEIGHTED VOTING & CONFLICT RESOLUTION
// Combines multiple strategy signals intelligently

import { FuturesSymbol } from './futures-trading-integration-complete'
import { StrategySignal } from './trading-strategies-complete'

// ============================================================================
// TYPES
// ============================================================================

export interface CombinedSignal {
  id: string
  symbol: FuturesSymbol
  direction: 'LONG' | 'SHORT'
  entry: number
  stopLoss: number
  target1: number
  target2: number
  confidence: number
  positionSize: number
  strategies: string[]
  strategyConfidences: Record<string, number>
  reasoning: string[]
  timestamp: number
  conflictResolution: 'weighted_voting' | 'first_wins' | 'highest_confidence' | 'all_separate'
}

export type ConflictResolutionMethod = 
  | 'weighted_voting'    // Recommended: Combine agreeing signals
  | 'first_wins'         // First signal takes precedence
  | 'highest_confidence' // Highest confidence wins
  | 'all_separate'       // Send all signals separately

// ============================================================================
// SIGNAL COMBINER
// ============================================================================

export class SignalCombiner {
  private conflictResolution: ConflictResolutionMethod

  constructor(conflictResolution: ConflictResolutionMethod = 'weighted_voting') {
    this.conflictResolution = conflictResolution
  }

  /**
   * Combine multiple strategy signals for the same ticker
   * Returns null if signals conflict and should not be sent
   */
  combineSignals(
    symbol: FuturesSymbol,
    signals: StrategySignal[]
  ): CombinedSignal | CombinedSignal[] | null {
    
    if (signals.length === 0) {
      return null
    }

    // Single signal - no combining needed
    if (signals.length === 1) {
      return this.convertToCombin edSignal(signals[0])
    }

    // Multiple signals - apply conflict resolution
    switch (this.conflictResolution) {
      case 'weighted_voting':
        return this.weightedVoting(symbol, signals)
      
      case 'first_wins':
        return this.firstWins(signals)
      
      case 'highest_confidence':
        return this.highestConfidence(signals)
      
      case 'all_separate':
        return this.allSeparate(signals)
      
      default:
        return this.weightedVoting(symbol, signals)
    }
  }

  /**
   * WEIGHTED VOTING (RECOMMENDED)
   * Combines signals that agree, filters conflicts
   */
  private weightedVoting(
    symbol: FuturesSymbol,
    signals: StrategySignal[]
  ): CombinedSignal | null {
    
    // Group signals by direction
    const longSignals = signals.filter(s => s.direction === 'LONG')
    const shortSignals = signals.filter(s => s.direction === 'SHORT')

    // Check for conflict
    if (longSignals.length > 0 && shortSignals.length > 0) {
      console.log(`⚠️ ${symbol} Signal Conflict:`)
      console.log(`  LONG: ${longSignals.map(s => `${s.strategy} (${(s.confidence * 100).toFixed(1)}%)`).join(', ')}`)
      console.log(`  SHORT: ${shortSignals.map(s => `${s.strategy} (${(s.confidence * 100).toFixed(1)}%)`).join(', ')}`)
      console.log(`  → No signal sent (waiting for agreement)`)
      return null // Don't send conflicting signals
    }

    // All signals agree - combine them
    const agreeingSignals = longSignals.length > 0 ? longSignals : shortSignals
    const direction = agreeingSignals[0].direction

    // Calculate weighted average confidence
    const totalConfidence = agreeingSignals.reduce((sum, s) => sum + s.confidence, 0)
    const combinedConfidence = totalConfidence / agreeingSignals.length

    // Calculate weighted average entry (in case they differ slightly)
    const weightedEntry = agreeingSignals.reduce((sum, s) => 
      sum + (s.entry * s.confidence), 0
    ) / totalConfidence

    // Use the tightest stop loss (most conservative)
    const stopLoss = direction === 'LONG'
      ? Math.max(...agreeingSignals.map(s => s.stopLoss))
      : Math.min(...agreeingSignals.map(s => s.stopLoss))

    // Use the most conservative target1 (closest)
    const target1 = direction === 'LONG'
      ? Math.min(...agreeingSignals.map(s => s.target1))
      : Math.max(...agreeingSignals.map(s => s.target1))

    // Use the most aggressive target2 (furthest)
    const target2 = direction === 'LONG'
      ? Math.max(...agreeingSignals.map(s => s.target2))
      : Math.min(...agreeingSignals.map(s => s.target2))

    // Combine reasoning from all strategies
    const allReasoning: string[] = []
    const strategyConfidences: Record<string, number> = {}
    
    agreeingSignals.forEach(signal => {
      allReasoning.push(`${signal.strategy}: ${signal.reasoning.join(', ')}`)
      strategyConfidences[signal.strategy] = signal.confidence
    })

    // Increase position size if multiple strategies agree
    const positionSizeMultiplier = Math.min(1 + (agreeingSignals.length - 1) * 0.25, 2.0)

    return {
      id: `combined_${symbol}_${Date.now()}`,
      symbol,
      direction,
      entry: weightedEntry,
      stopLoss,
      target1,
      target2,
      confidence: combinedConfidence,
      positionSize: positionSizeMultiplier,
      strategies: agreeingSignals.map(s => s.strategy),
      strategyConfidences,
      reasoning: allReasoning,
      timestamp: Date.now(),
      conflictResolution: 'weighted_voting'
    }
  }

  /**
   * FIRST WINS
   * First signal takes precedence, others ignored
   */
  private firstWins(signals: StrategySignal[]): CombinedSignal {
    return this.convertToCombinedSignal(signals[0])
  }

  /**
   * HIGHEST CONFIDENCE
   * Signal with highest confidence wins
   */
  private highestConfidence(signals: StrategySignal[]): CombinedSignal {
    const highest = signals.reduce((max, signal) => 
      signal.confidence > max.confidence ? signal : max
    )
    return this.convertToCombinedSignal(highest)
  }

  /**
   * ALL SEPARATE
   * Send all signals separately (can cause Discord spam)
   */
  private allSeparate(signals: StrategySignal[]): CombinedSignal[] {
    return signals.map(s => this.convertToCombinedSignal(s))
  }

  /**
   * Convert single strategy signal to combined signal format
   */
  private convertToCombinedSignal(signal: StrategySignal): CombinedSignal {
    return {
      id: `single_${signal.id}`,
      symbol: signal.symbol,
      direction: signal.direction,
      entry: signal.entry,
      stopLoss: signal.stopLoss,
      target1: signal.target1,
      target2: signal.target2,
      confidence: signal.confidence,
      positionSize: 1.0,
      strategies: [signal.strategy],
      strategyConfidences: { [signal.strategy]: signal.confidence },
      reasoning: signal.reasoning,
      timestamp: signal.timestamp,
      conflictResolution: this.conflictResolution
    }
  }

  /**
   * Update conflict resolution method
   */
  setConflictResolution(method: ConflictResolutionMethod): void {
    this.conflictResolution = method
    console.log(`✅ Conflict resolution updated to: ${method}`)
  }

  /**
   * Get current conflict resolution method
   */
  getConflictResolution(): ConflictResolutionMethod {
    return this.conflictResolution
  }
}

// ============================================================================
// STRATEGY MANAGER
// ============================================================================

export interface StrategyConfig {
  strategyName: string
  enabled: boolean
  tickers: FuturesSymbol[]
  confidenceThreshold: number
}

export class StrategyManager {
  private configs: Map<string, StrategyConfig> = new Map()
  private signalCombiner: SignalCombiner

  constructor(conflictResolution: ConflictResolutionMethod = 'weighted_voting') {
    this.signalCombiner = new SignalCombiner(conflictResolution)
  }

  /**
   * Register a strategy configuration
   */
  registerStrategy(config: StrategyConfig): void {
    this.configs.set(config.strategyName, config)
    console.log(`✅ Registered strategy: ${config.strategyName}`)
    console.log(`   Enabled: ${config.enabled}`)
    console.log(`   Tickers: ${config.tickers.join(', ')}`)
    console.log(`   Min Confidence: ${(config.confidenceThreshold * 100).toFixed(0)}%`)
  }

  /**
   * Check if a strategy is enabled for a ticker
   */
  isStrategyEnabledForTicker(strategyName: string, ticker: FuturesSymbol): boolean {
    const config = this.configs.get(strategyName)
    if (!config) return false
    return config.enabled && config.tickers.includes(ticker)
  }

  /**
   * Get all enabled strategies for a ticker
   */
  getEnabledStrategiesForTicker(ticker: FuturesSymbol): string[] {
    const enabled: string[] = []
    
    for (const [name, config] of this.configs.entries()) {
      if (config.enabled && config.tickers.includes(ticker)) {
        enabled.push(name)
      }
    }
    
    return enabled
  }

  /**
   * Filter signals based on configuration
   */
  filterSignals(signals: StrategySignal[]): StrategySignal[] {
    return signals.filter(signal => {
      const config = this.configs.get(signal.strategy)
      
      if (!config) {
        console.log(`⚠️ No config found for strategy: ${signal.strategy}`)
        return false
      }

      // Check if strategy is enabled
      if (!config.enabled) {
        return false
      }

      // Check if ticker is enabled for this strategy
      if (!config.tickers.includes(signal.symbol)) {
        return false
      }

      // Check confidence threshold
      if (signal.confidence < config.confidenceThreshold) {
        console.log(`⚠️ ${signal.strategy} signal for ${signal.symbol} below threshold: ${(signal.confidence * 100).toFixed(1)}% < ${(config.confidenceThreshold * 100).toFixed(0)}%`)
        return false
      }

      return true
    })
  }

  /**
   * Process signals: filter and combine
   */
  processSignals(
    ticker: FuturesSymbol,
    signals: StrategySignal[]
  ): CombinedSignal | CombinedSignal[] | null {
    
    // Filter signals based on configuration
    const filteredSignals = this.filterSignals(signals)

    if (filteredSignals.length === 0) {
      return null
    }

    // Combine signals
    return this.signalCombiner.combineSignals(ticker, filteredSignals)
  }

  /**
   * Get strategy configuration
   */
  getStrategyConfig(strategyName: string): StrategyConfig | undefined {
    return this.configs.get(strategyName)
  }

  /**
   * Get all strategy configurations
   */
  getAllConfigs(): StrategyConfig[] {
    return Array.from(this.configs.values())
  }

  /**
   * Update strategy configuration
   */
  updateStrategyConfig(strategyName: string, updates: Partial<StrategyConfig>): void {
    const config = this.configs.get(strategyName)
    if (!config) {
      console.error(`❌ Strategy not found: ${strategyName}`)
      return
    }

    const updated = { ...config, ...updates }
    this.configs.set(strategyName, updated)
    console.log(`✅ Updated strategy config: ${strategyName}`)
  }

  /**
   * Enable/disable a strategy
   */
  setStrategyEnabled(strategyName: string, enabled: boolean): void {
    this.updateStrategyConfig(strategyName, { enabled })
  }

  /**
   * Update conflict resolution method
   */
  setConflictResolution(method: ConflictResolutionMethod): void {
    this.signalCombiner.setConflictResolution(method)
  }

  /**
   * Get current conflict resolution method
   */
  getConflictResolution(): ConflictResolutionMethod {
    return this.signalCombiner.getConflictResolution()
  }

  /**
   * Get status summary
   */
  getStatus(): {
    totalStrategies: number
    enabledStrategies: number
    conflictResolution: ConflictResolutionMethod
    strategies: StrategyConfig[]
  } {
    const allConfigs = this.getAllConfigs()
    
    return {
      totalStrategies: allConfigs.length,
      enabledStrategies: allConfigs.filter(c => c.enabled).length,
      conflictResolution: this.getConflictResolution(),
      strategies: allConfigs
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format combined signal for Discord
 */
export function formatCombinedSignalForDiscord(signal: CombinedSignal): string {
  const directionEmoji = signal.direction === 'LONG' ? '🟢' : '🔴'
  const strategyCount = signal.strategies.length
  
  let message = `${directionEmoji} **${signal.direction} ${signal.symbol}**\n\n`

  if (strategyCount > 1) {
    message += `✨ **${strategyCount} Strategies Agree!**\n`
    signal.strategies.forEach(strategy => {
      const conf = signal.strategyConfidences[strategy]
      message += `✓ ${strategy} (${(conf * 100).toFixed(1)}%)\n`
    })
    message += `\n**Combined Confidence: ${(signal.confidence * 100).toFixed(1)}%**\n\n`
  } else {
    message += `**Strategy:** ${signal.strategies[0]}\n`
    message += `**Confidence:** ${(signal.confidence * 100).toFixed(1)}%\n\n`
  }

  message += `📊 **Entry:** $${signal.entry.toFixed(2)}\n`
  message += `🛑 **Stop Loss:** $${signal.stopLoss.toFixed(2)}\n`
  message += `🎯 **Target 1:** $${signal.target1.toFixed(2)}\n`
  message += `🎯 **Target 2:** $${signal.target2.toFixed(2)}\n`
  
  if (signal.positionSize !== 1.0) {
    message += `📦 **Position Size:** ${signal.positionSize.toFixed(2)}x\n`
  }

  message += `\n💡 **Reasoning:**\n`
  signal.reasoning.forEach(reason => {
    message += `• ${reason}\n`
  })

  return message
}

/**
 * Calculate risk/reward ratio
 */
export function calculateRiskReward(signal: CombinedSignal): {
  riskReward1: number
  riskReward2: number
} {
  const risk = Math.abs(signal.entry - signal.stopLoss)
  const reward1 = Math.abs(signal.target1 - signal.entry)
  const reward2 = Math.abs(signal.target2 - signal.entry)

  return {
    riskReward1: reward1 / risk,
    riskReward2: reward2 / risk
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  SignalCombiner,
  StrategyManager
}
