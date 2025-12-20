// COMPLETE PERFORMANCE OPTIMIZER
// Analyzes strategy performance and automatically optimizes the system
// Makes the trading system SELF-IMPROVING

import { getPerformanceTracker, StrategyPerformance } from './performance-tracker-complete'
import { getMultiStrategyGenerator } from './multi-strategy-signal-generator-complete'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// TYPES
// ============================================================================

export interface OptimizationRecommendation {
  strategy: string
  action: 'increase_allocation' | 'decrease_allocation' | 'disable' | 'adjust_confidence' | 'no_change'
  reason: string
  currentMetrics: {
    winRate: number
    avgR: number
    profitFactor: number
    sharpeRatio: number
  }
  suggestedChanges?: {
    confidenceThreshold?: number
    enabled?: boolean
    allocation?: number
  }
}

export interface OptimizationReport {
  timestamp: Date
  recommendations: OptimizationRecommendation[]
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor'
  totalPnl: number
  systemWinRate: number
  systemAvgR: number
}

// ============================================================================
// PERFORMANCE OPTIMIZER CLASS
// ============================================================================

export class PerformanceOptimizer {
  private performanceTracker = getPerformanceTracker()
  private signalGenerator = getMultiStrategyGenerator()
  
  // Optimization thresholds
  private readonly MIN_TRADES_FOR_OPTIMIZATION = 20
  private readonly MIN_WIN_RATE = 45 // 45%
  private readonly MIN_AVG_R = 0.5 // 0.5R
  private readonly MIN_PROFIT_FACTOR = 1.2
  private readonly MIN_SHARPE_RATIO = 0.5
  
  // Recent performance weight (favor recent performance)
  private readonly RECENT_PERFORMANCE_WEIGHT = 0.6
  private readonly HISTORICAL_PERFORMANCE_WEIGHT = 0.4

  // ========================================================================
  // MAIN OPTIMIZATION
  // ========================================================================
  
  async optimizeSystem(): Promise<OptimizationReport> {
    console.log('\n🧠 STARTING PERFORMANCE OPTIMIZATION...\n')
    
    // Get all strategy performance
    const strategies = await this.performanceTracker.getAllStrategyPerformance()
    
    // Generate recommendations for each strategy
    const recommendations: OptimizationRecommendation[] = []
    
    for (const strategy of strategies) {
      const recommendation = await this.analyzeStrategy(strategy)
      recommendations.push(recommendation)
      
      // Apply optimization if needed
      if (recommendation.action !== 'no_change') {
        await this.applyOptimization(recommendation)
      }
    }
    
    // Calculate overall system health
    const overallHealth = this.calculateSystemHealth(strategies)
    const totalPnl = strategies.reduce((sum, s) => sum + s.totalPnl, 0)
    const systemWinRate = this.calculateWeightedWinRate(strategies)
    const systemAvgR = this.calculateWeightedAvgR(strategies)
    
    const report: OptimizationReport = {
      timestamp: new Date(),
      recommendations,
      overallHealth,
      totalPnl,
      systemWinRate,
      systemAvgR
    }
    
    // Log report
    await this.logOptimizationReport(report)
    
    console.log('\n✅ OPTIMIZATION COMPLETE!\n')
    this.printOptimizationReport(report)
    
    return report
  }

  // ========================================================================
  // STRATEGY ANALYSIS
  // ========================================================================
  
