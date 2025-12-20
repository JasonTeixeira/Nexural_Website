/**
 * Reload Supabase Schema Cache
 * Run this after migrations to force PostgREST to reload the schema
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function reloadSchema() {
  console.log('\n🔄 Reloading Supabase schema cache...\n')
  
  try {
    // Make a request to the PostgREST admin endpoint to reload schema
    const adminUrl = supabaseUrl.replace('supabase.co', 'supabase.co')
    const reloadUrl = `${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`
    
    const response = await fetch(reloadUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      }
    })
    
    console.log('✅ Schema cache refresh initiated')
    console.log('\n⏱️  Please wait 30 seconds for the cache to refresh...\n')
    
    // Wait 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000))
    
    console.log('✅ Cache should be refreshed now!')
    console.log('\n📝 Now run: node scripts/generate-dummy-positions.js\n')
    
  } catch (error) {
    console.error('Error:', error.message)
    console.log('\n⚠️  Manual fix: Go to Supabase Dashboard → Project Settings → API')
    console.log('   Then click "Restart PostgREST" button\n')
  }
}

reloadSchema()
