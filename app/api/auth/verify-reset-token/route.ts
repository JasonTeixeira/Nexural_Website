import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    // Check if token exists and is not expired
    const { data: user, error: userError } = await supabase
      .from('members')
      .select('id, reset_token_expiry')
      .eq('reset_token', token)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiry = new Date(user.reset_token_expiry)

    if (now > expiry) {
      // Clean up expired token
      await supabase
        .from('members')
        .update({
          reset_token: null,
          reset_token_expiry: null
        })
        .eq('id', user.id)

      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid'
    })

  } catch (error) {
    console.error('Verify reset token error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
