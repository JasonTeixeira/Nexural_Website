import { Resend } from 'resend'

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.SUPPORT_EMAIL || 'support@nexuraltrading.com',
  replyTo: process.env.SUPPORT_EMAIL || 'support@nexuraltrading.com',
  discordInviteUrl: process.env.DISCORD_INVITE_URL || 'https://discord.gg/your-invite-link',
}

// Email types
export interface WelcomeEmailData {
  email: string
  name?: string
}

export interface DiscordInviteEmailData {
  email: string
  name?: string
  discordInviteUrl: string
}

export interface WaitlistConfirmationEmailData {
  email: string
  name?: string
  position: number
  plan: string
}

// Send welcome email
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.email,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: 'Welcome to Nexural Trading! 🎉',
      html: getWelcomeEmailHTML(data),
    })
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

// Send Discord invite email
export async function sendDiscordInviteEmail(data: DiscordInviteEmailData) {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.email,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: 'Your Discord Invite is Ready! 🚀',
      html: getDiscordInviteEmailHTML(data),
    })
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending Discord invite email:', error)
    return { success: false, error }
  }
}

// Send waitlist confirmation email
export async function sendWaitlistConfirmationEmail(data: WaitlistConfirmationEmailData) {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.email,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `You're on the List! Position #${data.position}`,
      html: getWaitlistConfirmationEmailHTML(data),
    })
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending waitlist confirmation email:', error)
    return { success: false, error }
  }
}

