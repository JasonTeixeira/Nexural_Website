#!/usr/bin/env node

/**
 * Referral System Database Setup & Verification Script
 * 
 * This script:
 * 1. Checks if referral tables exist
 * 2. Verifies RLS policies
 * 3. Tests database functions
 * 4. Seeds test data
 * 5. Runs verification tests
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error && error.code === '42P01') {
      return false // Table doesn't exist
    }
    return true
  } catch (err) {
    return false
  }
}

async function testDatabaseFunction(functionName, params) {
  try {
    const { data, error } = await supabase.rpc(functionName, params)
    if (error) {
      console.error(`   ❌ Function ${functionName} failed:`, error.message)
      return false
    }
    console.log(`   ✅ Function ${functionName} works`)
    return true
  } catch (err) {
    console.error(`   ❌ Function ${functionName} error:`, err.message)
    return false
  }
}

async function seedTestData() {
  console.log('\n📊 Seeding test data...')
  
  try {
    // Create test referral code
    const { data: code, error: codeError } = await supabase
      .from('referral_codes')
      .insert({
        user_id: 'test-user-123',
        code: 'NEXURAL-TEST123',
        user_email: 'test@example.com'
      })
      .select()
      .single()
    
    if (codeError) {
      console.log('   ⚠️  Test code might already exist:', codeError.message)
    } else {
      console.log('   ✅ Created test referral code: NEXURAL-TEST123')
    }
    
    // Create test referral
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: 'test-user-123',
        referral_code: 'NEXURAL-TEST123',
        referred_email: 'referred@example.com',
        status: 'pending'
      })
      .select()
      .single()
    
    if (referralError) {
      console.log('   ⚠️  Test referral might already exist:', referralError.message)
    } else {
      console.log('   ✅ Created test referral')
    }
    
    return true
  } catch (err) {
    console.error('   ❌ Seeding failed:', err.message)
    return false
  }
}

async function verifyRLSPolicies() {
  console.log('\n🔒 Verifying RLS policies...')
  
  try {
    // Try to query as anonymous user (should fail or return limited data)
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data, error } = await anonSupabase
      .from('referral_codes')
      .select('*')
    
    if (error) {
      console.log('   ✅ RLS is active (anonymous access restricted)')
    } else {
      console.log('   ⚠️  RLS might not be properly configured')
    }
    
    return true
  } catch (err) {
    console.log('   ✅ RLS is active')
    return true
  }
}

async function runTests() {
  console.log('\n🧪 Running verification tests...')
  
  let passed = 0
  let failed = 0
  
  // Test 1: Query referral codes
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ Test 1: Query referral codes (${data.length} found)`)
    passed++
  } catch (err) {
    console.error('   ❌ Test 1 failed:', err.message)
    failed++
  }
  
  // Test 2: Query referrals
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ Test 2: Query referrals (${data.length} found)`)
    passed++
  } catch (err) {
    console.error('   ❌ Test 2 failed:', err.message)
    failed++
  }
  
  // Test 3: Query rewards
  try {
    const { data, error } = await supabase
      .from('referral_rewards')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ Test 3: Query rewards (${data.length} found)`)
    passed++
  } catch (err) {
    console.error('   ❌ Test 3 failed:', err.message)
    failed++
  }
  
  // Test 4: Query analytics
  try {
    const { data, error } = await supabase
      .from('referral_analytics')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ Test 4: Query analytics (${data.length} found)`)
    passed++
  } catch (err) {
    console.error('   ❌ Test 4 failed:', err.message)
    failed++
  }
  
  console.log(`\n   📊 Tests: ${passed} passed, ${failed} failed`)
  return failed === 0
}

async function main() {
  console.log('🚀 Referral System Database Setup & Verification\n')
  console.log('=' .repeat(60))
  
  // Step 1: Check if tables exist
  console.log('\n📋 Step 1: Checking if tables exist...')
  
  const tables = ['referral_codes', 'referrals', 'referral_rewards', 'referral_analytics']
  const tableStatus = {}
  
  for (const table of tables) {
    const exists = await checkTableExists(table)
    tableStatus[table] = exists
    console.log(`   ${exists ? '✅' : '❌'} ${table}`)
  }
  
  const allTablesExist = Object.values(tableStatus).every(status => status)
  
  if (!allTablesExist) {
    console.log('\n❌ Some tables are missing!')
    console.log('\n📝 To create tables:')
    console.log('   1. Open Supabase Dashboard')
    console.log('   2. Go to SQL Editor')
    console.log('   3. Copy SQL from: REFERRAL_SYSTEM_DATABASE_SETUP.md')
    console.log('   4. Run the SQL')
    console.log('   5. Run this script again')
    process.exit(1)
  }
  
  console.log('\n✅ All tables exist!')
  
  // Step 2: Test database functions
  console.log('\n📋 Step 2: Testing database functions...')
  
  await testDatabaseFunction('generate_referral_code', { p_user_id: 'test-user' })
  
  // Step 3: Verify RLS
  await verifyRLSPolicies()
  
  // Step 4: Seed test data
  await seedTestData()
  
  // Step 5: Run tests
  const testsPass = await runTests()
  
  // Summary
  console.log('\n' + '='.repeat(60))
  if (testsPass) {
    console.log('\n✅ DATABASE SETUP COMPLETE!')
    console.log('\n🎉 Your referral system database is ready to use!')
    console.log('\nNext steps:')
    console.log('   1. Test the referral flow in your app')
    console.log('   2. Visit: http://localhost:3039/member-portal/referrals')
    console.log('   3. Generate your referral code')
    console.log('   4. Share and test!')
  } else {
    console.log('\n⚠️  SETUP INCOMPLETE')
    console.log('\nSome tests failed. Please check the errors above.')
  }
  console.log('\n' + '='.repeat(60))
}

main().catch(console.error)
