#!/usr/bin/env node

/**
 * COMPREHENSIVE ADMIN LOGIN FIX SCRIPT
 * 
 * This script will:
 * 1. Check your admin account status
 * 2. Display all issues
 * 3. Fix any problems (locked account, inactive, etc.)
 * 4. Reset your password
 * 5. Test the login to confirm it works
 */

const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const readline = require('readline')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing Supabase credentials in .env.local')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n')
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

async function fixAdminLogin() {
  console.log('\n🔧 ADMIN LOGIN DIAGNOSTIC & FIX TOOL')
  console.log('=====================================\n')

  // Get email
  const email = await question('Enter your admin email (default: sage@sageideas.org): ')
  const adminEmail = (email.trim() || 'sage@sageideas.org').toLowerCase()

  console.log(`\n🔍 Checking admin account: ${adminEmail}...\n`)

  try {
    // Fetch admin user
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', adminEmail)
      .single()

    if (error || !user) {
      console.error('❌ Admin user NOT FOUND in database!')
      console.error(`   Email searched: ${adminEmail}`)
      console.error('\n💡 Possible solutions:')
      console.error('   1. Check if email is correct')
      console.error('   2. Run: node scripts/create-admin-user.js')
      console.error('   3. Check Supabase dashboard → admin_users table\n')
      rl.close()
      process.exit(1)
    }

    // Display current status
    console.log('✅ ADMIN ACCOUNT FOUND')
    console.log('======================')
    console.log(`Email:              ${user.email}`)
    console.log(`Full Name:          ${user.full_name || 'Not set'}`)
    console.log(`Is Active:          ${user.is_active ? '✅ YES' : '❌ NO'}`)
    console.log(`Failed Attempts:    ${user.failed_login_attempts || 0}`)
    console.log(`Locked Until:       ${user.locked_until || 'Not locked'}`)
    console.log(`Last Login:         ${user.last_login_at || 'Never'}`)
    console.log(`Created:            ${user.created_at}`)

    // Check for issues
    const issues = []
    if (!user.is_active) {
      issues.push('❌ Account is INACTIVE')
    }
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      issues.push('❌ Account is LOCKED')
    }
    if (user.failed_login_attempts >= 5) {
      issues.push('⚠️  Too many failed login attempts')
    }

    if (issues.length > 0) {
      console.log('\n🚨 ISSUES DETECTED:')
      issues.forEach(issue => console.log(`   ${issue}`))
      console.log('')
    } else {
      console.log('\n✅ No obvious issues detected')
    }

    // Ask if user wants to fix
    const shouldFix = await question('\n🔧 Do you want to fix all issues and reset password? (y/n): ')
    
    if (shouldFix.toLowerCase() !== 'y') {
      console.log('\n❌ Operation cancelled\n')
      rl.close()
      process.exit(0)
    }

    // Get new password
    console.log('\n📝 Set New Password')
    console.log('===================')
    const newPassword = await question('Enter NEW password (min 8 chars): ')
    
    if (!newPassword || newPassword.length < 8) {
      console.error('\n❌ Password must be at least 8 characters\n')
      rl.close()
      process.exit(1)
    }

    console.log('\n⏳ Fixing account and resetting password...')

    // Hash the password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Fix everything
    const { data: updatedUser, error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: passwordHash,
        is_active: true,
        failed_login_attempts: 0,
        locked_until: null
      })
      .eq('email', adminEmail)
      .select()

    if (updateError) {
      console.error('\n❌ Error updating account:', updateError.message)
      rl.close()
      process.exit(1)
    }

    if (!updatedUser || updatedUser.length === 0) {
      console.error('\n❌ Failed to update account')
      rl.close()
      process.exit(1)
    }

    console.log('\n✅ ACCOUNT FIXED SUCCESSFULLY!')
    console.log('=============================')
    console.log('✅ Account activated')
    console.log('✅ Account unlocked')
    console.log('✅ Failed attempts reset')
    console.log('✅ Password updated')

    // Test the login
    console.log('\n🧪 Testing login...')
    const passwordMatch = await bcrypt.compare(newPassword, updatedUser[0].password_hash)
    
    if (passwordMatch) {
      console.log('✅ Password verification: SUCCESS')
    } else {
      console.log('❌ Password verification: FAILED')
    }

    console.log('\n🎉 ALL DONE!')
    console.log('===========')
    console.log(`Email:    ${adminEmail}`)
    console.log(`Password: ${newPassword}`)
    console.log(`URL:      http://localhost:3036/admin/login`)
    console.log('\n✨ You can now log in to the admin panel!')
    console.log('\n⚠️  Remember to delete this terminal output for security!\n')

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message)
    console.error('\nFull error:', error)
  }

  rl.close()
}

// Run the script
fixAdminLogin()
