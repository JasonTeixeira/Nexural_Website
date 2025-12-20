/**
 * EMAIL SERVICE
 * Production-ready email system using Resend
 * Handles transactional emails with templates
 */

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { emailRateLimiter, getClientIdentifier } from './rate-limiter'
import ErrorHandler, { ErrorSeverity, createExternalApiError } from './error-handler'

// =============================================================================
// CONFIGURATION
// =============================================================================

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Nexural Trading <noreply@nexural.com>'
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@nexural.com'

// =============================================================================
// EMAIL TYPES
// =============================================================================

export enum EmailType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  NEW_FOLLOWER = 'new_follower',
  POSITION_ALERT = 'position_alert',
  DAILY_DIGEST = 'daily_digest',
  TRADE_SIGNAL = 'trade_signal',
  SUBSCRIPTION_REMINDER = 'subscription_reminder',
  VERIFICATION = 'verification',
}

export interface EmailData {
  to: string
  subject: string
  type: EmailType
  data?: Record<string, any>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// =============================================================================
// EMAIL SERVICE CLASS
// =============================================================================

export class EmailService {
  /**
   * Send email with rate limiting
   */
  static async send(emailData: EmailData, identifier?: string): Promise<EmailResult> {
    try {
      // Rate limiting (5 emails per hour per recipient)
      if (identifier) {
        const { success } = await emailRateLimiter.limit(identifier)
        if (!success) {
          ErrorHandler.logWarning('Email rate limit exceeded', {
            action: 'send_email',
            additionalData: { recipient: emailData.to, type: emailData.type },
          })
          return {
            success: false,
            error: 'Too many emails sent. Please try again later.',
          }
        }
      }

      // Validate email configuration
      if (!process.env.RESEND_API_KEY) {
        console.error('[EMAIL] RESEND_API_KEY not configured')
        return {
          success: false,
          error: 'Email service not configured',
        }
      }

      // Get template content
      const htmlContent = await this.getEmailTemplate(emailData.type, emailData.data || {})

      // Send email via Resend
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: emailData.to,
        subject: emailData.subject,
        html: htmlContent,
        replyTo: REPLY_TO,
      })

      if (result.error) {
        throw createExternalApiError('Resend', result.error.message)
      }

      console.log(`[EMAIL] Sent ${emailData.type} to ${emailData.to} - ID: ${result.data?.id}`)

