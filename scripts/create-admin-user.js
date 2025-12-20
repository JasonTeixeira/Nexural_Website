#!/usr/bin/env node

/**
 * CREATE ADMIN USER SCRIPT
 * 
 * This script creates a new admin user in the database with a securely hashed password.
 * Run this to create your first admin account or add additional admins.
 * 
 * Usage:
 *   node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createAdminUser() {
  console.log('🔐 ADMIN USER CREATION SCRIPT')
  console.log('================================\n')

  // Get Supabase credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials')
    console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in your .env.local file\n')
    process.exit(1)
  }

  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Get admin details from user
    const email = await question('Enter admin email: ')
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address')
      process.exit(1)
    }

    const fullName = await question('Enter full name: ')
    
    const password = await question('Enter password (min 8 characters): ')
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters')
      process.exit(1)
    }

    const passwordConfirm = await question('Confirm password: ')
    if (password !== passwordConfirm) {
      console.error('❌ Passwords do not match')
      process.exit(1)
    }

    console.log('\n🔄 Creating admin user...')

    // Check if user already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      console.error(`❌ Admin user with email ${email} already exists`)
      process.exit(1)
    }

    // Hash password with bcrypt
    console.log('🔐 Hashing password...')
    const passwordHash = await bcrypt.hash(password, 12)

    // Insert admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          email: email.toLowerCase(),
          password_hash: passwordHash,
          full_name: fullName || null,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating admin user:', error.message)
      process.exit(1)
    }

    console.log('\n✅ Admin user created successfully!')
    console.log('================================')
    console.log(`📧 Email: ${email}`)
    console.log(`👤 Name: ${fullName || 'Not provided'}`)
    console.log(`🆔 ID: ${data.id}`)
    console.log(`🗓️  Created: ${new Date().toLocaleString()}`)
    console.log('================================\n')
    console.log('🎉 You can now login at: http://localhost:3036/admin/login')
    console.log('')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Run the script
createAdminUser()
