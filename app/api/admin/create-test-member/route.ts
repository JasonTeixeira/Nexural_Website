import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer admin_test_key') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, password_hash, subscription_status, subscription_tier, auth_provider, discord_access } = body

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('members')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json({ message: 'Test member already exists' }, { status: 200 })
    }

    // Create test member
    const { data, error } = await supabase
      .from('members')
      .insert({
        email: email.toLowerCase(),
        name,
        password_hash,
        subscription_status,
        subscription_tier,
        auth_provider,
        created_at: new Date().toISOString(),
        last_login: null,
        discord_access
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating test member:', error)
      return NextResponse.json({ error: 'Failed to create test member', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test member created successfully',
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        subscription_status: data.subscription_status,
        subscription_tier: data.subscription_tier
      }
    })

  } catch (error) {
    console.error('Create test member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
