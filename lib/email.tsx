interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface WelcomeEmailData {
  name: string
  email: string
  planName: string
  discordInviteUrl?: string
}

interface PaymentFailedEmailData {
  name: string
  email: string
  planName: string
  nextBillingDate: string
  billingPortalUrl: string
}

interface SubscriptionCanceledEmailData {
  name: string
  email: string
  planName: string
  accessEndDate: string
}

export class EmailService {
  private apiKey: string
  private fromEmail: string

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY!
    this.fromEmail = process.env.FROM_EMAIL || "noreply@pointerai.com"
  }

  private async sendEmail(to: string, subject: string, html: string, text: string) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject,
          html,
          text,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Email send failed: ${response.status} ${error}`)
      }

      const result = await response.json()
      console.log(`Email sent successfully to ${to}:`, result.id)
      return result
    } catch (error) {
      console.error("Error sending email:", error)
      throw error
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData) {
    const template = this.getWelcomeEmailTemplate(data)
    return await this.sendEmail(data.email, template.subject, template.html, template.text)
  }

  async sendPaymentFailedEmail(data: PaymentFailedEmailData) {
    const template = this.getPaymentFailedEmailTemplate(data)
    return await this.sendEmail(data.email, template.subject, template.html, template.text)
  }

  async sendSubscriptionCanceledEmail(data: SubscriptionCanceledEmailData) {
    const template = this.getSubscriptionCanceledEmailTemplate(data)
    return await this.sendEmail(data.email, template.subject, template.html, template.text)
  }

  async sendDiscordInviteEmail(email: string, name: string, inviteUrl: string, planName: string) {
    const template = this.getDiscordInviteEmailTemplate(name, inviteUrl, planName)
    return await this.sendEmail(email, template.subject, template.html, template.text)
  }

  async sendNewsletterWelcomeEmail(data: { email: string; name: string }) {
    const template = this.getNewsletterWelcomeEmailTemplate(data)
    return await this.sendEmail(data.email, template.subject, template.html, template.text)
  }

  async sendNewsletterCampaign(email: string, subject: string, htmlContent: string, textContent: string) {
    return await this.sendEmail(email, subject, htmlContent, textContent)
  }

  private getWelcomeEmailTemplate(data: WelcomeEmailData): EmailTemplate {
    const subject = `Welcome to Nexural Trading - Your ${data.planName} subscription is active!`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Pointer AI</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
            <h1 style="color: #14b8a6; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Nexural Trading!</h1>
            <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 16px;">Your premium trading intelligence subscription is now active</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">What's Next?</h2>
            <div style="margin: 20px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 24px; height: 24px; background: #14b8a6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-weight: bold;">1</span>
                </div>
                <span><strong>Check your email</strong> - Your first newsletter will arrive within 24 hours</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 24px; height: 24px; background: #14b8a6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-weight: bold;">2</span>
                </div>
                <span><strong>Join our Discord</strong> - Connect with other AI enthusiasts</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 24px; height: 24px; background: #14b8a6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-weight: bold;">3</span>
                </div>
                <span><strong>Access your dashboard</strong> - Manage your subscription anytime</span>
              </div>
            </div>
          </div>

          ${
            data.discordInviteUrl
              ? `
          <div style="background: #5865f2; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h3 style="color: white; margin-top: 0;">Join Our Discord Community</h3>
            <p style="color: #b9bbbe; margin-bottom: 20px;">Connect with fellow AI enthusiasts and get exclusive insights</p>
            <a href="${data.discordInviteUrl}" style="background: white; color: #5865f2; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Join Discord</a>
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #14b8a6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Dashboard</a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p>Need help? Reply to this email or contact us at support@nexural.io</p>
            <p>© 2024 Nexural Trading. All rights reserved.</p>
          </div>
        </body>
      </html>
    `

    const text = `
Welcome to Nexural Trading!

Hi ${data.name},

Your ${data.planName} subscription is now active! Here's what happens next:

