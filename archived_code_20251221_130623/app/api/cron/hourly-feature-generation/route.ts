import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMLFeatureEngineer } from '@/lib/ml-feature-engineering'

export const maxDuration = 300 // 5 minutes max execution
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  console.log('🔧 Starting hourly feature generation...')
  console.log('=' .repeat(60))
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const engineer = getMLFeatureEngineer()
  const results: any[] = []
  
  // All 21 symbols
  const symbols = [
    'ES', 'NQ', 'YM', 'RTY',  // Equity indices
    'CL', 'NG',                // Energy
    'GC', 'SI', 'HG',          // Metals
    'ZC', 'ZS', 'ZW',          // Agriculture
    'ZN', 'ZB',                // Bonds
    '6E', '6J', '6B',          // FX (EUR, JPY, GBP)
    '6A', '6C', '6S',          // FX (AUD, CAD, CHF)
    'VX'                       // Volatility
  ]
  
  for (const symbol of symbols) {
    try {
      console.log(`\n📊 Processing ${symbol}...`)
      
      // Get last 500 records (need 200+ for features)
      const { data: marketData, error } = await supabase
        .from('live_market_data')
        .select('*')
        .eq('symbol', symbol)
        .order('timestamp', { ascending: true })
        .limit(500)
      
      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }
      
      if (!marketData || marketData.length < 200) {
        console.log(`⚠️  ${symbol}: Not enough data (${marketData?.length || 0} records, need 200+)`)
        results.push({
          symbol,
          status: 'skipped',
          reason: 'insufficient_data',
          records: marketData?.length || 0
        })
        continue
      }
      
      // Generate features
      console.log(`   Generating features from ${marketData.length} records...`)
      const features = await engineer.generateFeatures(marketData)
      
      console.log(`   Generated ${features.length} feature rows`)
      
      // Save to database
      console.log(`   Saving to database...`)
      await engineer.saveFeatures(features)
      
      results.push({
        symbol,
        status: 'success',
        marketDataRecords: marketData.length,
        featuresGenerated: features.length,
        timestamp: new Date().toISOString()
      })
      
      console.log(`✅ ${symbol}: Complete (${features.length} features)`)
      
    } catch (error: any) {
      console.error(`❌ ${symbol}: Error - ${error.message}`)
      results.push({
        symbol,
        status: 'error',
        error: error.message
      })
    }
  }
  
  // Summary
  const successful = results.filter(r => r.status === 'success').length
  const failed = results.filter(r => r.status === 'error').length
  const skipped = results.filter(r => r.status === 'skipped').length
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 FEATURE GENERATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total Symbols: ${symbols.length}`)
  console.log(`✅ Successful: ${successful}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Skipped: ${skipped}`)
  console.log('='.repeat(60))
  
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    summary: {
      total: symbols.length,
      successful,
      failed,
      skipped
    },
    results
  })
}
