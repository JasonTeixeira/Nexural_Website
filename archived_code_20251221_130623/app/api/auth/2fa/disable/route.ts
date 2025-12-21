/**
 * 2FA Disable API Endpoint
 * Disables 2FA (requires verification code)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { disable2FA, verifyTOTP, get2FASecret } from '@/lib/auth/2fa-service'

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get verification code from request
    const body = await request.json()
    const { code } = body

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      )
    }

    // Get stored secret
    const secret = await get2FASecret(user.id)
    if (!secret) {
      return NextResponse.json(
        { error: '2FA not enabled' },
        { status: 400 }
      )
    }

    // Verify code before disabling (security measure)
    const isValid = verifyTOTP(code, secret)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Disable 2FA
    const disabled = await disable2FA(user.id)
    if (!disabled) {
      throw new Error('Failed to disable 2FA')
    }

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully'
    })

  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
}
