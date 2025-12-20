/**
 * 2FA Status API Endpoint
 * Gets 2FA status for the authenticated user
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { get2FAStatus } from '@/lib/auth/2fa-service'

export async function GET() {
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

    // Get 2FA status
    const status = await get2FAStatus(user.id)

    if (!status) {
      // User doesn't have 2FA configured
      return NextResponse.json({
        isEnabled: false,
        enabledAt: null,
        backupCodesCount: 0
      })
    }

    return NextResponse.json(status)

  } catch (error) {
    console.error('2FA status error:', error)
    return NextResponse.json(
      { error: 'Failed to get 2FA status' },
      { status: 500 }
    )
  }
}
