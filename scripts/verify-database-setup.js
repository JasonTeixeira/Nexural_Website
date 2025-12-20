#!/usr/bin/env node
/**
 * Database Verification Script
 * Verifies all tables and views are created correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifyDatabase() {
  log('\n' + '='.repeat(70), 'cyan');
  log('🔍 DATABASE VERIFICATION', 'cyan');
  log('='.repeat(70), 'cyan');

  const results = {
    tables: [],
    views: [],
    errors: []
  };

  // Test 1: Verify tables exist
  log('\n📊 TEST 1: Verifying Tables', 'yellow');
  
  const expectedTables = [
    'live_trades',
    'trading_signals',
    'backtest_results',
    'ml_model_metadata',
    'system_health',
    'trading_performance_daily'
  ];

  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        log(`   ❌ ${table}: ${error.message}`, 'red');
        results.errors.push({ table, error: error.message });
      } else {
        log(`   ✅ ${table}: OK`, 'green');
        results.tables.push(table);
      }
    } catch (err) {
      log(`   ❌ ${table}: ${err.message}`, 'red');
      results.errors.push({ table, error: err.message });
    }
  }

  // Test 2: Verify views work
  log('\n👁️  TEST 2: Verifying Views', 'yellow');
  
  const views = [
    'active_positions',
    'recent_signals',
    'performance_summary'
  ];

  for (const view of views) {
    try {
      const { data, error } = await supabase
        .from(view)
        .select('*')
        .limit(1);
      
      if (error) {
        log(`   ❌ ${view}: ${error.message}`, 'red');
        results.errors.push({ view, error: error.message });
      } else {
        log(`   ✅ ${view}: OK`, 'green');
        results.views.push(view);
      }
    } catch (err) {
      log(`   ❌ ${view}: ${err.message}`, 'red');
      results.errors.push({ view, error: err.message });
    }
  }

  // Test 3: Test insert/update/delete
  log('\n🔧 TEST 3: Testing CRUD Operations', 'yellow');
  
  try {
    // Insert test signal
    log('   Testing INSERT...', 'blue');
    const { data: signal, error: insertError } = await supabase
      .from('trading_signals')
      .insert({
        symbol: 'TEST',
        timeframe: '15min',
        direction: 'long',
        confidence: 0.85,
        entry_price: 5000.0,
        action_taken: 'filtered',
        model_version: 'test_v1'
      })
      .select()
      .single();

    if (insertError) {
      log(`   ❌ INSERT failed: ${insertError.message}`, 'red');
      results.errors.push({ operation: 'INSERT', error: insertError.message });
    } else {
      log(`   ✅ INSERT successful (signal_id: ${signal.signal_id})`, 'green');
      
      // Test SELECT
      log('   Testing SELECT...', 'blue');
      const { data: selected, error: selectError } = await supabase
        .from('trading_signals')
        .select('*')
        .eq('signal_id', signal.signal_id)
        .single();
      
      if (selectError) {
        log(`   ❌ SELECT failed: ${selectError.message}`, 'red');
        results.errors.push({ operation: 'SELECT', error: selectError.message });
      } else {
        log(`   ✅ SELECT successful`, 'green');
      }
      
      // Test DELETE
      log('   Testing DELETE...', 'blue');
      const { error: deleteError } = await supabase
        .from('trading_signals')
        .delete()
        .eq('signal_id', signal.signal_id);
      
      if (deleteError) {
        log(`   ❌ DELETE failed: ${deleteError.message}`, 'red');
        results.errors.push({ operation: 'DELETE', error: deleteError.message });
      } else {
        log(`   ✅ DELETE successful`, 'green');
      }
    }
  } catch (err) {
    log(`   ❌ CRUD test failed: ${err.message}`, 'red');
    results.errors.push({ operation: 'CRUD', error: err.message });
  }

  // Summary
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 VERIFICATION SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');
  
  log(`\n✅ Tables verified: ${results.tables.length}/6`, 'green');
  log(`✅ Views verified: ${results.views.length}/3`, 'green');
  log(`❌ Errors found: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green');

  if (results.errors.length > 0) {
    log('\n⚠️  ERRORS DETAILS:', 'yellow');
    results.errors.forEach((err, i) => {
      log(`   ${i + 1}. ${JSON.stringify(err)}`, 'red');
    });
  }

  log('\n' + '='.repeat(70) + '\n', 'cyan');

  if (results.tables.length === 6 && results.views.length === 3 && results.errors.length === 0) {
    log('🎉 DATABASE SETUP COMPLETE AND VERIFIED!', 'green');
    log('✅ Ready to test API endpoints', 'green');
    process.exit(0);
  } else {
    log('❌ DATABASE SETUP INCOMPLETE', 'red');
    log('⚠️  Please fix errors before proceeding', 'yellow');
    process.exit(1);
  }
}

// Run verification
verifyDatabase().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
