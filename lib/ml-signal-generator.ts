/**
 * ML Signal Generator
 * Generates trading signals from ML predictions and sends to Discord
 */

import { createClient } from '@supabase/supabase-js'
import { getMLInferenceService } from './ml-inference-service'
import { sendDiscordSignal } from './discord-webhooks-18-symbols'

export interface MLSignalConfig {
  minConfidence: number // Minimum confidence threshold (0-1)
  minProbability: number // Minimum win probability (0-1)
  symbols: string[] // Symbols to generate signals for
  enabled: boolean // Whether ML signals are enabled
}

export class MLSignalGenerator {
  private supabase: any
  private inferenceService: any
  private config: MLSignalConfig
  
  constructor(config?: Partial<MLSignalConfig>) {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    this.inferenceService = getMLInferenceService()
    
    // Default configuration
    this.config = {
      minConfidence: 0.7, // 70% confidence minimum
      minProbability: 0.6, // 60% win probability minimum
      symbols: ['ES', 'NQ', 'YM', 'RTY'], // Start with equity indices
      enabled: true,
      ...config
    }
  }
  
  /**
   * Generate signals for all configured symbols
   */
  async generateSignals(): Promise<any[]> {
    if (!this.config.enabled) {
      console.log('ML signal generation is disabled')
      return []
    }
    
    console.log('\n🤖 ML SIGNAL GENERATION')
    console.log('=' .repeat(60))
    console.log(`Symbols: ${this.config.symbols.join(', ')}`)
    console.log(`Min Confidence: ${this.config.minConfidence}`)
    console.log(`Min Probability: ${this.config.minProbability}`)
    
    const signals: any[] = []
    
    for (const symbol of this.config.symbols) {
      try {
        const signal = await this.generateSignalForSymbol(symbol)
        if (signal) {
          signals.push(signal)
        }
      } catch (error: any) {
        console.error(`Error generating signal for ${symbol}:`, error.message)
      }
    }
    
    console.log(`\n✅ Generated ${signals.length} signals`)
    return signals
  }
  
  /**
   * Generate signal for a single symbol
   */
  private async generateSignalForSymbol(symbol: string): Promise<any | null> {
    console.log(`\n📊 Processing ${symbol}...`)
    
    // Get ML prediction
    const prediction = await this.inferenceService.predict(symbol)
    
    if (!prediction) {
      console.log(`   No prediction available for ${symbol}`)
      return null
    }
    
    console.log(`   Prediction: ${prediction.prediction === 1 ? 'WIN' : 'LOSS'}`)
    console.log(`   Probability: ${(prediction.probability * 100).toFixed(1)}%`)
    console.log(`   Confidence: ${(prediction.confidence * 100).toFixed(1)}%`)
    
    // Check if prediction meets thresholds
    if (prediction.prediction === 0) {
      console.log(`   ❌ Prediction is LOSS - skipping`)
      return null
    }
    
    if (prediction.confidence < this.config.minConfidence) {
      console.log(`   ❌ Confidence too low (${(prediction.confidence * 100).toFixed(1)}% < ${(this.config.minConfidence * 100).toFixed(1)}%)`)
      return null
    }
    
    if (prediction.probability < this.config.minProbability) {
      console.log(`   ❌ Probability too low (${(prediction.probability * 100).toFixed(1)}% < ${(this.config.minProbability * 100).toFixed(1)}%)`)
      return null
    }
    
    // Get current market price
    const currentPrice = await this.getCurrentPrice(symbol)
    if (!currentPrice) {
      console.log(`   ❌ No current price available`)
      return null
    }
    
    // Determine direction based on features
    const direction = this.determineDirection(prediction.features)
    
    // Calculate entry, stop loss, and targets
    const signalParams = this.calculateSignalParameters(
      currentPrice,
      direction,
      prediction.confidence
    )
    
    // Create signal
    const signal = {
      symbol,
      direction,
      entry_price: signalParams.entry,
      stop_loss: signalParams.stopLoss,
      target_1: signalParams.target1,
      target_2: signalParams.target2,
      target_3: signalParams.target3,
      confidence: prediction.confidence,
      probability: prediction.probability,
      model_id: prediction.model_id,
      source: 'ML',
      status: 'open',
      created_at: new Date().toISOString()
    }
    
    console.log(`   ✅ Signal generated: ${direction} @ ${signalParams.entry}`)
    
    // Save to database
    await this.saveSignal(signal)
    
    // Send to Discord
    await this.sendToDiscord(signal)
    
    return signal
  }
  
