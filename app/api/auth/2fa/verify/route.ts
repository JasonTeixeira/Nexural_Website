/**
 * 2FA Verify API Endpoint
 * Verifies a TOTP code during setup
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTOTP, get2FASecret, log2FAAttempt } from '@/lib/auth/2fa-service'

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

    // Get TOTP code from request
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
        { error: '2FA not configured. Please setup 2FA first.' },
        { status: 400 }
      )
    }

    // Verify TOTP code
    const isValid = verifyTOTP(code, secret)

    // Log attempt
    await log2FAAttempt(
      user.id,
      'totp',
      isValid,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Code verified successfully'
    })

  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
