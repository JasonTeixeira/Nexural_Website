import { NextResponse } from 'next/server'
import { 
  getDatabentoServiceStatus,
  getAllLatestMarketData,
  databentoClient 
} from '@/lib/databento-service'

// All 18 monitored symbols
const ALL_SYMBOLS = [
  'ES', 'NQ', 'YM', 'RTY',  // Equity Indices (4)
  'CL', 'NG',                // Energy (2)
  'GC', 'SI', 'HG',          // Metals (3)
  'ZC', 'ZS', 'ZW',          // Agriculture (3)
  'ZN', 'ZB',                // Bonds (2)
  '6E', '6J', '6B'           // FX (3)
]

export async function GET() {
  try {
    console.log('\n' + '='.repeat(80))
    console.log('🧪 DATABENTO CONNECTION TEST')
    console.log('='.repeat(80))
    console.log(`📅 ${new Date().toISOString()}`)
    console.log('='.repeat(80) + '\n')

    // Get service status
    const status = getDatabentoServiceStatus()
    
    console.log('📊 SERVICE STATUS:')
    console.log(`   Running: ${status.isRunning ? '✅ YES' : '❌ NO'}`)
    console.log(`   Subscribed Symbols: ${status.connectedSymbols.length}`)
    console.log(`   Latest Data Points: ${status.latestDataCount}`)
    console.log(`   Connection Attempts: ${status.connectionAttempts}\n`)

    // Get all latest market data
    const marketData = getAllLatestMarketData()
    
    console.log('📈 SYMBOL DATA STATUS:')
    console.log('-'.repeat(80))

    const symbolStatus: Record<string, any> = {}
    
    ALL_SYMBOLS.forEach(symbol => {
      const data = marketData.get(symbol)
      
      if (data) {
        symbolStatus[symbol] = {
          status: 'active',
          price: data.price,
          volume: data.volume,
          lastUpdate: data.timestamp,
          hasData: true
        }
        console.log(`✅ ${symbol.padEnd(5)} | Price: $${data.price.toFixed(2).padEnd(10)} | Volume: ${data.volume}`)
      } else {
        symbolStatus[symbol] = {
          status: 'waiting',
          hasData: false
        }
        console.log(`⏳ ${symbol.padEnd(5)} | Waiting for data...`)
      }
    })

    console.log('-'.repeat(80))

    const activeCount = Object.values(symbolStatus).filter((s: any) => s.hasData).length
    const successRate = (activeCount / ALL_SYMBOLS.length) * 100

    console.log(`\n📊 SUMMARY:`)
    console.log(`   Active Symbols: ${activeCount}/${ALL_SYMBOLS.length}`)
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`)
    console.log(`   Connection: ${status.isRunning ? '✅ CONNECTED' : '❌ DISCONNECTED'}`)
    
    console.log('\n' + '='.repeat(80))
    
    if (activeCount === ALL_SYMBOLS.length) {
      console.log('🎉 SUCCESS! All symbols receiving data!')
    } else if (activeCount >= ALL_SYMBOLS.length * 0.5) {
      console.log('✅ GOOD! Most symbols receiving data')
      console.log(`   ${ALL_SYMBOLS.length - activeCount} symbols still waiting...`)
    } else {
      console.log('⚠️ WARNING! Many symbols not receiving data')
      console.log('   This may be normal if:')
      console.log('   - Market is closed')
      console.log('   - Service just started (wait 30-60 seconds)')
      console.log('   - Databento API key is invalid')
    }
    
    console.log('='.repeat(80) + '\n')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      service: {
        isRunning: status.isRunning,
        subscribedSymbols: status.connectedSymbols.length,
        latestDataPoints: status.latestDataCount,
        connectionAttempts: status.connectionAttempts
      },
      symbols: symbolStatus,
      summary: {
        total: ALL_SYMBOLS.length,
        active: activeCount,
        waiting: ALL_SYMBOLS.length - activeCount,
        successRate: successRate
      }
    })

  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
