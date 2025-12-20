#!/usr/bin/env node

/**
 * QUICK ADMIN PASSWORD RESET SCRIPT
 * 
 * This script directly updates your admin password in Supabase
 * Use this when the forgot password feature isn't working yet
 */

const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const readline = require('readline')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function resetPassword() {
  console.log('\n🔐 ADMIN PASSWORD RESET TOOL')
  console.log('================================\n')

  // Get email
  const email = await question('Enter your admin email (sage@sageideas.org): ')
  const trimmedEmail = email.trim() || 'sage@sageideas.org'

  // Get new password
  const newPassword = await question('Enter your NEW password: ')
  
  if (!newPassword || newPassword.length < 8) {
    console.error('\n❌ Password must be at least 8 characters')
    rl.close()
    process.exit(1)
  }

  console.log('\n⏳ Updating password...')

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update in database
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        password_hash: passwordHash,
        failed_login_attempts: 0,
        locked_until: null
      })
      .eq('email', trimmedEmail.toLowerCase())
      .select()

    if (error) {
      console.error('\n❌ Error updating password:', error.message)
      rl.close()
      process.exit(1)
    }

    if (!data || data.length === 0) {
      console.error('\n❌ Admin user not found with email:', trimmedEmail)
      rl.close()
      process.exit(1)
    }

    console.log('\n✅ PASSWORD RESET SUCCESSFUL!')
    console.log('================================')
    console.log(`Email: ${trimmedEmail}`)
    console.log(`New Password: ${newPassword}`)
    console.log('\n🚀 You can now log in at: http://localhost:3036/admin/login')
    console.log('\n⚠️  Remember to delete this output for security!')

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message)
  }

  rl.close()
}

resetPassword()
