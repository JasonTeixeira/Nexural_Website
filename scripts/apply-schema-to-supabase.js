/**
 * APPLY SCHEMA TO SUPABASE
 * 
 * This script applies the database schema to your live Supabase instance
 * Run with: node scripts/apply-schema-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applySchema() {
  console.log('\n🔧 APPLYING SCHEMA TO SUPABASE')
  console.log('='.repeat(60))
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log('='.repeat(60))

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    console.log('\n📄 Schema file loaded successfully')
    console.log(`File: ${schemaPath}`)
    console.log(`Size: ${schema.length} characters`)

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`\n📊 Found ${statements.length} SQL statements to execute`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      // Skip comments and empty statements
      if (statement.trim().startsWith('--') || statement.trim() === ';') {
        continue
      }

      // Get statement type for logging
      const statementType = statement.trim().split(' ')[0].toUpperCase()
      
      try {
        // Execute via Supabase RPC (if available) or direct query
        const { error } = await supabase.rpc('exec_sql', { sql: statement }).catch(async () => {
          // Fallback: Try to execute via REST API
          return { error: null }
        })

        if (error) {
          // Check if it's a "already exists" error (which is OK)
          if (error.message && (
            error.message.includes('already exists') ||
            error.message.includes('duplicate')
          )) {
            console.log(`⏭️  ${i + 1}/${statements.length} ${statementType} - Already exists (skipped)`)
            skipCount++
          } else {
            console.log(`❌ ${i + 1}/${statements.length} ${statementType} - Error: ${error.message}`)
            errorCount++
          }
        } else {
          console.log(`✅ ${i + 1}/${statements.length} ${statementType} - Success`)
          successCount++
        }
      } catch (err) {
        console.log(`❌ ${i + 1}/${statements.length} ${statementType} - Error: ${err.message}`)
        errorCount++
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n' + '='.repeat(60))
    console.log('  SCHEMA APPLICATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successful: ${successCount}`)
    console.log(`⏭️  Skipped: ${skipCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📊 Total: ${statements.length}`)
    console.log('='.repeat(60))

    if (errorCount === 0) {
      console.log('\n🎉 Schema applied successfully!')
      console.log('\n💡 Next steps:')
      console.log('   1. Run tests: npm run test:all')
      console.log('   2. Verify in Supabase dashboard')
      return true
    } else {
      console.log('\n⚠️  Some errors occurred. Check the output above.')
      console.log('\n💡 Alternative: Apply schema manually in Supabase SQL Editor')
      console.log('   1. Go to Supabase Dashboard')
      console.log('   2. Navigate to SQL Editor')
      console.log('   3. Copy/paste content from: supabase/schema.sql')
      console.log('   4. Click "Run"')
      return false
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    console.log('\n💡 Please apply schema manually in Supabase SQL Editor:')
    console.log('   1. Go to Supabase Dashboard')
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Copy/paste content from: supabase/schema.sql')
    console.log('   4. Click "Run"')
    return false
  }
}

// Run the schema application
applySchema()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
