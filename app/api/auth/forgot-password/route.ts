import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('members')
      .select('id, email, name')
      .eq('email', email.toLowerCase())
      .single()

    // Always return success to prevent email enumeration attacks
    if (userError || !user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we\'ve sent a reset link.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token in database
    const { error: updateError } = await supabase
      .from('members')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error storing reset token:', updateError)
      return NextResponse.json(
        { error: 'Failed to process reset request' },
        { status: 500 }
      )
    }

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: user.email,
        subject: 'Reset Your Nexural Trading Password',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
                <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Nexural Trading</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Hi ${user.name || 'there'},</h2>
                
                <p>We received a request to reset your password for your Nexural Trading account.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Reset My Password
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  This link will expire in 1 hour for security reasons.
                </p>
                
                <p style="color: #666; font-size: 14px;">
                  If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #888; font-size: 12px; text-align: center;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${resetUrl}" style="color: #4CAF50; word-break: break-all;">${resetUrl}</a>
                </p>
                
                <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">
                  © ${new Date().getFullYear()} Nexural Trading. All rights reserved.
                </p>
              </div>
            </body>
          </html>
        `
      })
    } catch (emailError) {
      console.error('Error sending reset email:', emailError)
      // Don't reveal email sending errors to prevent enumeration
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a reset link.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
