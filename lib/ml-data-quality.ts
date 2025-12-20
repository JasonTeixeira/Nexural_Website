/**
 * ML Data Quality Validator
 * Validates data quality for ML training
 * Adapted from ML Factory Python implementation
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ValidationResult {
  symbol: string
  dataType: 'market_data' | 'features' | 'labels'
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor'
  rowCount: number
  columnCount: number
  issues: string[]
  statistics: any
  checks: any
}

export class MLDataQualityValidator {
  private config = {
    missingValueThreshold: 0.05, // 5%
    outlierThreshold: 3.0, // 3 std devs
    duplicateCheck: true,
    ohlcCheck: true,
    volumeCheck: true
  }

  /**
   * Validate market data quality
   */
  async validateMarketData(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<ValidationResult> {
    console.log(`Validating market data for ${symbol}`)

    // Load market data
    const { data, error } = await supabase
      .from('live_market_data')
      .select('*')
      .eq('symbol', symbol)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true })

    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error('No market data found')
    }

    const result: ValidationResult = {
      symbol,
      dataType: 'market_data',
      overallQuality: 'excellent',
      rowCount: data.length,
      columnCount: Object.keys(data[0]).length,
      issues: [],
      statistics: {},
      checks: {}
    }

    // Check for missing values
    this.checkMissingValues(data, result)

    // Check for duplicates
    if (this.config.duplicateCheck) {
      this.checkDuplicates(data, result)
    }

    // Check OHLC relationships
    if (this.config.ohlcCheck) {
      this.checkOHLCRelationships(data, result)
    }

    // Check volume
    if (this.config.volumeCheck) {
      this.checkVolume(data, result)
    }

    // Calculate statistics
    result.statistics = this.calculateStatistics(data)

    // Determine overall quality
    result.overallQuality = this.determineOverallQuality(result.issues.length)

    // Save report to database
    await this.saveReport(result, startDate, endDate)

    return result
  }

  /**
   * Check for missing values
   */
  private checkMissingValues(data: any[], result: ValidationResult): void {
    const columns = Object.keys(data[0])
    const missingCounts: any = {}

    columns.forEach(col => {
      const missing = data.filter(row => row[col] === null || row[col] === undefined).length
      if (missing > 0) {
        missingCounts[col] = {
          count: missing,
          percentage: missing / data.length
        }
      }
    })

    result.checks.missingValues = missingCounts

    // Check if any column exceeds threshold
    Object.entries(missingCounts).forEach(([col, info]: [string, any]) => {
      if (info.percentage > this.config.missingValueThreshold) {
        result.issues.push(`Column ${col} has ${(info.percentage * 100).toFixed(1)}% missing values`)
      }
    })
  }

  /**
   * Check for duplicates
   */
  private checkDuplicates(data: any[], result: ValidationResult): void {
    const timestamps = data.map(d => d.timestamp)
    const uniqueTimestamps = new Set(timestamps)
    const duplicates = timestamps.length - uniqueTimestamps.size

    result.checks.duplicates = {
      count: duplicates,
      percentage: duplicates / data.length
    }

    if (duplicates > 0) {
      result.issues.push(`Found ${duplicates} duplicate timestamps`)
    }
  }

  /**
   * Check OHLC relationships
   */
  private checkOHLCRelationships(data: any[], result: ValidationResult): void {
    let invalidHL = 0
    let invalidOHLC = 0
    let negativePrice = 0

    data.forEach(row => {
      // Check for negative prices
      if (row.open <= 0 || row.high <= 0 || row.low <= 0 || row.close <= 0) {
        negativePrice++
      }

      // Check high-low relationship
      if (row.high < row.low) {
        invalidHL++
      }

      // Check OHLC relationships
      if (row.open > row.high || row.open < row.low || 
          row.close > row.high || row.close < row.low) {
        invalidOHLC++
      }
    })

    result.checks.ohlc = {
      negativePrice,
      invalidHL,
      invalidOHLC
    }

    if (negativePrice > 0) {
      result.issues.push(`Found ${negativePrice} rows with negative/zero prices`)
    }
    if (invalidHL > 0) {
      result.issues.push(`Found ${invalidHL} rows where high < low`)
    }
    if (invalidOHLC > 0) {
      result.issues.push(`Found ${invalidOHLC} rows with invalid OHLC relationships`)
    }
  }

  /**
   * Check volume
   */
  private checkVolume(data: any[], result: ValidationResult): void {
    const negativeVolume = data.filter(d => d.volume < 0).length
    const zeroVolume = data.filter(d => d.volume === 0).length

    result.checks.volume = {
      negativeVolume,
      zeroVolume,
      zeroVolumePct: zeroVolume / data.length
    }

    if (negativeVolume > 0) {
      result.issues.push(`Found ${negativeVolume} rows with negative volume`)
    }
    if (zeroVolume / data.length > 0.1) {
      result.issues.push(`High percentage of zero volume: ${(zeroVolume / data.length * 100).toFixed(1)}%`)
    }
  }

  /**
   * Calculate statistics
   */
  private calculateStatistics(data: any[]): any {
    const stats: any = {}
    const columns = Object.keys(data[0])

    columns.forEach(col => {
      const values = data.map(d => d[col]).filter(v => v !== null && v !== undefined)
      
      if (typeof values[0] === 'number') {
        stats[col] = {
          min: Math.min(...values),
          max: Math.max(...values),
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          missing: data.length - values.length
        }
      }
    })

    return stats
  }

  /**
   * Determine overall quality
   */
  private determineOverallQuality(issueCount: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (issueCount === 0) return 'excellent'
    if (issueCount < 3) return 'good'
    if (issueCount < 10) return 'fair'
    return 'poor'
  }

  /**
   * Save report to database
   */
  private async saveReport(
    result: ValidationResult,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const { error } = await supabase
      .from('ml_data_quality_reports')
      .insert({
        symbol: result.symbol,
        data_type: result.dataType,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        overall_quality: result.overallQuality,
        row_count: result.rowCount,
        column_count: result.columnCount,
        missing_values_count: Object.keys(result.checks.missingValues || {}).length,
        duplicate_count: result.checks.duplicates?.count || 0,
        invalid_ohlc_count: (result.checks.ohlc?.invalidHL || 0) + (result.checks.ohlc?.invalidOHLC || 0),
        issues: result.issues,
        statistics: result.statistics,
        checks: result.checks
      })

    if (error) {
      console.error('Error saving quality report:', error)
    }
  }

  /**
   * Get latest quality report
   */
  async getLatestReport(symbol: string): Promise<ValidationResult | null> {
    const { data, error } = await supabase
      .from('ml_data_quality_reports')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    return {
      symbol: data.symbol,
      dataType: data.data_type,
      overallQuality: data.overall_quality,
      rowCount: data.row_count,
      columnCount: data.column_count,
      issues: data.issues || [],
      statistics: data.statistics || {},
      checks: data.checks || {}
    }
  }
}

// Global instance
let globalValidator: MLDataQualityValidator | null = null

export function getMLDataQualityValidator(): MLDataQualityValidator {
  if (!globalValidator) {
    globalValidator = new MLDataQualityValidator()
  }
  return globalValidator
}