  private async analyzeStrategy(strategy: StrategyPerformance): Promise<OptimizationRecommendation> {
    // Not enough data yet
    if (strategy.totalTrades < this.MIN_TRADES_FOR_OPTIMIZATION) {
      return {
        strategy: strategy.strategyName,
        action: 'no_change',
        reason: `Insufficient data (${strategy.totalTrades} trades, need ${this.MIN_TRADES_FOR_OPTIMIZATION})`,
        currentMetrics: {
          winRate: strategy.winRate,
          avgR: strategy.avgRMultiple,
          profitFactor: strategy.profitFactor,
          sharpeRatio: strategy.sharpeRatio
        }
      }
    }

    // Calculate composite score (weighted recent + historical)
    const recentScore = this.calculatePerformanceScore(
      strategy.recentWinRate,
      strategy.recentAvgR,
      strategy.profitFactor,
      strategy.sharpeRatio
    )
    
    const historicalScore = this.calculatePerformanceScore(
      strategy.winRate,
      strategy.avgRMultiple,
      strategy.profitFactor,
      strategy.sharpeRatio
    )
    
    const compositeScore = (recentScore * this.RECENT_PERFORMANCE_WEIGHT) + 
                          (historicalScore * this.HISTORICAL_PERFORMANCE_WEIGHT)

    // Analyze and recommend
    if (compositeScore >= 80) {
      // EXCELLENT - Increase allocation
      return {
        strategy: strategy.strategyName,
        action: 'increase_allocation',
        reason: `Excellent performance (score: ${compositeScore.toFixed(1)}/100). Win rate: ${strategy.recentWinRate.toFixed(1)}%, Avg R: ${strategy.recentAvgR.toFixed(2)}R`,
        currentMetrics: {
          winRate: strategy.winRate,
          avgR: strategy.avgRMultiple,
          profitFactor: strategy.profitFactor,
          sharpeRatio: strategy.sharpeRatio
        },
        suggestedChanges: {
          confidenceThreshold: Math.max(0.65, strategy.winRate / 100 - 0.05), // Lower threshold = more signals
          allocation: 1.5 // Increase position size
        }
      }
    } else if (compositeScore >= 60) {
      // GOOD - Keep as is or minor adjustments
      return {
        strategy: strategy.strategyName,
        action: 'no_change',
        reason: `Good performance (score: ${compositeScore.toFixed(1)}/100). Maintaining current settings.`,
        currentMetrics: {
          winRate: strategy.winRate,
          avgR: strategy.avgRMultiple,
          profitFactor: strategy.profitFactor,
          sharpeRatio: strategy.sharpeRatio
        }
      }
    } else if (compositeScore >= 40) {
      // FAIR - Decrease allocation or adjust confidence
      return {
        strategy: strategy.strategyName,
        action: 'adjust_confidence',
        reason: `Fair performance (score: ${compositeScore.toFixed(1)}/100). Increasing confidence threshold to filter weaker signals.`,
        currentMetrics: {
          winRate: strategy.winRate,
          avgR: strategy.avgRMultiple,
          profitFactor: strategy.profitFactor,
          sharpeRatio: strategy.sharpeRatio
        },
        suggestedChanges: {
          confidenceThreshold: Math.min(0.85, strategy.winRate / 100 + 0.05), // Higher threshold = fewer signals
          allocation: 0.75 // Decrease position size
        }
      }
    } else {
      // POOR - Disable strategy
      return {
        strategy: strategy.strategyName,
        action: 'disable',
        reason: `Poor performance (score: ${compositeScore.toFixed(1)}/100). Win rate: ${strategy.recentWinRate.toFixed(1)}%, Avg R: ${strategy.recentAvgR.toFixed(2)}R. Disabling until performance improves.`,
        currentMetrics: {
          winRate: strategy.winRate,
          avgR: strategy.avgRMultiple,
          profitFactor: strategy.profitFactor,
          sharpeRatio: strategy.sharpeRatio
        },
        suggestedChanges: {
          enabled: false
        }
      }
    }
  }

  // ========================================================================
  // PERFORMANCE SCORING
  // ========================================================================
  
  private calculatePerformanceScore(
    winRate: number,
    avgR: number,
    profitFactor: number,
    sharpeRatio: number
  ): number {
    // Weighted scoring system
    const winRateScore = Math.min(100, (winRate / 70) * 100) * 0.3 // 30% weight
    const avgRScore = Math.min(100, (avgR / 2) * 100) * 0.3 // 30% weight
    const profitFactorScore = Math.min(100, (profitFactor / 2) * 100) * 0.25 // 25% weight
    const sharpeScore = Math.min(100, (sharpeRatio / 2) * 100) * 0.15 // 15% weight
    
    return winRateScore + avgRScore + profitFactorScore + sharpeScore
  }

