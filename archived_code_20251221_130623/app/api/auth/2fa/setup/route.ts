/**
 * 2FA Setup API Endpoint
 * Generates a new 2FA secret, QR code, and backup codes
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  generateTwoFactorSecret, 
  save2FAConfig,
  log2FAAttempt 
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

    // Get user email
    const userEmail = user.email || 'user@nexuraltrading.com'

    // Generate 2FA secret and QR code
    const { secret, qrCode, backupCodes } = await generateTwoFactorSecret(
      user.id,
      userEmail
    )

    // Save to database (not enabled yet - requires verification)
    const saved = await save2FAConfig(user.id, secret, backupCodes)

    if (!saved) {
      throw new Error('Failed to save 2FA configuration')
    }

    // Log setup attempt
    await log2FAAttempt(
      user.id,
      'setup',
      true,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    )

    // Return setup data (QR code + backup codes)
    return NextResponse.json({
      success: true,
      data: {
        qrCode,
        backupCodes,
        secret, // Needed for verification
      }
    })

  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    )
  }
}
