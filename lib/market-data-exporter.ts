/**
 * MARKET DATA CSV EXPORTER
 * Exports daily market data for all symbols to CSV files
 * Perfect for ML training and analysis
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { promisify } from 'util'

const gzip = promisify(zlib.gzip)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// All symbols we monitor
const ALL_SYMBOLS = [
  'ES', 'NQ', 'RTY', 'YM',  // Equity Indices
  'CL', 'NG',                // Energy
  'GC', 'SI', 'HG',          // Metals
  'ZC', 'ZS', 'ZW',          // Agriculture
  'ZN',                      // Bonds
  'EUR', 'JPY',              // FX
  'BTC', 'ETH',              // Crypto
  'VX', 'AUD', 'CAD', 'CHF'  // Volatility & FX
]

export interface MarketDataExportResult {
  success: boolean
  timestamp: string
  symbols: {
    [symbol: string]: {
      success: boolean
      rows: number
      filePath?: string
      sizeBytes?: number
      error?: string
    }
  }
  totalRows: number
  totalSize: number
  duration: number
  errors: string[]
}

export class MarketDataExporter {
  private exportDir: string

  constructor() {
    this.exportDir = process.env.BACKUP_DIR || '/Users/Sage/nexural-backups'
  }

  /**
   * Export yesterday's market data for all symbols
   */
  async exportDailyData(date?: Date): Promise<MarketDataExportResult> {
    const startTime = Date.now()
    const exportDate = date || new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
    const dateStr = exportDate.toISOString().split('T')[0]

    console.log('\n📊 EXPORTING MARKET DATA')
    console.log('='.repeat(80))
    console.log(`Date: ${dateStr}`)
    console.log(`Symbols: ${ALL_SYMBOLS.length}`)
    console.log('='.repeat(80))

    const result: MarketDataExportResult = {
      success: true,
      timestamp: dateStr,
      symbols: {},
      totalRows: 0,
      totalSize: 0,
      duration: 0,
      errors: []
    }

    try {
      // Create export directory
      const exportPath = path.join(this.exportDir, dateStr, 'market-data')
      if (!fs.existsSync(exportPath)) {
        fs.mkdirSync(exportPath, { recursive: true })
      }

      console.log('\n📈 Exporting symbols...\n')

      // Export each symbol
      for (const symbol of ALL_SYMBOLS) {
        try {
          const symbolResult = await this.exportSymbolData(symbol, exportDate, exportPath)
          result.symbols[symbol] = symbolResult
          result.totalRows += symbolResult.rows
          result.totalSize += symbolResult.sizeBytes || 0

          if (symbolResult.success) {
            console.log(`   ✅ ${symbol}: ${symbolResult.rows} rows (${(symbolResult.sizeBytes! / 1024).toFixed(2)} KB)`)
          } else {
            console.log(`   ⚠️  ${symbol}: ${symbolResult.error}`)
            result.errors.push(`${symbol}: ${symbolResult.error}`)
          }
        } catch (error: any) {
          console.log(`   ❌ ${symbol}: ${error.message}`)
          result.errors.push(`${symbol}: ${error.message}`)
          result.symbols[symbol] = {
            success: false,
            rows: 0,
            error: error.message
          }
        }
      }

      result.duration = Date.now() - startTime

      console.log('\n' + '='.repeat(80))
      console.log('✅ EXPORT COMPLETE!')
      console.log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`)
      console.log(`   Total Rows: ${result.totalRows}`)
      console.log(`   Total Size: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB`)
      console.log(`   Errors: ${result.errors.length}`)
      console.log('='.repeat(80) + '\n')

      return result

    } catch (error: any) {
      console.error('❌ Export failed:', error)
      result.success = false
      result.errors.push(error.message)
      result.duration = Date.now() - startTime
      return result
    }
  }

  /**
   * Export data for a single symbol
   */
  private async exportSymbolData(
    symbol: string,
    date: Date,
    outputDir: string
  ): Promise<{ success: boolean; rows: number; filePath?: string; sizeBytes?: number; error?: string }> {
    try {
      // Get start and end of day
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      // Query data for this symbol and date
      const { data, error } = await supabase
        .from('live_market_data')
        .select('*')
        .eq('symbol', symbol)
        .gte('timestamp', startOfDay.toISOString())
        .lte('timestamp', endOfDay.toISOString())
        .order('timestamp', { ascending: true })

      if (error) {
        return {
          success: false,
          rows: 0,
          error: error.message
        }
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          rows: 0,
          error: 'No data for this date'
        }
      }

      // Convert to CSV
      const csv = this.convertToCSV(data)
      const csvBuffer = Buffer.from(csv)

      // Compress
      const compressed = await gzip(csvBuffer)

      // Save file
      const fileName = `${symbol}.csv.gz`
      const filePath = path.join(outputDir, fileName)
      fs.writeFileSync(filePath, compressed)

      return {
        success: true,
        rows: data.length,
        filePath,
        sizeBytes: compressed.length
      }

    } catch (error: any) {
      return {
        success: false,
        rows: 0,
        error: error.message
      }
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return ''

    // Get headers
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')

    // Convert rows
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header]
        // Handle null/undefined
        if (value === null || value === undefined) return ''
        // Handle strings with commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value
      }).join(',')
    })

    return [csvHeaders, ...csvRows].join('\n')
  }

  /**
   * Export data for a date range
   */
  async exportDateRange(startDate: Date, endDate: Date): Promise<MarketDataExportResult[]> {
    const results: MarketDataExportResult[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const result = await this.exportDailyData(currentDate)
      results.push(result)
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return results
  }

  /**
   * Get export statistics
   */
  async getExportStats(date: Date): Promise<{
    symbols: number
    totalRows: number
    totalSize: number
    files: string[]
  }> {
    const dateStr = date.toISOString().split('T')[0]
    const exportPath = path.join(this.exportDir, dateStr, 'market-data')

    if (!fs.existsSync(exportPath)) {
      return {
        symbols: 0,
        totalRows: 0,
        totalSize: 0,
        files: []
      }
    }

    const files = fs.readdirSync(exportPath)
    const totalSize = files.reduce((sum, file) => {
      const filePath = path.join(exportPath, file)
      return sum + fs.statSync(filePath).size
    }, 0)

    return {
      symbols: files.length,
      totalRows: 0, // Would need to decompress and count
      totalSize,
      files
    }
  }
}

// Global instance
let globalExporter: MarketDataExporter | null = null

export function getMarketDataExporter(): MarketDataExporter {
  if (!globalExporter) {
    globalExporter = new MarketDataExporter()
  }
  return globalExporter
}