// Email HTML templates
function getWelcomeEmailHTML(data: WelcomeEmailData): string {
  const firstName = data.name?.split(' ')[0] || 'there'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Nexural Trading</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0f1e; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #06b6d4; font-size: 32px; margin: 0;">Nexural Trading</h1>
            <p style="color: #94a3b8; margin-top: 8px;">Welcome to the Community!</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">Hi ${firstName}! 👋</h2>
            
            <p style="color: #cbd5e1; line-height: 1.6; margin: 0 0 24px 0;">
              Thank you for joining Nexural Trading! We're excited to have you as part of our FREE community.
            </p>
            
            <div style="background: rgba(6, 182, 212, 0.1); border-left: 4px solid #06b6d4; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h3 style="color: #06b6d4; font-size: 18px; margin: 0 0 12px 0;">What's Included (100% FREE)</h3>
              <ul style="color: #cbd5e1; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Full Discord community access</li>
                <li style="margin-bottom: 8px;">Complete YouTube educational library</li>
                <li style="margin-bottom: 8px;">Free trading indicators</li>
                <li style="margin-bottom: 8px;">Weekly market analysis & picks</li>
                <li style="margin-bottom: 8px;">Live Q&A sessions</li>
                <li>80/20 wealth building system training</li>
              </ul>
            </div>
            
            <p style="color: #cbd5e1; line-height: 1.6; margin: 24px 0;">
              <strong>Next Step:</strong> Check your inbox for your Discord invite (arriving in 1 minute). That's where all the action happens!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(148, 163, 184, 0.1);">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
              Questions? Reply to this email or reach us at
            </p>
            <p style="color: #06b6d4; font-size: 14px; margin: 0;">
              <a href="mailto:${EMAIL_CONFIG.replyTo}" style="color: #06b6d4; text-decoration: none;">${EMAIL_CONFIG.replyTo}</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

function getDiscordInviteEmailHTML(data: DiscordInviteEmailData): string {
  const firstName = data.name?.split(' ')[0] || 'there'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Discord Invite</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0f1e; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #06b6d4; font-size: 32px; margin: 0;">🚀 Join Our Discord!</h1>
            <p style="color: #94a3b8; margin-top: 8px;">Your community awaits</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">Hey ${firstName}!</h2>
            
            <p style="color: #cbd5e1; line-height: 1.6; margin: 0 0 24px 0;">
              Your permanent Discord invite link is ready. Click the button below to join 1,000+ members learning together!
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.discordInviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 18px;">
                Join Discord Community
              </a>
            </div>
            
            <div style="background: rgba(6, 182, 212, 0.1); border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h3 style="color: #06b6d4; font-size: 16px; margin: 0 0 12px 0;">Quick Start Guide:</h3>
              <ol style="color: #cbd5e1; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Click the invite button above</li>
                <li style="margin-bottom: 8px;">Create your Discord account (if needed)</li>
                <li style="margin-bottom: 8px;">Introduce yourself in #introductions</li>
                <li style="margin-bottom: 8px;">Explore the channels</li>
                <li>Start learning the 80/20 system!</li>
              </ol>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; font-style: italic; margin: 24px 0 0 0;">
              Note: This is a permanent invite link. You can join anytime!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(148, 163, 184, 0.1);">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
              Problems joining? Contact us at
            </p>
            <p style="color: #06b6d4; font-size: 14px; margin: 0;">
              <a href="mailto:${EMAIL_CONFIG.replyTo}" style="color: #06b6d4; text-decoration: none;">${EMAIL_CONFIG.replyTo}</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

function getWaitlistConfirmationEmailHTML(data: WaitlistConfirmationEmailData): string {
  const firstName = data.name?.split(' ')[0] || 'there'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're on the Waitlist!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0f1e; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #a855f7; font-size: 32px; margin: 0;">You're On The List! 🎉</h1>
            <p style="color: #94a3b8; margin-top: 8px;">Position #${data.position}</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">Hi ${firstName}!</h2>
            
            <p style="color: #cbd5e1; line-height: 1.6; margin: 0 0 24px 0;">
              Thank you for your interest in <strong style="color: #a855f7;">${data.plan}</strong>! You're officially on the waitlist.
            </p>
            
            <!-- Position Badge -->
            <div style="background: rgba(168, 85, 247, 0.2); border: 2px solid #a855f7; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <div style="color: #a855f7; font-size: 48px; font-weight: bold; margin-bottom: 8px;">
                #${data.position}
              </div>
              <div style="color: #cbd5e1; font-size: 16px;">
                Your Position in Line
              </div>
            </div>
            
            <div style="background: rgba(6, 182, 212, 0.1); border-left: 4px solid #06b6d4; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h3 style="color: #06b6d4; font-size: 18px; margin: 0 0 12px 0;">What's OrderFlow Pro?</h3>
              <ul style="color: #cbd5e1; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Real-time options orderflow data</li>
                <li style="margin-bottom: 8px;">AI-powered stock scanner</li>
                <li style="margin-bottom: 8px;">Institutional money flow tracking</li>
                <li style="margin-bottom: 8px;">Advanced analytics dashboard</li>
                <li style="margin-bottom: 8px;">API access for custom integrations</li>
              </ul>
            </div>
            
            <div style="background: rgba(168, 85, 247, 0.1); border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #cbd5e1; margin: 0 0 8px 0;"><strong>Launch Date:</strong> Q3 2026</p>
              <p style="color: #cbd5e1; margin: 0;"><strong>Price:</strong> $100/month</p>
            </div>
            
            <p style="color: #cbd5e1; line-height: 1.6; margin: 24px 0 0 0;">
              We'll notify you as soon as OrderFlow Pro launches. You'll get priority access and early-bird pricing!
            </p>
          </div>
          
          <!-- Meanwhile Section -->
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <h3 style="color: #10b981; font-size: 18px; margin: 0 0 12px 0;">Meanwhile...</h3>
            <p style="color: #cbd5e1; line-height: 1.6; margin: 0;">
              Join our <strong>FREE community</strong> to start learning the 80/20 wealth building system now! Full Discord access, YouTube content, and weekly analysis.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(148, 163, 184, 0.1);">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
              Questions about OrderFlow Pro?
            </p>
            <p style="color: #a855f7; font-size: 14px; margin: 0;">
              <a href="mailto:${EMAIL_CONFIG.replyTo}" style="color: #a855f7; text-decoration: none;">${EMAIL_CONFIG.replyTo}</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
