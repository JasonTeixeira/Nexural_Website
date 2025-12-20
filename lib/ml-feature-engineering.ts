/**
 * ML Feature Engineering Service
 * Converts market data into ML-ready features
 * Adapted from ML Factory Python implementation
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface MarketDataPoint {
  timestamp: Date
  symbol: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface FeatureSet {
  timestamp: Date
  symbol: string
  
  // Price features
  returns: number
  log_returns: number
  high_low_diff: number
  close_open_diff: number
  normalized_price: number
  high_close_ratio: number
  low_close_ratio: number
  momentum_1: number
  momentum_5: number
  momentum_10: number
  momentum_20: number
  
  // Volume features
  volume_change: number
  volume_ma5: number
  volume_ma20: number
  volume_ratio_5: number
  volume_ratio_20: number
  obv: number
  
  // Technical indicators
  ma_5: number
  ma_10: number
  ma_20: number
  ma_50: number
  ema_12: number
  ema_26: number
  rsi: number
  macd: number
  macd_signal: number
  macd_hist: number
  bb_upper: number
  bb_lower: number
  bb_middle: number
  bb_width: number
  bb_position: number
  atr: number
  atr_ratio: number
  
  // Regime features
  volatility: number
  volatility_regime: number
  trend: number
  trend_regime: number
  volume_regime: number
}

export class MLFeatureEngineer {
  private requiredFeatures: Set<string> = new Set()

  /**
   * Generate all features for market data
   */
  async generateFeatures(data: MarketDataPoint[]): Promise<FeatureSet[]> {
    if (data.length < 200) {
      throw new Error('Need at least 200 data points for feature generation')
    }

    console.log(`Generating features for ${data.length} data points`)

    // Sort by timestamp
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    // Generate features
    let features = this.generatePriceFeatures(sortedData)
    features = this.generateVolumeFeatures(features)
    features = this.generateTechnicalIndicators(features)
    features = this.generateRegimeFeatures(features)

    // Remove NaN values from beginning (due to rolling calculations)
    const cleanFeatures = features.filter(f => !isNaN(f.rsi) && !isNaN(f.ma_50))

    console.log(`Generated ${cleanFeatures.length} feature rows (removed ${features.length - cleanFeatures.length} NaN rows)`)

    return cleanFeatures
  }

  /**
   * Generate price-based features
   */
  private generatePriceFeatures(data: MarketDataPoint[]): any[] {
    const features: any[] = data.map((point, i) => {
      const prev = i > 0 ? data[i - 1] : point
      
      return {
        timestamp: point.timestamp,
        symbol: point.symbol,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
        
        // Returns
        returns: (point.close - prev.close) / prev.close,
        log_returns: Math.log(point.close / prev.close),
        
        // Price differences
        high_low_diff: point.high - point.low,
        close_open_diff: point.close - point.open,
        
        // Price ratios
        high_close_ratio: point.high / point.close,
        low_close_ratio: point.low / point.close,
        
        // Initialize momentum features
        momentum_1: 0,
        momentum_5: 0,
        momentum_10: 0,
        momentum_20: 0,
        normalized_price: 1
      }
    })

    // Add momentum features
    for (let i = 0; i < features.length; i++) {
      features[i].momentum_1 = i >= 1 ? (data[i].close - data[i - 1].close) / data[i - 1].close : 0
      features[i].momentum_5 = i >= 5 ? (data[i].close - data[i - 5].close) / data[i - 5].close : 0
      features[i].momentum_10 = i >= 10 ? (data[i].close - data[i - 10].close) / data[i - 10].close : 0
      features[i].momentum_20 = i >= 20 ? (data[i].close - data[i - 20].close) / data[i - 20].close : 0
      
      // Normalized price (20-period MA)
      if (i >= 19) {
        const ma20 = data.slice(i - 19, i + 1).reduce((sum, d) => sum + d.close, 0) / 20
        features[i].normalized_price = data[i].close / ma20
      } else {
        features[i].normalized_price = 1
      }
    }

    return features
  }

  /**
   * Generate volume-based features
   */
  private generateVolumeFeatures(features: any[]): any[] {
    for (let i = 0; i < features.length; i++) {
      const prev = i > 0 ? features[i - 1] : features[i]
      
      // Volume change
      features[i].volume_change = (features[i].volume - prev.volume) / prev.volume
      
      // Volume moving averages
      if (i >= 4) {
        features[i].volume_ma5 = features.slice(i - 4, i + 1)
          .reduce((sum, f) => sum + f.volume, 0) / 5
      } else {
        features[i].volume_ma5 = features[i].volume
      }
      
      if (i >= 19) {
        features[i].volume_ma20 = features.slice(i - 19, i + 1)
          .reduce((sum, f) => sum + f.volume, 0) / 20
      } else {
        features[i].volume_ma20 = features[i].volume
      }
      
      // Volume ratios
      features[i].volume_ratio_5 = features[i].volume / features[i].volume_ma5
      features[i].volume_ratio_20 = features[i].volume / features[i].volume_ma20
      
      // On-balance volume
      if (i === 0) {
        features[i].obv = features[i].volume
      } else {
        const direction = features[i].close > features[i - 1].close ? 1 : -1
        features[i].obv = features[i - 1].obv + (direction * features[i].volume)
      }
    }

    return features
  }

  /**
   * Generate technical indicators
   */
  private generateTechnicalIndicators(features: any[]): any[] {
    // Calculate moving averages
    for (let i = 0; i < features.length; i++) {
      // Simple moving averages
      features[i].ma_5 = this.calculateSMA(features, i, 5, 'close')
      features[i].ma_10 = this.calculateSMA(features, i, 10, 'close')
      features[i].ma_20 = this.calculateSMA(features, i, 20, 'close')
      features[i].ma_50 = this.calculateSMA(features, i, 50, 'close')
      
      // Exponential moving averages
      features[i].ema_12 = this.calculateEMA(features, i, 12, 'close')
      features[i].ema_26 = this.calculateEMA(features, i, 26, 'close')
      
      // MACD
      features[i].macd = features[i].ema_12 - features[i].ema_26
    }

    // MACD signal line
    for (let i = 0; i < features.length; i++) {
      features[i].macd_signal = this.calculateEMA(features, i, 9, 'macd')
      features[i].macd_hist = features[i].macd - features[i].macd_signal
    }

    // RSI
    for (let i = 0; i < features.length; i++) {
      features[i].rsi = this.calculateRSI(features, i, 14)
    }

    // Bollinger Bands
    for (let i = 0; i < features.length; i++) {
      const bb = this.calculateBollingerBands(features, i, 20)
      features[i].bb_upper = bb.upper
      features[i].bb_middle = bb.middle
      features[i].bb_lower = bb.lower
      features[i].bb_width = (bb.upper - bb.lower) / bb.middle
      features[i].bb_position = (features[i].close - bb.lower) / (bb.upper - bb.lower)
    }

    // ATR
    for (let i = 0; i < features.length; i++) {
      features[i].atr = this.calculateATR(features, i, 14)
      features[i].atr_ratio = features[i].atr / features[i].close
    }

    return features
  }

  /**
   * Generate regime features
   */
  private generateRegimeFeatures(features: any[]): any[] {
    // Calculate volatility
    for (let i = 0; i < features.length; i++) {
      if (i >= 19) {
        const returns = features.slice(i - 19, i + 1).map(f => f.returns)
        const std = this.calculateStd(returns)
        features[i].volatility = std * Math.sqrt(252) // Annualized
      } else {
        features[i].volatility = 0
      }
      
      // Trend (price vs MA50)
      features[i].trend = (features[i].close / features[i].ma_50) - 1
    }

    // Classify regimes using quantiles
    const volatilities = features.map(f => f.volatility).filter(v => v > 0)
    const trends = features.map(f => f.trend).filter(t => !isNaN(t))
    const volumeRatios = features.map(f => f.volume_ratio_20).filter(v => !isNaN(v))

    for (let i = 0; i < features.length; i++) {
      features[i].volatility_regime = this.getQuantile(volatilities, features[i].volatility, 5)
      features[i].trend_regime = this.getQuantile(trends, features[i].trend, 5)
      features[i].volume_regime = this.getQuantile(volumeRatios, features[i].volume_ratio_20, 5)
    }

    return features
  }

  /**
   * Helper: Calculate Simple Moving Average
   */
  private calculateSMA(data: any[], index: number, period: number, field: string): number {
    if (index < period - 1) return data[index][field]
    
    const sum = data.slice(index - period + 1, index + 1)
      .reduce((acc, item) => acc + item[field], 0)
    
    return sum / period
  }

  /**
   * Helper: Calculate Exponential Moving Average
   */
  private calculateEMA(data: any[], index: number, period: number, field: string): number {
    if (index === 0) return data[0][field]
    if (index < period - 1) return data[index][field]
    
    const multiplier = 2 / (period + 1)
    const prevEMA = index === period - 1 
      ? this.calculateSMA(data, index, period, field)
      : data[index - 1][`ema_${period}`] || this.calculateSMA(data, index, period, field)
    
    return (data[index][field] - prevEMA) * multiplier + prevEMA
  }

  /**
   * Helper: Calculate RSI
   */
  private calculateRSI(data: any[], index: number, period: number): number {
    if (index < period) return 50
    
    const changes = data.slice(index - period, index + 1).map((item, i, arr) => 
      i === 0 ? 0 : item.close - arr[i - 1].close
    )
    
    const gains = changes.map(c => c > 0 ? c : 0)
    const losses = changes.map(c => c < 0 ? -c : 0)
    
    const avgGain = gains.reduce((a, b) => a + b, 0) / period
    const avgLoss = losses.reduce((a, b) => a + b, 0) / period
    
    if (avgLoss === 0) return 100
    
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  /**
   * Helper: Calculate Bollinger Bands
   */
  private calculateBollingerBands(data: any[], index: number, period: number): {
    upper: number
    middle: number
    lower: number
  } {
    const middle = this.calculateSMA(data, index, period, 'close')
    
    if (index < period - 1) {
      return { upper: middle, middle, lower: middle }
    }
    
    const prices = data.slice(index - period + 1, index + 1).map(d => d.close)
    const std = this.calculateStd(prices)
    
    return {
      upper: middle + (2 * std),
      middle,
      lower: middle - (2 * std)
    }
  }

  /**
   * Helper: Calculate ATR
   */
  private calculateATR(data: any[], index: number, period: number): number {
    if (index === 0) return data[0].high - data[0].low
    
    const tr = Math.max(
      data[index].high - data[index].low,
      Math.abs(data[index].high - data[index - 1].close),
      Math.abs(data[index].low - data[index - 1].close)
    )
    
    if (index < period) return tr
    
    const prevATR = data[index - 1].atr || tr
    return ((prevATR * (period - 1)) + tr) / period
  }

  /**
   * Helper: Calculate standard deviation
   */
  private calculateStd(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
    return Math.sqrt(variance)
  }

  /**
   * Helper: Get quantile classification
   */
  private getQuantile(values: number[], value: number, bins: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const binSize = sorted.length / bins
    
    for (let i = 0; i < bins; i++) {
      const threshold = sorted[Math.floor((i + 1) * binSize) - 1]
      if (value <= threshold) return i
    }
    
    return bins - 1
  }

  /**
   * Save features to database
   */
  async saveFeatures(features: FeatureSet[]): Promise<void> {
    console.log(`Saving ${features.length} feature rows to database`)
    
    const { error } = await supabase
      .from('ml_training_features')
      .insert(features)
    
    if (error) {
      console.error('Error saving features:', error)
      throw error
    }
    
    console.log('✅ Features saved successfully')
  }

  /**
   * Load features from database
   */
  async loadFeatures(symbol: string, startDate: Date, endDate: Date): Promise<FeatureSet[]> {
    const { data, error } = await supabase
      .from('ml_training_features')
      .select('*')
      .eq('symbol', symbol)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true })
    
    if (error) {
      console.error('Error loading features:', error)
      throw error
    }
    
    return data as FeatureSet[]
  }
}

// Global instance
let globalEngineer: MLFeatureEngineer | null = null

export function getMLFeatureEngineer(): MLFeatureEngineer {
  if (!globalEngineer) {
    globalEngineer = new MLFeatureEngineer()
  }
  return globalEngineer
}
