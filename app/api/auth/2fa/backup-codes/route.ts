/**
 * 2FA Backup Codes API Endpoint
 * Regenerates backup codes (requires verification)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  regenerateBackupCodes, 
  verifyTOTP, 
  get2FASecret 
} from '@/lib/auth/2fa-service'

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

    // Verify code before regenerating (security measure)
    const isValid = verifyTOTP(code, secret)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Regenerate backup codes
    const newCodes = await regenerateBackupCodes(user.id)
    if (!newCodes) {
      throw new Error('Failed to regenerate backup codes')
    }

    return NextResponse.json({
      success: true,
      backupCodes: newCodes
    })

  } catch (error) {
    console.error('Backup codes regeneration error:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate backup codes' },
      { status: 500 }
    )
  }
}