  /**
   * Get current market price for symbol
   */
  private async getCurrentPrice(symbol: string): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from('live_market_data')
        .select('price')
        .eq('symbol', symbol)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
      
      if (error) throw error
      
      return data?.price || null
    } catch (error) {
      return null
    }
  }
  
  /**
   * Determine trade direction from features
   */
  private determineDirection(features: any): 'long' | 'short' {
    // Use momentum and trend features to determine direction
    const momentum = features.feature_momentum_5 || 0
    const trend = features.feature_sma_20_50_cross || 0
    
    // If momentum and trend are positive, go long
    if (momentum > 0 && trend > 0) {
      return 'long'
    }
    
    // If momentum and trend are negative, go short
    if (momentum < 0 && trend < 0) {
      return 'short'
    }
    
    // Default to long if unclear
    return momentum >= 0 ? 'long' : 'short'
  }
  
  /**
   * Calculate signal parameters (entry, stop, targets)
   */
  private calculateSignalParameters(
    currentPrice: number,
    direction: 'long' | 'short',
    confidence: number
  ): any {
    // Risk percentage based on confidence (higher confidence = tighter stop)
    const riskPercent = 0.02 * (1 - confidence * 0.5) // 1-2% risk
    
    // Calculate stop loss
    const stopDistance = currentPrice * riskPercent
    const stopLoss = direction === 'long' 
      ? currentPrice - stopDistance
      : currentPrice + stopDistance
    
    // Calculate targets (1R, 2R, 3R)
    const target1Distance = stopDistance * 1
    const target2Distance = stopDistance * 2
    const target3Distance = stopDistance * 3
    
    const target1 = direction === 'long'
      ? currentPrice + target1Distance
      : currentPrice - target1Distance
    
    const target2 = direction === 'long'
      ? currentPrice + target2Distance
      : currentPrice - target2Distance
    
    const target3 = direction === 'long'
      ? currentPrice + target3Distance
      : currentPrice - target3Distance
    
    return {
      entry: currentPrice,
      stopLoss: Number(stopLoss.toFixed(2)),
      target1: Number(target1.toFixed(2)),
      target2: Number(target2.toFixed(2)),
      target3: Number(target3.toFixed(2))
    }
  }
  
  /**
   * Save signal to database
   */
  private async saveSignal(signal: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('signals')
        .insert(signal)
      
      if (error) throw error
      
      console.log(`   💾 Saved to database`)
    } catch (error: any) {
      console.error(`   ❌ Error saving signal:`, error.message)
    }
  }
  
  /**
   * Send signal to Discord
   */
  private async sendToDiscord(signal: any): Promise<void> {
    try {
      await sendDiscordSignal(signal.symbol, {
        action: 'ML_SIGNAL',
        direction: signal.direction,
        entry: signal.entry_price,
        stopLoss: signal.stop_loss,
        targets: [signal.target_1, signal.target_2, signal.target_3],
        confidence: signal.confidence,
        reasoning: `ML Model Prediction (${(signal.probability * 100).toFixed(1)}% win probability)`
      })
      
      console.log(`   📢 Sent to Discord`)
    } catch (error: any) {
      console.error(`   ❌ Error sending to Discord:`, error.message)
    }
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<MLSignalConfig>): void {
    this.config = { ...this.config, ...config }
  }
  
  /**
   * Get current configuration
   */
  getConfig(): MLSignalConfig {
    return { ...this.config }
  }
}

// Singleton instance
let signalGenerator: MLSignalGenerator | null = null

export function getMLSignalGenerator(config?: Partial<MLSignalConfig>): MLSignalGenerator {
  if (!signalGenerator) {
    signalGenerator = new MLSignalGenerator(config)
  }
  return signalGenerator
}