  // ========================================================================
  // APPLY OPTIMIZATIONS
  // ========================================================================
  
  private async applyOptimization(recommendation: OptimizationRecommendation): Promise<void> {
    try {
      const strategyManager = this.signalGenerator.getStrategyManager()
      
      switch (recommendation.action) {
        case 'increase_allocation':
          console.log(`📈 Increasing allocation for ${recommendation.strategy}`)
          if (recommendation.suggestedChanges?.confidenceThreshold) {
            // Lower confidence threshold to get more signals
            await this.updateStrategyConfig(
              recommendation.strategy,
              recommendation.suggestedChanges.confidenceThreshold,
              true
            )
          }
          break
          
        case 'decrease_allocation':
        case 'adjust_confidence':
          console.log(`📉 Adjusting ${recommendation.strategy}`)
          if (recommendation.suggestedChanges?.confidenceThreshold) {
            // Raise confidence threshold to filter weaker signals
            await this.updateStrategyConfig(
              recommendation.strategy,
              recommendation.suggestedChanges.confidenceThreshold,
              true
            )
          }
          break
          
        case 'disable':
          console.log(`🛑 Disabling ${recommendation.strategy}`)
          await this.updateStrategyConfig(
            recommendation.strategy,
            0.85, // High threshold
            false // Disable
          )
          break
      }
      
      console.log(`✅ Applied optimization for ${recommendation.strategy}`)
      
    } catch (error) {
      console.error(`❌ Error applying optimization for ${recommendation.strategy}:`, error)
    }
  }

