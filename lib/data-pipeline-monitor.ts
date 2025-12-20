/**
 * Data Pipeline Monitoring Service
 * Tracks pipeline health, processing status, and data quality
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface PipelineStatus {
  overall: 'healthy' | 'warning' | 'error'
  dataCollection: {
    status: 'active' | 'inactive' | 'error'
    lastUpdate: string | null
    recordsToday: number
  }
  processing: {
    status: 'idle' | 'processing' | 'error'
    lastRun: string | null
    successRate: number
    pendingFiles: number
  }
  featureGeneration: {
    status: 'active' | 'inactive' | 'error'
    lastRun: string | null
    featuresGenerated: number
  }
  modelTraining: {
    status: 'idle' | 'training' | 'error'
    lastRun: string | null
    nextScheduled: string | null
    activeModels: number
  }
}

export interface DataQualityMetrics {
  score: number // 0-100
  completeness: number // % of expected data
  gaps: Array<{
    symbol: string
    start: string
    end: string
    duration: string
  }>
  anomalies: Array<{
    symbol: string
    timestamp: string
    type: string
    severity: 'low' | 'medium' | 'high'
  }>
  lastChecked: string
}

export interface ProcessingHistory {
  id: string
  timestamp: string
  type: 'download' | 'process' | 'features' | 'training'
  status: 'success' | 'failure' | 'partial'
  details: {
    symbol?: string
    recordsProcessed?: number
    duration?: number
    error?: string
  }
}

export class DataPipelineMonitor {
  /**
   * Get overall pipeline status
   */
  async getPipelineStatus(): Promise<PipelineStatus> {
    try {
      // Check data collection (live_market_data)
      const dataCollection = await this.checkDataCollection()
      
      // Check processing status
      const processing = await this.checkProcessingStatus()
      
      // Check feature generation
      const featureGeneration = await this.checkFeatureGeneration()
      
      // Check model training
      const modelTraining = await this.checkModelTraining()
      
      // Determine overall status
      const statuses = [
        dataCollection.status,
        processing.status,
        featureGeneration.status,
        modelTraining.status
      ]
      
      const overall = statuses.includes('error') ? 'error' :
                     statuses.includes('inactive') ? 'warning' : 'healthy'
      
      return {
        overall,
        dataCollection,
        processing,
        featureGeneration,
        modelTraining
      }
    } catch (error) {
      console.error('Error getting pipeline status:', error)
      throw error
    }
  }
  
  /**
   * Check data collection status
   */
  private async checkDataCollection() {
    try {
      // Get latest data timestamp
      const { data: latestData } = await supabase
        .from('live_market_data')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
      
      // Count records from today
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('live_market_data')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', today)
      
      // Check if data is fresh (within last hour)
      const lastUpdate = latestData?.timestamp
      const isRecent = lastUpdate && 
        (new Date().getTime() - new Date(lastUpdate).getTime()) < 3600000
      
      return {
        status: isRecent ? 'active' as const : 'inactive' as const,
        lastUpdate,
        recordsToday: count || 0
      }
    } catch (error) {
      return {
        status: 'error' as const,
        lastUpdate: null,
        recordsToday: 0
      }
    }
  }
  
  /**
   * Check processing status
   */
  private async checkProcessingStatus() {
    try {
      // Check for processing logs (you'll need to create this table)
      // For now, return mock data
      return {
        status: 'idle' as const,
        lastRun: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        successRate: 95,
        pendingFiles: 0
      }
    } catch (error) {
      return {
        status: 'error' as const,
        lastRun: null,
        successRate: 0,
        pendingFiles: 0
      }
    }
  }
  
  /**
   * Check feature generation status
   */
  private async checkFeatureGeneration() {
    try {
      // Get latest features
      const { data: latestFeatures } = await supabase
        .from('ml_training_features')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
      
      // Count features from today
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('ml_training_features')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', today)
      
      const lastRun = latestFeatures?.timestamp
      const isRecent = lastRun && 
        (new Date().getTime() - new Date(lastRun).getTime()) < 7200000 // 2 hours
      
      return {
        status: isRecent ? 'active' as const : 'inactive' as const,
        lastRun,
        featuresGenerated: count || 0
      }
    } catch (error) {
      return {
        status: 'error' as const,
        lastRun: null,
        featuresGenerated: 0
      }
    }
  }
  
  /**
   * Check model training status
   */
  private async checkModelTraining() {
    try {
      // Get latest model
      const { data: latestModel } = await supabase
        .from('ml_model_versions')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      // Count active models
      const { count } = await supabase
        .from('ml_model_versions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      
      return {
        status: 'idle' as const,
        lastRun: latestModel?.created_at || null,
        nextScheduled: this.getNextTrainingTime(),
        activeModels: count || 0
      }
    } catch (error) {
      return {
        status: 'error' as const,
        lastRun: null,
        nextScheduled: null,
        activeModels: 0
      }
    }
  }
  
  /**
   * Get data quality metrics
   */
  async getDataQualityMetrics(): Promise<DataQualityMetrics> {
    try {
      // Calculate completeness
      const completeness = await this.calculateCompleteness()
      
      // Detect gaps
      const gaps = await this.detectGaps()
      
      // Detect anomalies
      const anomalies = await this.detectAnomalies()
      
      // Calculate overall score
      const score = this.calculateQualityScore(completeness, gaps, anomalies)
      
      return {
        score,
        completeness,
        gaps,
        anomalies,
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting data quality metrics:', error)
      return {
        score: 0,
        completeness: 0,
        gaps: [],
        anomalies: [],
        lastChecked: new Date().toISOString()
      }
    }
  }
  
  /**
   * Calculate data completeness
   */
  private async calculateCompleteness(): Promise<number> {
    try {
      // Expected: 288 bars per day per symbol (5-min bars)
      const symbols = ['ES', 'NQ', 'YM', 'RTY'] // Main symbols
      const daysToCheck = 7
      const expectedBarsPerDay = 288
      const expectedTotal = symbols.length * daysToCheck * expectedBarsPerDay
      
      // Count actual bars
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysToCheck)
      
      const { count } = await supabase
        .from('live_market_data')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', startDate.toISOString())
        .in('symbol', symbols)
      
      return Math.min(100, ((count || 0) / expectedTotal) * 100)
    } catch (error) {
      return 0
    }
  }
  
  /**
   * Detect data gaps
   */
  private async detectGaps() {
    // Simplified gap detection
    // In production, you'd check for missing time periods
    return []
  }
  
  /**
   * Detect anomalies
   */
  private async detectAnomalies() {
    // Simplified anomaly detection
    // In production, you'd check for unusual price movements, volume spikes, etc.
    return []
  }
  
  /**
   * Calculate quality score
   */
  private calculateQualityScore(
    completeness: number,
    gaps: any[],
    anomalies: any[]
  ): number {
    let score = completeness
    
    // Deduct for gaps
    score -= gaps.length * 5
    
    // Deduct for anomalies
    score -= anomalies.filter(a => a.severity === 'high').length * 10
    score -= anomalies.filter(a => a.severity === 'medium').length * 5
    score -= anomalies.filter(a => a.severity === 'low').length * 2
    
    return Math.max(0, Math.min(100, score))
  }
  
  /**
   * Get next training time
   */
  private getNextTrainingTime(): string {
    // Next Sunday at 2 AM
    const now = new Date()
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7
    const nextSunday = new Date(now)
    nextSunday.setDate(now.getDate() + daysUntilSunday)
    nextSunday.setHours(2, 0, 0, 0)
    
    return nextSunday.toISOString()
  }
  
  /**
   * Get processing history
   */
  async getProcessingHistory(limit: number = 10): Promise<ProcessingHistory[]> {
    // This would query a processing_logs table
    // For now, return mock data
    return []
  }
}

// Global instance
let globalMonitor: DataPipelineMonitor | null = null

export function getDataPipelineMonitor(): DataPipelineMonitor {
  if (!globalMonitor) {
    globalMonitor = new DataPipelineMonitor()
  }
  return globalMonitor
}
