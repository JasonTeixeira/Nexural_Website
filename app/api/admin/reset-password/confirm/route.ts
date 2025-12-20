import { NextRequest, NextResponse } from 'next/server'
import { resetPassword } from '@/lib/admin-auth'

/**
 * CONFIRM PASSWORD RESET
 * 
 * Verifies token and updates admin user password
 */
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({
        success: false,
        error: 'Token and password are required'
      }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 8 characters'
      }, { status: 400 })
    }

    console.log(`🔑 Password reset confirmation with token: ${token.substring(0, 10)}...`)

    // Reset password with token
    const result = await resetPassword(token, password)

    if (result.success) {
      console.log(`✅ Password reset successful`)
      return NextResponse.json(result)
    } else {
      console.log(`❌ Password reset failed: ${result.error}`)
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Password reset confirmation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to reset password'
    }, { status: 500 })
  }
}