1. Check your email - Your first newsletter will arrive within 24 hours
2. Join our Discord - Connect with other AI enthusiasts
3. Access your dashboard - Manage your subscription anytime

${data.discordInviteUrl ? `Join our Discord community: ${data.discordInviteUrl}` : ""}

Access your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Need help? Reply to this email or contact us at support@pointerai.com

© 2024 Nexural Trading. All rights reserved.
    `

    return { subject, html, text }
  }

  private getPaymentFailedEmailTemplate(data: PaymentFailedEmailData): EmailTemplate {
    const subject = "Payment Failed - Action Required for Your Nexural Trading Subscription"

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Failed</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin-top: 0;">Payment Failed</h1>
            <p>We were unable to process your payment for your ${data.planName} subscription.</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2>What happens now?</h2>
            <p>Your subscription will remain active until <strong>${data.nextBillingDate}</strong>. To avoid any interruption in service, please update your payment method.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.billingPortalUrl}" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Update Payment Method</a>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="margin-top: 0;">Need Help?</h3>
            <p>If you're experiencing issues with payment, please contact our support team. We're here to help!</p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p>Contact support: support@nexural.io</p>
            <p>© 2024 Pointer AI. All rights reserved.</p>
          </div>
        </body>
      </html>
    `

    const text = `
Payment Failed - Action Required

Hi ${data.name},

We were unable to process your payment for your ${data.planName} subscription.

Your subscription will remain active until ${data.nextBillingDate}. To avoid any interruption in service, please update your payment method.

Update your payment method: ${data.billingPortalUrl}

Need help? Contact our support team at support@pointerai.com

© 2024 Pointer AI. All rights reserved.
    `

    return { subject, html, text }
  }

  private getSubscriptionCanceledEmailTemplate(data: SubscriptionCanceledEmailData): EmailTemplate {
    const subject = "Your Nexural Trading subscription has been canceled"

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Canceled</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h1 style="color: #1e293b; margin-top: 0;">Subscription Canceled</h1>
            <p style="color: #64748b;">We're sorry to see you go!</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2>What happens next?</h2>
            <p>Your ${data.planName} subscription has been canceled. You'll continue to have access to:</p>
            <ul>
              <li>Premium newsletter content until <strong>${data.accessEndDate}</strong></li>
              <li>Discord community access until <strong>${data.accessEndDate}</strong></li>
              <li>Your account dashboard</li>
            </ul>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #0369a1;">Changed your mind?</h3>
            <p>You can reactivate your subscription anytime before ${data.accessEndDate} to continue receiving premium content.</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe" style="background: #0369a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reactivate Subscription</a>
            </div>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p>We'd love to hear your feedback: support@nexural.io</p>
            <p>© 2024 Pointer AI. All rights reserved.</p>
          </div>
        </body>
      </html>
    `

    const text = `
Subscription Canceled

Hi ${data.name},

Your ${data.planName} subscription has been canceled. We're sorry to see you go!

You'll continue to have access until ${data.accessEndDate}:
- Premium newsletter content
- Discord community access
- Your account dashboard

Changed your mind? You can reactivate your subscription anytime before ${data.accessEndDate}.

Reactivate: ${process.env.NEXT_PUBLIC_APP_URL}/subscribe

We'd love to hear your feedback: support@pointerai.com

© 2024 Pointer AI. All rights reserved.
    `

    return { subject, html, text }
  }

  private getDiscordInviteEmailTemplate(name: string, inviteUrl: string, planName: string): EmailTemplate {
    const subject = "Join the Nexural Trading Discord Community"

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Join Discord</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #5865f2; padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Join Our Discord!</h1>
            <p style="color: #b9bbbe; margin: 10px 0 0 0; font-size: 16px;">Connect with fellow AI enthusiasts</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2>Hi ${name}!</h2>
            <p>Your ${planName} subscription gives you exclusive access to our Discord community where you can:</p>
            <ul>
              <li>🤖 Discuss the latest AI developments</li>
              <li>💡 Share insights and get feedback</li>
              <li>🚀 Network with other AI professionals</li>
              <li>📈 Get early access to new content</li>
              <li>❓ Ask questions and get expert answers</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${inviteUrl}" style="background: #5865f2; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">Join Discord Community</a>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 0; color: #92400e;"><strong>Note:</strong> This invite link is unique to you and expires in 24 hours. Click the button above to join immediately!</p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p>Having trouble joining? Contact support@nexural.io</p>
            <p>© 2024 Pointer AI. All rights reserved.</p>
          </div>
        </body>
      </html>
    `

    const text = `
Join Our Discord Community!

Hi ${name}!

Your ${planName} subscription gives you exclusive access to our Discord community where you can:

- Discuss the latest AI developments
- Share insights and get feedback  
- Network with other AI professionals
- Get early access to new content
- Ask questions and get expert answers

Join now: ${inviteUrl}

Note: This invite link is unique to you and expires in 24 hours.

Having trouble joining? Contact support@pointerai.com

© 2024 Pointer AI. All rights reserved.
    `

    return { subject, html, text }
  }

  private getNewsletterWelcomeEmailTemplate(data: { email: string; name: string }): EmailTemplate {
    const subject = "Welcome to Nexural's Free Newsletter!"

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Nexural Newsletter</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
            <h1 style="color: #14b8a6; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Nexural!</h1>
            <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 16px;">Your free trading newsletter subscription is active</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2>Hi ${data.name}!</h2>
            <p>Thank you for subscribing to Nexural's free newsletter! You'll now receive:</p>
            <ul style="color: #4b5563;">
              <li>📊 Weekly market analysis and insights</li>
              <li>💡 Trading tips and strategies</li>
              <li>📈 Market trend predictions</li>
              <li>🎓 Educational content for all skill levels</li>
              <li>🚀 Early access to new features</li>
            </ul>
          </div>

          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin-top: 0;">What's Next?</h3>
            <div style="margin: 20px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 24px; height: 24px; background: #14b8a6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-weight: bold;">1</span>
                </div>
                <span><strong>Check your inbox</strong> - Your first newsletter arrives this week</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 24px; height: 24px; background: #14b8a6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-weight: bold;">2</span>
                </div>
                <span><strong>Follow us</strong> - Stay updated on social media</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 24px; height: 24px; background: #14b8a6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-weight: bold;">3</span>
                </div>
                <span><strong>Upgrade anytime</strong> - Get Discord access for live discussions</span>
              </div>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h3 style="color: white; margin-top: 0; margin-bottom: 15px;">Want More?</h3>
            <p style="color: #a7f3d0; margin-bottom: 20px; font-size: 14px;">Join our Discord community for live trading discussions, premium signals, and direct access to our team.</p>
            <a href="https://discord.gg/fTS3Nedk" style="background: white; color: #14b8a6; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Join FREE Discord Community</a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p>Questions? Reply to this email or contact us at newsletter@nexural.io</p>
            <p>© 2024 Nexural. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 15px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(data.email)}" style="color: #9ca3af;">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `

    const text = `
Welcome to Nexural's Free Newsletter!

Hi ${data.name}!

Thank you for subscribing to Nexural's free newsletter! You'll now receive:

- Weekly market analysis and insights
- Trading tips and strategies  
- Market trend predictions
- Educational content for all skill levels
- Early access to new features

What's Next?
1. Check your inbox - Your first newsletter arrives this week
2. Follow us - Stay updated on social media
3. Upgrade anytime - Get Discord access for live discussions

Want More?
Join our Discord community for live trading discussions, premium signals, and direct access to our team.

Join FREE Discord: https://discord.gg/fTS3Nedk

Questions? Reply to this email or contact us at newsletter@nexural.io

© 2024 Nexural. All rights reserved.

Unsubscribe: ${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(data.email)}
    `

    return { subject, html, text }
  }
}

export const emailService = new EmailService()
