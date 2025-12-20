/**
 * Two-Factor Authentication Service
 * Handles TOTP generation, verification, and backup codes
 */

import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'

// Configure TOTP
authenticator.options = {
  window: 1, // Allow 30 seconds before/after
  step: 30, // 30-second time step
}

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface TwoFactorStatus {
  isEnabled: boolean
  enabledAt: string | null
  backupCodesCount: number
}

/**
 * Generate a new 2FA secret and QR code
 */
export async function generateTwoFactorSecret(
  userId: string,
  userEmail: string
): Promise<TwoFactorSetup> {
  // Generate secret
  const secret = authenticator.generateSecret()

  // Generate OTP auth URL
  const otpauthUrl = authenticator.keyuri(
    userEmail,
    'Nexural Trading',
    secret
  )

  // Generate QR code
  const qrCode = await QRCode.toDataURL(otpauthUrl)

  // Generate 10 backup codes
  const backupCodes = generateBackupCodes(10)

  return {
    secret,
    qrCode,
    backupCodes,
  }
}

/**
 * Verify a TOTP code
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch (error) {
    console.error('TOTP verification error:', error)
    return false
  }
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codes.push(code)
  }
  return codes
}

/**
 * Hash backup codes for storage
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const hashed = await Promise.all(
    codes.map(code => bcrypt.hash(code, 10))
  )
  return hashed
}

/**
 * Verify a backup code
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; usedIndex: number }> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i])
    if (isValid) {
      return { valid: true, usedIndex: i }
    }
  }
  return { valid: false, usedIndex: -1 }
}

/**
 * Save 2FA configuration to database
 */
export async function save2FAConfig(
  userId: string,
  secret: string,
  backupCodes: string[]
): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Hash backup codes
    const hashedCodes = await hashBackupCodes(backupCodes)

    // Save to database
    const { error } = await supabase
      .from('user_2fa')
      .upsert({
        user_id: userId,
        secret: secret,
        is_enabled: false, // Not enabled until verified
        backup_codes: hashedCodes,
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error saving 2FA config:', error)
    return false
  }
}

/**
 * Enable 2FA after successful verification
 */
export async function enable2FA(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('user_2fa')
      .update({
        is_enabled: true,
        enabled_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error enabling 2FA:', error)
    return false
  }
}

/**
 * Disable 2FA
 */
export async function disable2FA(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('user_2fa')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return false
  }
}

/**
 * Get 2FA status for a user
 */
export async function get2FAStatus(userId: string): Promise<TwoFactorStatus | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_2fa')
      .select('is_enabled, enabled_at, backup_codes')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return {
        isEnabled: false,
        enabledAt: null,
        backupCodesCount: 0,
      }
    }

    return {
      isEnabled: data.is_enabled,
      enabledAt: data.enabled_at,
      backupCodesCount: data.backup_codes?.length || 0,
    }
  } catch (error) {
    console.error('Error getting 2FA status:', error)
    return null
  }
}

/**
 * Get 2FA secret for verification
 */
export async function get2FASecret(userId: string): Promise<string | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_2fa')
      .select('secret')
      .eq('user_id', userId)
      .single()

    if (error || !data) return null
    return data.secret
  } catch (error) {
    console.error('Error getting 2FA secret:', error)
    return null
  }
}

/**
 * Use a backup code (remove it after use)
 */
export async function useBackupCode(
  userId: string,
  code: string
): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Get current backup codes
    const { data, error: fetchError } = await supabase
      .from('user_2fa')
      .select('backup_codes')
      .eq('user_id', userId)
      .single()

    if (fetchError || !data) return false

    const hashedCodes = data.backup_codes || []

    // Verify code
    const { valid, usedIndex } = await verifyBackupCode(code, hashedCodes)
    if (!valid) return false

    // Remove used code
    const updatedCodes = hashedCodes.filter((_: string, index: number) => index !== usedIndex)

    // Update database
    const { error: updateError } = await supabase
      .from('user_2fa')
      .update({ backup_codes: updatedCodes })
      .eq('user_id', userId)

    if (updateError) throw updateError
    return true
  } catch (error) {
    console.error('Error using backup code:', error)
    return false
  }
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(
  userId: string
): Promise<string[] | null> {
  try {
    const supabase = await createClient()

    // Generate new codes
    const newCodes = generateBackupCodes(10)
    const hashedCodes = await hashBackupCodes(newCodes)

    // Update database
    const { error } = await supabase
      .from('user_2fa')
      .update({ backup_codes: hashedCodes })
      .eq('user_id', userId)

    if (error) throw error
    return newCodes
  } catch (error) {
    console.error('Error regenerating backup codes:', error)
    return null
  }
}

/**
 * Log 2FA attempt (for security monitoring)
 */
export async function log2FAAttempt(
  userId: string,
  attemptType: 'totp' | 'backup_code' | 'setup',
  success: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase.rpc('log_2fa_attempt', {
      p_user_id: userId,
      p_attempt_type: attemptType,
      p_success: success,
      p_ip_address: ipAddress || null,
      p_user_agent: userAgent || null,
    })
  } catch (error) {
    console.error('Error logging 2FA attempt:', error)
  }
}
