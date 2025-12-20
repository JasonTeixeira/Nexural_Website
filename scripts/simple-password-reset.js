#!/usr/bin/env node

/**
 * SIMPLE ADMIN PASSWORD RESET
 * 
 * Just updates the password - nothing else
 */

const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const readline = require('readline')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing Supabase credentials\n')
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
  console.log('\n🔐 SIMPLE PASSWORD RESET')
  console.log('========================\n')

  const email = await question('Email (sage@sageideas.org): ')
  const adminEmail = (email.trim() || 'sage@sageideas.org').toLowerCase()

  const newPassword = await question('New Password: ')
  
  if (!newPassword || newPassword.length < 8) {
    console.error('\n❌ Password must be at least 8 characters\n')
    rl.close()
    process.exit(1)
  }

  console.log('\n⏳ Resetting password...')

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update ONLY the password_hash field
    const { data, error } = await supabase
      .from('admin_users')
      .update({ password_hash: passwordHash })
      .eq('email', adminEmail)
      .select()

    if (error) {
      console.error('\n❌ Error:', error.message)
      rl.close()
      process.exit(1)
    }

    if (!data || data.length === 0) {
      console.error('\n❌ User not found:', adminEmail)
      rl.close()
      process.exit(1)
    }

    console.log('\n✅ PASSWORD RESET SUCCESSFUL!')
    console.log('============================')
    console.log(`Email:    ${adminEmail}`)
    console.log(`Password: ${newPassword}`)
    console.log(`URL:      http://localhost:3036/admin/login`)
    console.log('\n🎉 Go log in now!\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
  }

  rl.close()
}

resetPassword()
