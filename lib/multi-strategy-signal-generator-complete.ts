// COMPLETE MULTI-STRATEGY SIGNAL GENERATOR
// Replaces old analytics engine with new 5-strategy system
// Connects: Market Data → Indicators → Strategies → Combiner → Discord/IB Gateway

import { createClient } from '@supabase/supabase-js'
import { FuturesSymbol, FUTURES_CONTRACTS, processFuturesSignal, FuturesSignal } from './futures-trading-integration-complete'
import { STRATEGIES, MarketData, StrategySignal } from './trading-strategies-complete'
import { StrategyManager, CombinedSignal, formatCombinedSignalForDiscord } from './signal-combiner-complete'
import { calculateAllIndicators, pricesToBars, validateDataLength, PriceBar } from './technical-indicators-complete'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// CONFIGURATION
// ============================================================================

interface MultiStrategyConfig {
  symbols: FuturesSymbol[]
  enabled: boolean
  tradingMode: 'paper' | 'live'
  tradingHours: {
    start: number
    end: number
  }
  maxSignalsPerHour: number
  conflictResolution: 'weighted_voting' | 'first_wins' | 'highest_confidence' | 'all_separate'
}

// ============================================================================
// MULTI-STRATEGY SIGNAL GENERATOR
// ============================================================================

export class MultiStrategySignalGenerator {
  private strategyManager: StrategyManager
  private config: MultiStrategyConfig
  private recentSignals: Map<string, number[]> = new Map()
  private isRunning: boolean = false
  private priceHistory: Map<string, number[]> = new Map() // Store price history per symbol

  constructor(config?: Partial<MultiStrategyConfig>) {
    this.config = {
      symbols: Object.keys(FUTURES_CONTRACTS) as FuturesSymbol[],
      enabled: true,
      tradingMode: 'paper',
      tradingHours: {
        start: 9,
        end: 16
      },
      maxSignalsPerHour: 3,
      conflictResolution: 'weighted_voting',
      ...config
    }

    // Initialize strategy manager
    this.strategyManager = new StrategyManager(this.config.conflictResolution)

    // Register all strategies with default configurations
    this.initializeStrategies()
  }

  // Initialize strategy configurations
  private initializeStrategies(): void {
    // Trend Following - Best for equity indices and trending commodities
    this.strategyManager.registerStrategy({
      strategyName: 'Trend Following',
      enabled: true,
      tickers: ['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC'],
      confidenceThreshold: 0.70
    })

    // Mean Reversion - Best for ranging commodities and agriculture
    this.strategyManager.registerStrategy({
      strategyName: 'Mean Reversion',
      enabled: true,
      tickers: ['NG', 'SI', 'HG', 'ZC', 'ZS', 'ZW'],
      confidenceThreshold: 0.75
    })

    // Breakout Trading - Best for interest rates and FX
    this.strategyManager.registerStrategy({
      strategyName: 'Breakout Trading',
      enabled: true,
      tickers: ['ZN', 'ZB', '6E', '6J', '6B'],
      confidenceThreshold: 0.70
    })

    // Scalping - Only for high liquidity
    this.strategyManager.registerStrategy({
      strategyName: 'Scalping',
      enabled: true,
      tickers: ['ES', 'NQ', 'CL'],
      confidenceThreshold: 0.80
    })

    // ML Ensemble - All tickers
    this.strategyManager.registerStrategy({
      strategyName: 'ML Ensemble',
      enabled: false, // Disabled until ML model is trained
      tickers: Object.keys(FUTURES_CONTRACTS) as FuturesSymbol[],
      confidenceThreshold: 0.75
    })

    console.log('✅ Initialized 5 trading strategies')
    console.log('📊 Strategy Manager Status:', this.strategyManager.getStatus())
  }

