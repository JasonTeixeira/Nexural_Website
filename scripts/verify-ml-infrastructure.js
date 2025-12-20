#!/usr/bin/env node

/**
 * ML Infrastructure Verification Script
 * Checks database tables, tests services, and validates setup
 */

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyMLInfrastructure() {
  console.log('🔍 ML INFRASTRUCTURE VERIFICATION\n')
  console.log('=' .repeat(60))
  
  const results = {
    tables: {},
    services: {},
    data: {},
    overall: true
  }

  // ============================================================================
  // STEP 1: Verify Database Tables
  // ============================================================================
  console.log('\n📊 STEP 1: Verifying Database Tables...\n')
  
  const requiredTables = [
    'ml_training_features',
    'ml_training_labels',
    'ml_datasets',
    'ml_data_quality_reports',
    'ml_model_versions'
  ]

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ ${table}: NOT FOUND`)
        console.log(`      Error: ${error.message}`)
        results.tables[table] = false
        results.overall = false
      } else {
        console.log(`   ✅ ${table}: EXISTS`)
        results.tables[table] = true
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ERROR`)
      console.log(`      ${err.message}`)
      results.tables[table] = false
      results.overall = false
    }
  }

  // ============================================================================
  // STEP 2: Check for Market Data
  // ============================================================================
  console.log('\n📈 STEP 2: Checking Market Data Availability...\n')
  
  try {
    const { data: marketData, error } = await supabase
      .from('live_market_data')
      .select('symbol, timestamp')
      .order('timestamp', { ascending: false })
      .limit(10)
    
    if (error) {
      console.log(`   ❌ Market data table not accessible`)
      console.log(`      Error: ${error.message}`)
      results.data.marketData = false
      results.overall = false
    } else if (!marketData || marketData.length === 0) {
      console.log(`   ⚠️  Market data table is EMPTY`)
      console.log(`      You need market data to generate features`)
      results.data.marketData = 'empty'
    } else {
      console.log(`   ✅ Market data available: ${marketData.length} recent rows`)
      
      // Show symbols
      const symbols = [...new Set(marketData.map(d => d.symbol))]
      console.log(`      Symbols: ${symbols.join(', ')}`)
      
      // Show latest timestamp
      console.log(`      Latest: ${marketData[0].timestamp}`)
      
      results.data.marketData = true
    }
  } catch (err) {
    console.log(`   ❌ Error checking market data: ${err.message}`)
    results.data.marketData = false
  }

  // ============================================================================
  // STEP 3: Test Feature Engineering Service
  // ============================================================================
  console.log('\n🔧 STEP 3: Testing Feature Engineering Service...\n')
  
  try {
    // Try to import the service
    const { getMLFeatureEngineer } = require('../lib/ml-feature-engineering')
    console.log(`   ✅ Service imported successfully`)
    
    // Check if we can instantiate it
    const engineer = getMLFeatureEngineer()
    console.log(`   ✅ Service instantiated successfully`)
    
    results.services.featureEngineering = true
  } catch (err) {
    console.log(`   ❌ Feature engineering service error`)
    console.log(`      ${err.message}`)
    results.services.featureEngineering = false
    results.overall = false
  }

  // ============================================================================
  // STEP 4: Test Data Quality Service
  // ============================================================================
  console.log('\n🔍 STEP 4: Testing Data Quality Service...\n')
  
  try {
    // Try to import the service
    const { getMLDataQualityValidator } = require('../lib/ml-data-quality')
    console.log(`   ✅ Service imported successfully`)
    
    // Check if we can instantiate it
    const validator = getMLDataQualityValidator()
    console.log(`   ✅ Service instantiated successfully`)
    
    results.services.dataQuality = true
  } catch (err) {
    console.log(`   ❌ Data quality service error`)
    console.log(`      ${err.message}`)
    results.services.dataQuality = false
    results.overall = false
  }

  // ============================================================================
  // STEP 5: Check Existing ML Data
  // ============================================================================
  console.log('\n💾 STEP 5: Checking Existing ML Data...\n')
  
  if (results.tables.ml_training_features) {
    try {
      const { data, error } = await supabase
        .from('ml_training_features')
        .select('symbol, timestamp')
        .order('timestamp', { ascending: false })
        .limit(5)
      
      if (error) {
        console.log(`   ⚠️  Could not query ml_training_features`)
      } else if (!data || data.length === 0) {
        console.log(`   ℹ️  No features generated yet (table is empty)`)
        console.log(`      This is normal for a new setup`)
      } else {
        console.log(`   ✅ Found ${data.length} existing feature rows`)
        const symbols = [...new Set(data.map(d => d.symbol))]
        console.log(`      Symbols: ${symbols.join(', ')}`)
      }
    } catch (err) {
      console.log(`   ⚠️  Error checking features: ${err.message}`)
    }
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(60))
  console.log('\n📋 VERIFICATION SUMMARY\n')
  
  console.log('Database Tables:')
  Object.entries(results.tables).forEach(([table, status]) => {
    console.log(`   ${status ? '✅' : '❌'} ${table}`)
  })
  
  console.log('\nServices:')
  Object.entries(results.services).forEach(([service, status]) => {
    console.log(`   ${status ? '✅' : '❌'} ${service}`)
  })
  
  console.log('\nData:')
  Object.entries(results.data).forEach(([key, status]) => {
    const icon = status === true ? '✅' : status === 'empty' ? '⚠️' : '❌'
    console.log(`   ${icon} ${key}`)
  })
  
  console.log('\n' + '='.repeat(60))
  
  if (results.overall) {
    console.log('\n✅ ALL CHECKS PASSED - ML Infrastructure is ready!\n')
    console.log('Next steps:')
    console.log('1. Generate features: node scripts/test-ml-features.js')
    console.log('2. Validate quality: node scripts/test-ml-quality.js')
    console.log('3. Create datasets: (see ML_INFRASTRUCTURE_IMPLEMENTATION_GUIDE.md)')
  } else {
    console.log('\n❌ SOME CHECKS FAILED\n')
    
    // Check if tables are missing
    const missingTables = Object.entries(results.tables)
      .filter(([_, status]) => !status)
      .map(([table]) => table)
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing database tables detected!')
      console.log('\nYou need to run the database migrations:')
      console.log('   cd /Users/Sage/Downloads/Nexural_Trading')
      console.log('   supabase db push')
      console.log('\nThis will create the following tables:')
      missingTables.forEach(table => console.log(`   - ${table}`))
    }
    
    // Check if services failed
    const failedServices = Object.entries(results.services)
      .filter(([_, status]) => !status)
      .map(([service]) => service)
    
    if (failedServices.length > 0) {
      console.log('\n⚠️  Service errors detected!')
      console.log('Check that these files exist:')
      console.log('   - lib/ml-feature-engineering.ts')
      console.log('   - lib/ml-data-quality.ts')
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n')
  
  return results.overall
}

// Run verification
verifyMLInfrastructure()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(err => {
    console.error('\n❌ Verification failed with error:')
    console.error(err)
    process.exit(1)
  })
