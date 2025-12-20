/**
 * SECURE ADMIN AUTHENTICATION LIBRARY
 * 
 * Provides secure authentication functions for admin users:
 * - Password hashing with bcrypt
 * - Login verification with account locking
 * - Password reset token generation
 * - Audit logging
 * - Email integration with Resend
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Resend client
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'admin@nexural.io'

/**
 * Login admin user
 */
export async function loginAdmin(email: string, password: string, ipAddress: string) {
  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      await logAuditEvent(null, 'login_failed', { email, reason: 'user_not_found' }, ipAddress)
      return { success: false, error: 'Invalid credentials' }
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      await logAuditEvent(user.id, 'login_blocked', { reason: 'account_locked' }, ipAddress)
      return { success: false, error: 'Account is temporarily locked. Try again later.' }
    }

    // Check if account is active
    if (!user.is_active) {
      await logAuditEvent(user.id, 'login_blocked', { reason: 'account_inactive' }, ipAddress)
      return { success: false, error: 'Account is deactivated' }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      // Increment failed attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1
      const updates: any = { failed_login_attempts: failedAttempts }

      // Lock account after 5 failed attempts for 15 minutes
      if (failedAttempts >= 5) {
        updates.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }

      await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', user.id)

      await logAuditEvent(user.id, 'login_failed', { 
        reason: 'invalid_password',
        failed_attempts: failedAttempts 
      }, ipAddress)

      return { success: false, error: 'Invalid credentials' }
    }

    // Login successful - reset failed attempts and update last login
    await supabase
      .from('admin_users')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
        last_login_ip: ipAddress
      })
      .eq('id', user.id)

    await logAuditEvent(user.id, 'login_success', {}, ipAddress)

    // Return user data (without password hash)
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_active: user.is_active
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, is_active')
      .eq('email', email.toLowerCase())
      .single()

    // Always return success to prevent email enumeration
    if (error || !user || !user.is_active) {
      return { success: true, message: 'If the email exists, a reset link has been sent' }
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save token to database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        admin_user_id: user.id,
        token,
        expires_at: expiresAt.toISOString()
      })

    if (tokenError) {
      console.error('Token creation error:', tokenError)
      return { success: false, error: 'Failed to create reset token' }
    }

    // Send email via Resend
    if (RESEND_API_KEY) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3036'}/admin/reset-password?token=${token}`
      
      await sendPasswordResetEmail(user.email, user.full_name || 'Admin', resetUrl)
    }

    await logAuditEvent(user.id, 'password_reset_requested', {}, null)

    return { success: true, message: 'If the email exists, a reset link has been sent' }
  } catch (error) {
    console.error('Password reset request error:', error)
    return { success: false, error: 'Failed to process request' }
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  try {
    // Find valid token
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*, admin_users(*)')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !resetToken) {
      return { success: false, error: 'Invalid or expired reset token' }
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update password
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ 
        password_hash: passwordHash,
        failed_login_attempts: 0,
        locked_until: null
      })
      .eq('id', resetToken.admin_user_id)

    if (updateError) {
      console.error('Password update error:', updateError)
      return { success: false, error: 'Failed to update password' }
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetToken.id)

    await logAuditEvent(resetToken.admin_user_id, 'password_reset_completed', {}, null)

    return { success: true, message: 'Password reset successfully' }
  } catch (error) {
    console.error('Password reset error:', error)
    return { success: false, error: 'Failed to reset password' }
  }
}

/**
 * Verify admin session
 */
export async function verifyAdminSession(adminId: string) {
  try {
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, is_active')
      .eq('id', adminId)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return { valid: false }
    }

    return { valid: true, user }
  } catch (error) {
    return { valid: false }
  }
}

/**
 * Log audit event
 */
async function logAuditEvent(
  adminUserId: string | null,
  action: string,
  details: any,
  ipAddress: string | null
) {
  try {
    await supabase
      .from('admin_audit_log')
      .insert({
        admin_user_id: adminUserId,
        action,
        details,
        ip_address: ipAddress,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

/**
 * Send password reset email via Resend
 */
async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetUrl: string
) {
  if (!RESEND_API_KEY) {
    console.warn('Resend API key not configured - email not sent')
    return
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: toEmail,
        subject: 'Reset Your Admin Password - Nexural Trading',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Reset Your Admin Password</h2>
            <p>Hello ${toName},</p>
            <p>We received a request to reset your admin password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              For security reasons, if you continue to receive these emails without requesting them, please contact support immediately.
            </p>
            <p style="color: #6b7280; font-size: 12px;">
              Nexural Trading - Admin Panel<br>
              This is an automated message, please do not reply.
            </p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    console.log('Password reset email sent successfully')
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

/**
 * Clean expired tokens (run periodically)
 */
export async function cleanExpiredTokens() {
  try {
    await supabase
      .from('password_reset_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .is('used_at', null)

    console.log('Expired tokens cleaned')
  } catch (error) {
    console.error('Token cleanup error:', error)
  }
}

/**
 * Check if user is authenticated as admin
 */
export async function isAdminAuthenticated(adminId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase
      .from('admin_users')
      .select('is_active')
      .eq('id', adminId)
      .single()
    
    return user?.is_active || false
  } catch (error) {
    return false
  }
}

/**
 * Get admin user details
 */
export async function getAdminUser(adminId: string) {
  try {
    const { data: user } = await supabase
      .from('admin_users')
      .select('id, email, full_name, is_active')
      .eq('id', adminId)
      .single()
    
    return user
  } catch (error) {
    return null
  }
}

/**
 * Verify admin token (for API routes)
 */
export async function verifyAdminToken(token: string) {
  try {
    // For now, treat token as admin ID
    // In production, implement JWT or session tokens
    const user = await getAdminUser(token)
    return user && user.is_active ? user : null
  } catch (error) {
    return null
  }
}