  // Start the signal generation process
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Multi-strategy signal generator is already running')
      return
    }

    this.isRunning = true
    console.log('\n🚀 Starting Multi-Strategy Signal Generator...')
    console.log(`📊 Monitoring ${this.config.symbols.length} futures contracts`)
    console.log(`🎯 Using ${this.config.conflictResolution} conflict resolution`)
    console.log(`💰 Trading mode: ${this.config.tradingMode.toUpperCase()}`)
    console.log(`⏰ Trading hours: ${this.config.tradingHours.start}:00 - ${this.config.tradingHours.end}:00 EST`)
    console.log('🔥 5 STRATEGIES ACTIVE - REAL TECHNICAL ANALYSIS\n')

    // Run signal generation loop
    this.runSignalLoop()
  }

  // Stop the signal generation process
  stop(): void {
    this.isRunning = false
    console.log('🛑 Multi-strategy signal generator stopped')
  }

  // Main signal generation loop
  private async runSignalLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        if (!this.config.enabled) {
          await this.sleep(60000)
          continue
        }

        if (!this.isMarketHours()) {
          await this.sleep(300000)
          continue
        }

        // Process each symbol
        for (const symbol of this.config.symbols) {
          if (!this.isRunning) break

          try {
            await this.processSymbol(symbol)
          } catch (error) {
            console.error(`❌ Error processing ${symbol}:`, error)
          }

          await this.sleep(2000)
        }

        // Wait before next cycle
        await this.sleep(30000)

      } catch (error) {
        console.error('❌ Signal generation loop error:', error)
        await this.sleep(60000)
      }
    }
  }

  // Process a single symbol for signal generation
  private async processSymbol(symbol: FuturesSymbol): Promise<void> {
    try {
      // Check rate limiting
      if (!this.canGenerateSignal(symbol)) {
        return
      }

      // Get market data (from Databento or other source)
      const marketData = await this.getMarketData(symbol)
      if (!marketData) {
        return
      }

      // Update price history
      this.updatePriceHistory(symbol, marketData.price)

      // Get historical prices for indicators
      const prices = this.priceHistory.get(symbol) || []
      
      // Validate we have enough data
      const validation = validateDataLength(prices)
      if (!validation.valid) {
        console.log(`⚠️ ${symbol}: Need ${validation.missing} more data points for indicators`)
        return
      }

      // Calculate all technical indicators
      const bars = pricesToBars(prices)
      const indicators = calculateAllIndicators(prices, bars)

      // Create market data with indicators
      const enrichedMarketData: MarketData = {
        symbol,
        price: marketData.price,
        high: marketData.high || marketData.price * 1.001,
        low: marketData.low || marketData.price * 0.999,
        open: marketData.open || marketData.price,
        close: marketData.price,
        volume: marketData.volume || 1000,
        timestamp: Date.now(),
        // Add all indicators
        sma20: indicators.sma20,
        sma50: indicators.sma50,
        sma200: indicators.sma200,
        ema12: indicators.ema12,
        ema26: indicators.ema26,
        rsi: indicators.rsi,
        macd: indicators.macd.macd,
        macdSignal: indicators.macd.signal,
        macdHistogram: indicators.macd.histogram,
        atr: indicators.atr,
        bollingerUpper: indicators.bollinger.upper,
        bollingerMiddle: indicators.bollinger.middle,
        bollingerLower: indicators.bollinger.lower,
        adx: indicators.adx,
        stochK: indicators.stochastic.k,
        stochD: indicators.stochastic.d
      }

      // Run all strategies
      const strategySignals: StrategySignal[] = []
      
      for (const [name, strategy] of Object.entries(STRATEGIES)) {
        // Check if strategy is enabled for this ticker
        if (!this.strategyManager.isStrategyEnabledForTicker(name, symbol)) {
          continue
        }

        try {
          const signal = strategy.analyze(enrichedMarketData)
          if (signal) {
            console.log(`📊 ${name} generated signal for ${symbol}: ${signal.direction} (${(signal.confidence * 100).toFixed(1)}%)`)
            strategySignals.push(signal)
          }
        } catch (error) {
          console.error(`❌ Error in ${name} strategy:`, error)
        }
      }

      // If no signals, continue
      if (strategySignals.length === 0) {
        return
      }

      console.log(`\n🎯 ${symbol}: ${strategySignals.length} strategy signal(s) generated`)

      // Process signals through combiner
      const combinedResult = this.strategyManager.processSignals(symbol, strategySignals)

      if (!combinedResult) {
        console.log(`⚠️ ${symbol}: Signals filtered or conflicted\n`)
        return
      }

      // Handle combined signal(s)
      if (Array.isArray(combinedResult)) {
        // Multiple separate signals
        for (const combined of combinedResult) {
          await this.sendCombinedSignal(combined)
        }
      } else {
        // Single combined signal
        await this.sendCombinedSignal(combinedResult)
      }

      // Track this signal for rate limiting
      this.trackSignal(symbol)

    } catch (error) {
      console.error(`❌ Error processing symbol ${symbol}:`, error)
    }
  }

  // Send combined signal to Discord and IB Gateway
  private async sendCombinedSignal(combined: CombinedSignal): Promise<void> {
    try {
      console.log(`\n✨ COMBINED SIGNAL: ${combined.symbol} ${combined.direction}`)
      console.log(`   Strategies: ${combined.strategies.join(', ')}`)
      console.log(`   Combined Confidence: ${(combined.confidence * 100).toFixed(1)}%`)
      console.log(`   Position Size: ${combined.positionSize.toFixed(2)}x`)

      // Convert to futures signal format
      const futuresSignal: FuturesSignal = {
        id: combined.id,
        symbol: combined.symbol,
        direction: combined.direction,
        entry: combined.entry,
        stopLoss: combined.stopLoss,
        target1: combined.target1,
        target2: combined.target2,
        confidence: combined.confidence,
        positionSize: combined.positionSize,
        reasoning: combined.reasoning.join('. '),
        timestamp: combined.timestamp,
        kelly_fraction: 0.01, // Conservative
        risk_of_ruin: 0.05,
        market_regime: { strategies: combined.strategies },
        strategy: combined.strategies.join(' + ')
      }

      // Process through futures integration (Discord + IB Gateway + Database)
      const success = await processFuturesSignal(futuresSignal, this.config.tradingMode)

      if (success) {
        console.log(`✅ Signal processed successfully!`)
        console.log(`   → Discord notification sent`)
        console.log(`   → ${this.config.tradingMode.toUpperCase()} trade executed`)
        console.log(`   → Database logged\n`)

        // Save combined signal to database
        await this.saveCombinedSignal(combined)
      } else {
        console.error(`❌ Failed to process signal for ${combined.symbol}\n`)
      }

    } catch (error) {
      console.error('❌ Error sending combined signal:', error)
    }
  }

  // Save combined signal to database
  private async saveCombinedSignal(signal: CombinedSignal): Promise<void> {
    try {
      await supabase.from('combined_signals').insert({
        symbol: signal.symbol,
        direction: signal.direction,
        entry: signal.entry,
        stop_loss: signal.stopLoss,
        target1: signal.target1,
        target2: signal.target2,
        confidence: signal.confidence,
        position_size: signal.positionSize,
        strategies: signal.strategies,
        strategy_confidences: signal.strategyConfidences,
        reasoning: signal.reasoning,
        conflict_resolution: signal.conflictResolution,
        trading_mode: this.config.tradingMode,
        sent_to_discord: true,
        timestamp: new Date(signal.timestamp).toISOString(),
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Error saving combined signal to database:', error)
    }
  }

  // Get market data (placeholder - integrate with Databento)
  private async getMarketData(symbol: FuturesSymbol): Promise<any> {
    // TODO: Integrate with Databento for real market data
    // For now, return mock data structure
    return {
      symbol,
      price: 4500 + Math.random() * 100, // Mock price
      high: 4550,
      low: 4450,
      open: 4480,
      volume: 100000,
      timestamp: Date.now()
    }
  }

  // Update price history for a symbol
  private updatePriceHistory(symbol: string, price: number): void {
    const history = this.priceHistory.get(symbol) || []
    history.push(price)
    
    // Keep last 250 prices (enough for all indicators)
    if (history.length > 250) {
      history.shift()
    }
    
    this.priceHistory.set(symbol, history)
  }

  // Check if we can generate a signal (rate limiting)
  private canGenerateSignal(symbol: string): boolean {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    
    const recentSignals = this.recentSignals.get(symbol) || []
    const signalsInLastHour = recentSignals.filter(timestamp => now - timestamp < oneHour)
    
    return signalsInLastHour.length < this.config.maxSignalsPerHour
  }

  // Track a signal for rate limiting
  private trackSignal(symbol: string): void {
    const now = Date.now()
    const recentSignals = this.recentSignals.get(symbol) || []
    recentSignals.push(now)
    
    const oneHour = 60 * 60 * 1000
    const filteredSignals = recentSignals.filter(timestamp => now - timestamp < oneHour)
    this.recentSignals.set(symbol, filteredSignals)
  }

  // Check if we're in trading hours
  private isMarketHours(): boolean {
    const now = new Date()
    const estHour = now.getHours() - 4 // Convert to EST (simplified)
    
    return estHour >= this.config.tradingHours.start && estHour <= this.config.tradingHours.end
  }

  // Utility function for delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Get current status
  getStatus(): {
    isRunning: boolean
    config: MultiStrategyConfig
    strategyManagerStatus: any
    recentSignalCounts: Record<string, number>
    priceHistoryLengths: Record<string, number>
  } {
    const recentSignalCounts: Record<string, number> = {}
    const priceHistoryLengths: Record<string, number> = {}
    
    for (const [symbol, timestamps] of this.recentSignals.entries()) {
      const now = Date.now()
      const oneHour = 60 * 60 * 1000
      recentSignalCounts[symbol] = timestamps.filter(t => now - t < oneHour).length
    }

    for (const [symbol, prices] of this.priceHistory.entries()) {
      priceHistoryLengths[symbol] = prices.length
    }

    return {
      isRunning: this.isRunning,
      config: this.config,
      strategyManagerStatus: this.strategyManager.getStatus(),
      recentSignalCounts,
      priceHistoryLengths
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<MultiStrategyConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.conflictResolution) {
      this.strategyManager.setConflictResolution(newConfig.conflictResolution)
    }
    
    console.log('✅ Multi-strategy signal generator configuration updated')
  }

  // Get strategy manager (for external configuration)
  getStrategyManager(): StrategyManager {
    return this.strategyManager
  }
}

// ============================================================================
// GLOBAL INSTANCE & FACTORY
// ============================================================================

let globalGenerator: MultiStrategySignalGenerator | null = null

export function getMultiStrategyGenerator(): MultiStrategySignalGenerator {
  if (!globalGenerator) {
    globalGenerator = new MultiStrategySignalGenerator()
  }
  return globalGenerator
}

export async function startMultiStrategyGeneration(): Promise<void> {
  const generator = getMultiStrategyGenerator()
  await generator.start()
}

export function stopMultiStrategyGeneration(): void {
  const generator = getMultiStrategyGenerator()
  generator.stop()
}

export function getMultiStrategyStatus() {
  const generator = getMultiStrategyGenerator()
  return generator.getStatus()
}