  private async updateStrategyConfig(
    strategyName: string,
    confidenceThreshold: number,
    enabled: boolean
  ): Promise<void> {
    try {
      await supabase
        .from('strategy_configs')
        .upsert({
          strategy_name: strategyName,
          confidence_threshold: confidenceThreshold,
          enabled: enabled,
          updated_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('❌ Error updating strategy config:', error)
    }
  }

  // ========================================================================
  // SYSTEM HEALTH
  // ========================================================================
  
  private calculateSystemHealth(strategies: StrategyPerformance[]): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgScore = strategies.reduce((sum, s) => {
      const score = this.calculatePerformanceScore(
        s.recentWinRate || s.winRate,
        s.recentAvgR || s.avgRMultiple,
        s.profitFactor,
        s.sharpeRatio
      )
      return sum + score
    }, 0) / strategies.length
    
    if (avgScore >= 80) return 'excellent'
    if (avgScore >= 60) return 'good'
    if (avgScore >= 40) return 'fair'
    return 'poor'
  }

  private calculateWeightedWinRate(strategies: StrategyPerformance[]): number {
    const totalTrades = strategies.reduce((sum, s) => sum + s.totalTrades, 0)
    if (totalTrades === 0) return 0
    
    const weightedWins = strategies.reduce((sum, s) => {
      return sum + (s.winRate * s.totalTrades / 100)
    }, 0)
    
    return (weightedWins / totalTrades) * 100
  }

  private calculateWeightedAvgR(strategies: StrategyPerformance[]): number {
    const totalTrades = strategies.reduce((sum, s) => sum + s.totalTrades, 0)
    if (totalTrades === 0) return 0
    
    const weightedR = strategies.reduce((sum, s) => {
      return sum + (s.avgRMultiple * s.totalTrades)
    }, 0)
    
    return weightedR / totalTrades
  }

  // ========================================================================
  // REPORTING
  // ========================================================================
  
  private async logOptimizationReport(report: OptimizationReport): Promise<void> {
    try {
      await supabase.from('optimization_logs').insert({
        timestamp: report.timestamp.toISOString(),
        recommendations: report.recommendations,
        overall_health: report.overallHealth,
        total_pnl: report.totalPnl,
        system_win_rate: report.systemWinRate,
        system_avg_r: report.systemAvgR
      })
    } catch (error) {
      console.error('❌ Error logging optimization report:', error)
    }
  }

  private printOptimizationReport(report: OptimizationReport): void {
    console.log('='.repeat(80))
    console.log('📊 OPTIMIZATION REPORT')
    console.log('='.repeat(80))
    console.log(`Timestamp: ${report.timestamp.toISOString()}`)
    console.log(`Overall Health: ${report.overallHealth.toUpperCase()}`)
    console.log(`Total P&L: $${report.totalPnl.toFixed(2)}`)
    console.log(`System Win Rate: ${report.systemWinRate.toFixed(2)}%`)
    console.log(`System Avg R: ${report.systemAvgR.toFixed(2)}R`)
    console.log('\n' + '-'.repeat(80))
    console.log('RECOMMENDATIONS:')
    console.log('-'.repeat(80))
    
    for (const rec of report.recommendations) {
      console.log(`\n${rec.strategy}:`)
      console.log(`  Action: ${rec.action.toUpperCase()}`)
      console.log(`  Reason: ${rec.reason}`)
      console.log(`  Metrics:`)
      console.log(`    Win Rate: ${rec.currentMetrics.winRate.toFixed(2)}%`)
      console.log(`    Avg R: ${rec.currentMetrics.avgR.toFixed(2)}R`)
      console.log(`    Profit Factor: ${rec.currentMetrics.profitFactor.toFixed(2)}`)
      console.log(`    Sharpe Ratio: ${rec.currentMetrics.sharpeRatio.toFixed(2)}`)
      
      if (rec.suggestedChanges) {
        console.log(`  Suggested Changes:`)
        if (rec.suggestedChanges.confidenceThreshold !== undefined) {
          console.log(`    Confidence Threshold: ${rec.suggestedChanges.confidenceThreshold.toFixed(2)}`)
        }
        if (rec.suggestedChanges.enabled !== undefined) {
          console.log(`    Enabled: ${rec.suggestedChanges.enabled}`)
        }
        if (rec.suggestedChanges.allocation !== undefined) {
          console.log(`    Allocation: ${rec.suggestedChanges.allocation}x`)
        }
      }
    }
    
    console.log('\n' + '='.repeat(80) + '\n')
  }

  // ========================================================================
  // SCHEDULED OPTIMIZATION
  // ========================================================================
  
  async runScheduledOptimization(): Promise<void> {
    console.log('\n⏰ Running scheduled optimization...\n')
    
    try {
      // Update recent performance for all strategies
      const strategies = await this.performanceTracker.getAllStrategyPerformance()
      
      for (const strategy of strategies) {
        await this.performanceTracker.updateRecentPerformance(strategy.strategyName, 30)
        await this.performanceTracker.calculateSharpeRatio(strategy.strategyName)
        await this.performanceTracker.calculateMaxDrawdown(strategy.strategyName)
      }
      
      // Run optimization
      await this.optimizeSystem()
      
    } catch (error) {
      console.error('❌ Error in scheduled optimization:', error)
    }
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

let globalOptimizer: PerformanceOptimizer | null = null

export function getPerformanceOptimizer(): PerformanceOptimizer {
  if (!globalOptimizer) {
    globalOptimizer = new PerformanceOptimizer()
  }
  return globalOptimizer
}

// ============================================================================
// OPTIMIZATION SCHEDULER
// ============================================================================

export async function startOptimizationScheduler(intervalHours: number = 24): Promise<void> {
  const optimizer = getPerformanceOptimizer()
  
  console.log(`🧠 Starting optimization scheduler (every ${intervalHours} hours)`)
  
  // Run immediately
  await optimizer.runScheduledOptimization()
  
  // Then run on schedule
  setInterval(async () => {
    await optimizer.runScheduledOptimization()
  }, intervalHours * 60 * 60 * 1000)
}
