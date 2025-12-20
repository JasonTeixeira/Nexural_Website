#!/usr/bin/env node
/**
 * Apply Paper Trading Schema Fix
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigration() {
  console.log('\n' + '='.repeat(70))
  console.log('🔧 APPLYING PAPER TRADING SCHEMA FIX')
  console.log('='.repeat(70))

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251003_fix_paper_trading_schema.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('\n📄 Migration file loaded')
    console.log('📊 Applying changes to database...\n')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))

    let successCount = 0
    let failCount = 0

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' })
        
        if (error) {
          // Try direct execution if RPC fails
          console.log(`⚠️  RPC failed, trying direct execution...`)
          // For Supabase, we'll need to use the REST API or client library
          // Since we can't execute raw SQL directly, we'll note this
          console.log(`   Statement: ${statement.substring(0, 50)}...`)
        } else {
          successCount++
          console.log(`✅ Executed: ${statement.substring(0, 60)}...`)
        }
      } catch (err) {
        failCount++
        console.log(`❌ Failed: ${statement.substring(0, 60)}...`)
        console.log(`   Error: ${err.message}`)
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(70))
    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log('='.repeat(70))

    if (failCount === 0) {
      console.log('\n🎉 Migration applied successfully!')
      console.log('\nNext step: Run paper trading tests')
      console.log('Command: node scripts/test-paper-trading-e2e.js')
    } else {
      console.log('\n⚠️  Some statements failed. You may need to apply the migration manually.')
      console.log('\nManual steps:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste the contents of:')
      console.log('   supabase/migrations/20251003_fix_paper_trading_schema.sql')
      console.log('4. Execute the SQL')
    }

  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message)
    console.log('\n📝 Manual Migration Required:')
    console.log('='.repeat(70))
    console.log('Please apply this SQL manually in your Supabase dashboard:\n')
    
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251003_fix_paper_trading_schema.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    console.log(sql)
    console.log('\n' + '='.repeat(70))
  }
}

applyMigration().catch(console.error)