      return {
        success: true,
        messageId: result.data?.id,
      }
    } catch (error) {
      console.error('[EMAIL] Send failed:', error)
      
      ErrorHandler.report(
        error instanceof Error ? error : new Error(String(error)),
        {
          action: 'send_email',
          additionalData: {
            type: emailData.type,
            recipient: emailData.to,
          },
        },
        ErrorSeverity.HIGH
      )

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      }
    }
  }

  /**
   * Get email template HTML
   */
  private static async getEmailTemplate(type: EmailType, data: Record<string, any>): Promise<string> {
    // For now, return simple HTML templates
    // In production, these would be React Email components
    switch (type) {
      case EmailType.WELCOME:
        return this.getWelcomeTemplate(data as { name: string })
      
      case EmailType.PASSWORD_RESET:
        return this.getPasswordResetTemplate(data as { resetLink: string })
      
      case EmailType.NEW_FOLLOWER:
        return this.getNewFollowerTemplate(data as { followerName: string; followerUsername: string })
      
      case EmailType.POSITION_ALERT:
        return this.getPositionAlertTemplate(data as { symbol: string; alertType: string; message: string })
      
      case EmailType.DAILY_DIGEST:
        return this.getDailyDigestTemplate(data as { stats: any })
      
      case EmailType.TRADE_SIGNAL:
        return this.getTradeSignalTemplate(data)
      
      case EmailType.SUBSCRIPTION_REMINDER:
        return this.getSubscriptionReminderTemplate(data)
      
      case EmailType.VERIFICATION:
        return this.getVerificationTemplate(data as { verificationLink: string })
      
      default:
        return this.getDefaultTemplate(data)
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(to: string, name: string): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Welcome to Nexural Trading! 🎉',
      type: EmailType.WELCOME,
      data: { name },
    }, to)
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(to: string, resetLink: string): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Reset Your Password - Nexural Trading',
      type: EmailType.PASSWORD_RESET,
      data: { resetLink },
    }, to)
  }

  /**
   * Send new follower notification
   */
  static async sendNewFollowerEmail(
    to: string,
    followerName: string,
    followerUsername: string
  ): Promise<EmailResult> {
    return this.send({
      to,
      subject: `${followerName} started following you!`,
      type: EmailType.NEW_FOLLOWER,
      data: { followerName, followerUsername },
    }, to)
  }

  /**
   * Send position alert
   */
  static async sendPositionAlertEmail(
    to: string,
    symbol: string,
    alertType: string,
    message: string
  ): Promise<EmailResult> {
    return this.send({
      to,
      subject: `Position Alert: ${symbol} - ${alertType}`,
      type: EmailType.POSITION_ALERT,
      data: { symbol, alertType, message },
    }, to)
  }

  /**
   * Send daily digest
   */
  static async sendDailyDigestEmail(
    to: string,
    stats: Record<string, any>
  ): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Your Daily Trading Digest 📊',
      type: EmailType.DAILY_DIGEST,
      data: { stats },
    }, to)
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(to: string, verificationLink: string): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Verify Your Email - Nexural Trading',
      type: EmailType.VERIFICATION,
      data: { verificationLink },
    }, to)
  }

  // =============================================================================
  // EMAIL TEMPLATES (Simple HTML for now - will convert to React Email)
  // =============================================================================

  private static getWelcomeTemplate(data: { name: string }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Nexural Trading</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Nexural Trading! 🎉</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-top: 0;">
                Hi ${data.name},
              </p>
              
              <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                Welcome to Nexural Trading! We're excited to have you join our community of successful traders.
              </p>
              
              <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                Here's what you can do next:
              </p>
              
              <ul style="font-size: 16px; color: #333333; line-height: 1.8;">
                <li>Explore live trading positions</li>
                <li>Follow successful traders</li>
                <li>Set up position alerts</li>
                <li>Join our Discord community</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-portal" 
                   style="display: inline-block; padding: 14px 32px; background-color: #0891b2; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  Go to Member Portal
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666666; line-height: 1.6; margin-bottom: 0;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #666666; margin: 0;">
                © ${new Date().getFullYear()} Nexural Trading. All rights reserved.
              </p>
              <p style="font-size: 12px; color: #666666; margin: 10px 0 0 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #0891b2; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  private static getPasswordResetTemplate(data: { resetLink: string }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0891b2; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Reset Your Password</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-top: 0;">
                You requested to reset your password for your Nexural Trading account.
              </p>
              
              <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                Click the button below to reset your password. This link will expire in 1 hour.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.resetLink}" 
                   style="display: inline-block; padding: 14px 32px; background-color: #0891b2; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666666; line-height: 1.6;">
                If you didn't request this, you can safely ignore this email.
              </p>
              
              <p style="font-size: 12px; color: #999999; line-height: 1.6; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Or copy and paste this URL into your browser:<br>
                <span style="color: #0891b2; word-break: break-all;">${data.resetLink}</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #666666; margin: 0;">
                © ${new Date().getFullYear()} Nexural Trading. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  private static getNewFollowerTemplate(data: { followerName: string; followerUsername: string }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Follower</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">👋</div>
              <h2 style="color: #333333; margin: 0 0 20px 0;">${data.followerName} started following you!</h2>
              <p style="font-size: 16px; color: #666666; line-height: 1.6;">
                Check out their profile and see their trading activity.
              </p>
              <div style="margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/${data.followerUsername}" 
                   style="display: inline-block; padding: 14px 32px; background-color: #0891b2; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Profile
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #666666; margin: 0;">
                © ${new Date().getFullYear()} Nexural Trading
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  private static getPositionAlertTemplate(data: { symbol: string; alertType: string; message: string }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Position Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background-color: #f59e0b; padding: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0;">⚠️ Position Alert</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h3 style="color: #333333; margin-top: 0;">${data.symbol} - ${data.alertType}</h3>
              <p style="font-size: 16px; color: #666666; line-height: 1.6;">
                ${data.message}
              </p>
              <div style="margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-portal/portfolio" 
                   style="display: inline-block; padding: 12px 24px; background-color: #0891b2; color: #ffffff; text-decoration: none; border-radius: 6px;">
                  View Position
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 15px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #666666; margin: 0;">
                © ${new Date().getFullYear()} Nexural Trading
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  private static getDailyDigestTemplate(data: { stats: any }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background-color: #0891b2; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Your Daily Trading Digest 📊</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h3 style="color: #333333; margin-top: 0;">Today's Highlights</h3>
              <p style="font-size: 16px; color: #666666; line-height: 1.6;">
                Here's what happened in your portfolio today:
              </p>
              <!-- Stats would be dynamically inserted here -->
              <div style="margin: 20px 0;">
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                  <strong style="color: #333333;">Active Positions:</strong> ${data.stats?.activePositions || 0}
                </div>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                  <strong style="color: #333333;">Today's P/L:</strong> <span style="color: ${data.stats?.dailyPL >= 0 ? '#10b981' : '#ef4444'};">${data.stats?.dailyPL >= 0 ? '+' : ''}${data.stats?.dailyPL || 0}%</span>
                </div>
              </div>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-portal" 
                   style="display: inline-block; padding: 14px 32px; background-color: #0891b2; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Full Dashboard
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #666666; margin: 0;">
                © ${new Date().getFullYear()} Nexural Trading
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  private static getTradeSignalTemplate(data: any): string {
    return this.getDefaultTemplate(data)
  }

  private static getSubscriptionReminderTemplate(data: any): string {
    return this.getDefaultTemplate(data)
  }

  private static getVerificationTemplate(data: { verificationLink: string }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">✉️</div>
              <h2 style="color: #333333; margin: 0 0 20px 0;">Verify Your Email Address</h2>
              <p style="font-size: 16px; color: #666666; line-height: 1.6;">
                Please click the button below to verify your email address and activate your account.
              </p>
              <div style="margin-top: 30px;">
                <a href="${data.verificationLink}" 
                   style="display: inline-block; padding: 14px 32px; background-color: #0891b2; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Verify Email
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #666666; margin: 0;">
                © ${new Date().getFullYear()} Nexural Trading
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  private static getDefaultTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">Nexural Trading</h2>
              <p style="font-size: 16px; color: #666666; line-height: 1.6;">
                ${JSON.stringify(data)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #666666; margin: 0;">
                © ${new Date().getFullYear()} Nexural Trading
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export const sendWelcomeEmail = EmailService.sendWelcomeEmail.bind(EmailService)
export const sendPasswordResetEmail = EmailService.sendPasswordResetEmail.bind(EmailService)
export const sendNewFollowerEmail = EmailService.sendNewFollowerEmail.bind(EmailService)
export const sendPositionAlertEmail = EmailService.sendPositionAlertEmail.bind(EmailService)
export const sendDailyDigestEmail = EmailService.sendDailyDigestEmail.bind(EmailService)
export const sendVerificationEmail = EmailService.sendVerificationEmail.bind(EmailService)

export default EmailService
