import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { discordAPI } from '@/lib/discord'
import { 
  getDiscordUserIdByEmail as getDiscordUserIdByEmailDB, 
  updateSubscriptionStatus as updateSubscriptionStatusDB, 
  updateRoleAssignmentStatus 
} from '@/lib/discord-database'
import { headers } from 'next/headers'
import { verifyWebhookRequest } from '@/lib/rate-limiter'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  // Enhanced security: Rate limiting and IP verification for webhooks
  const stripeIPs = [
    '54.187.174.169',
    '54.187.205.235',
    '54.187.216.72',
    '54.241.31.99',
    '54.241.31.102',
    '54.241.34.107'
    // Add more Stripe IPs as needed
  ]
  
  const webhookVerification = await verifyWebhookRequest(req, stripeIPs)
  if (!webhookVerification.valid) {
    console.error('Webhook verification failed:', webhookVerification.reason)
    return NextResponse.json(
      { error: 'Webhook verification failed', reason: webhookVerification.reason }, 
      { status: 403 }
    )
  }

  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  console.log('Stripe webhook event:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: any) {
  console.log('Checkout completed for session:', session.id)
  
  const customerEmail = session.customer_details?.email || session.metadata?.customer_email
  
  if (customerEmail) {
    // Send Discord invite
    await sendDiscordInvite(customerEmail, session.customer)
    
    // Send welcome email
    await sendWelcomeEmail(customerEmail)
    
    // Add to newsletter
    await addToNewsletter(customerEmail)
    
    console.log(`New subscription activated for: ${customerEmail}`)
  }
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id)
  
  const customer = await stripe.customers.retrieve(subscription.customer)
  const customerEmail = (customer as any).email
  
  if (customerEmail) {
    // Ensure Discord access is granted
    await grantDiscordAccess(customerEmail, subscription.id)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id)
  
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  const customer = await stripe.customers.retrieve(customerId)
  const customerEmail = (customer as any).email
  
  if (subscription.status === 'active') {
    await grantDiscordAccess(customerEmail, subscription.id)
  } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    await revokeDiscordAccess(customerEmail, subscription.id)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription deleted:', subscription.id)
  
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  const customer = await stripe.customers.retrieve(customerId)
  const customerEmail = (customer as any).email
  
  if (customerEmail) {
    await revokeDiscordAccess(customerEmail, subscription.id)
    await sendCancellationEmail(customerEmail)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  console.log('Payment succeeded for invoice:', invoice.id)
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
    const customer = await stripe.customers.retrieve(customerId)
    const customerEmail = (customer as any).email
    
    if (customerEmail) {
      await grantDiscordAccess(customerEmail, subscription.id)
      await sendPaymentConfirmationEmail(customerEmail, invoice.amount_paid / 100)
    }
  }
}

async function handlePaymentFailed(invoice: any) {
  console.log('Payment failed for invoice:', invoice.id)
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
    const customer = await stripe.customers.retrieve(customerId)
    const customerEmail = (customer as any).email
    
    if (customerEmail) {
      await sendPaymentFailedEmail(customerEmail)
      // Don't revoke access immediately - give them time to update payment
    }
  }
}

async function sendDiscordInvite(email: string, customerId: string) {
  try {
    // Generate Discord invite link
    const discordInviteUrl = process.env.DISCORD_INVITE_URL || 'https://discord.gg/your-server'
    
    // Store member in database with Discord access
    // This would integrate with your database to track members
    console.log(`Discord invite sent to: ${email}`)
    console.log(`Discord invite URL: ${discordInviteUrl}`)
    
    // In production, you would:
    // 1. Store member in database
    // 2. Send email with Discord invite
    // 3. Use Discord bot to grant roles
    
  } catch (error) {
    console.error('Error sending Discord invite:', error)
  }
}

async function grantDiscordAccess(email: string, subscriptionId: string) {
  try {
    console.log(`🎯 Granting Discord access to: ${email} (Subscription: ${subscriptionId})`)
    
    // Get Discord user ID from database using email
    const discordUserId = await getDiscordUserIdByEmail(email)
    
    if (discordUserId) {
      // Use your actual Discord role ID from environment variables
      const roleId = process.env.DISCORD_BASIC_ROLE_ID!
      const success = await discordAPI.addRoleToUser(discordUserId, roleId)
      
      if (success) {
        console.log(`✅ Discord role granted to user ${discordUserId}`)
        
        // Send welcome message to general channel
        await sendWelcomeMessage(discordUserId, email)
        
        // Update database subscription status
        await updateSubscriptionStatus(email, 'active', subscriptionId)
      } else {
        console.error(`❌ Failed to grant Discord role to ${discordUserId}`)
      }
    } else {
      console.log(`⚠️ Discord user not found for email: ${email}`)
      // Send email asking them to link Discord account
      await sendDiscordLinkEmail(email)
    }
    
  } catch (error) {
    console.error('Error granting Discord access:', error)
  }
}

async function revokeDiscordAccess(email: string, subscriptionId: string) {
  try {
    console.log(`🚫 Revoking Discord access for: ${email} (Subscription: ${subscriptionId})`)
    
    // Get Discord user ID from database using email
    const discordUserId = await getDiscordUserIdByEmail(email)
    
    if (discordUserId) {
      // Use your actual Discord role ID from environment variables
      const roleId = process.env.DISCORD_BASIC_ROLE_ID!
      const success = await discordAPI.removeRoleFromUser(discordUserId, roleId)
      
      if (success) {
        console.log(`✅ Discord role revoked from user ${discordUserId}`)
        
        // Update database subscription status
        await updateSubscriptionStatus(email, 'inactive', subscriptionId)
        
        // Send farewell message
        await sendFarewellMessage(discordUserId, email)
      } else {
        console.error(`❌ Failed to revoke Discord role from ${discordUserId}`)
      }
    } else {
      console.log(`⚠️ Discord user not found for email: ${email}`)
    }
    
  } catch (error) {
    console.error('Error revoking Discord access:', error)
  }
}

// Helper functions
async function getDiscordUserIdByEmail(email: string): Promise<string | null> {
  return await getDiscordUserIdByEmailDB(email)
}

async function updateSubscriptionStatus(email: string, status: 'active' | 'inactive' | 'cancelled' | 'past_due', subscriptionId: string) {
  return await updateSubscriptionStatusDB(email, status, subscriptionId)
}

async function sendWelcomeMessage(discordUserId: string, email: string) {
  try {
    const welcomeChannelId = process.env.DISCORD_GENERAL_CHANNEL_ID!
    const message = `🎉 Welcome to Nexural Trading Premium, <@${discordUserId}>! You now have access to all premium trading signals and community features. Let's build wealth together! 💎`
    
    await discordAPI.sendMessage(welcomeChannelId, message)
    console.log(`Welcome message sent for ${email}`)
  } catch (error) {
    console.error('Error sending welcome message:', error)
  }
}

async function sendFarewellMessage(discordUserId: string, email: string) {
  try {
    const generalChannelId = process.env.DISCORD_GENERAL_CHANNEL_ID!
    const message = `👋 <@${discordUserId}> has left our premium community. We hope to see you back soon! The door is always open. 💙`
    
    await discordAPI.sendMessage(generalChannelId, message)
    console.log(`Farewell message sent for ${email}`)
  } catch (error) {
    console.error('Error sending farewell message:', error)
  }
}

async function sendDiscordLinkEmail(email: string) {
  try {
    console.log(`Sending Discord link email to: ${email}`)
    
    // Generate Discord invite link
    const { discordAPI } = await import('@/lib/discord')
    const generalChannelId = process.env.DISCORD_GENERAL_CHANNEL_ID!
    const inviteUrl = await discordAPI.createInvite(generalChannelId, 86400) // 24 hour expiry
    
    if (inviteUrl) {
      const { emailService } = await import('@/lib/email')
      await emailService.sendDiscordInviteEmail(
        email,
        email.split('@')[0], // Use email username as fallback name
        inviteUrl,
        'Premium Trading Signals'
      )
      console.log(`✅ Discord invite email sent to: ${email}`)
    }
  } catch (error) {
    console.error('Error sending Discord link email:', error)
  }
}

async function addToNewsletter(email: string) {
  try {
    // Add to newsletter subscription
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'stripe_subscription' })
    })
    
    if (response.ok) {
      console.log(`Added to newsletter: ${email}`)
    }
  } catch (error) {
    console.error('Error adding to newsletter:', error)
  }
}

async function sendWelcomeEmail(email: string) {
  try {
    console.log(`Sending welcome email to: ${email}`)
    
    // Generate Discord invite link
    const { discordAPI } = await import('@/lib/discord')
    const generalChannelId = process.env.DISCORD_GENERAL_CHANNEL_ID!
    const inviteUrl = await discordAPI.createInvite(generalChannelId, 86400) // 24 hour expiry
    
    // Send professional welcome email
    const { emailService } = await import('@/lib/email')
    await emailService.sendWelcomeEmail({
      email,
      name: email.split('@')[0], // Use email username as fallback name
      planName: 'Premium Trading Signals',
      discordInviteUrl: inviteUrl || undefined
    })
    
    console.log(`✅ Welcome email sent to: ${email}`)
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

async function sendPaymentConfirmationEmail(email: string, amount: number) {
  try {
    console.log(`Sending payment confirmation to: ${email} for $${amount}`)
    
    // Create a simple payment confirmation email template
    const { emailService } = await import('@/lib/email')
    
    const subject = `Payment Confirmed - $${amount} for Nexural Trading Premium`
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
            <h1 style="color: #14b8a6; margin: 0; font-size: 28px; font-weight: bold;">Payment Confirmed!</h1>
            <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 16px;">Thank you for your payment</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">Payment Details</h2>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Service:</strong> Nexural Trading Premium Subscription</p>
            <p><strong>Status:</strong> ✅ Confirmed and processed</p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #14b8a6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Your Dashboard</a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p>Questions? Contact support@nexural.io</p>
            <p>© 2024 Nexural Trading. All rights reserved.</p>
          </div>
        </body>
      </html>
    `
    
    const textContent = `
Payment Confirmed!

Thank you for your payment to Nexural Trading.

Payment Details:
- Amount: $${amount}
- Service: Nexural Trading Premium Subscription  
- Status: Confirmed and processed

Access your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Questions? Contact support@nexural.io
© 2024 Nexural Trading. All rights reserved.
    `
    
    await emailService.sendNewsletterCampaign(email, subject, htmlContent, textContent)
    console.log(`✅ Payment confirmation email sent to: ${email}`)
    
  } catch (error) {
    console.error('Error sending payment confirmation email:', error)
  }
}

async function sendPaymentFailedEmail(email: string) {
  try {
    console.log(`Sending payment failed email to: ${email}`)
    
    // Get billing portal URL (you'll need to create this with Stripe)
    const billingPortalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`
    
    const { emailService } = await import('@/lib/email')
    await emailService.sendPaymentFailedEmail({
      email,
      name: email.split('@')[0], // Use email username as fallback name
      planName: 'Premium Trading Signals',
      nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
      billingPortalUrl
    })
    
    console.log(`✅ Payment failed email sent to: ${email}`)
  } catch (error) {
    console.error('Error sending payment failed email:', error)
  }
}

async function sendCancellationEmail(email: string) {
  try {
    console.log(`Sending cancellation email to: ${email}`)
    
    const { emailService } = await import('@/lib/email')
    await emailService.sendSubscriptionCanceledEmail({
      email,
      name: email.split('@')[0], // Use email username as fallback name
      planName: 'Premium Trading Signals',
      accessEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() // 30 days from now
    })
    
    console.log(`✅ Cancellation email sent to: ${email}`)
  } catch (error) {
    console.error('Error sending cancellation email:', error)
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe Webhook Endpoint',
    events: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated', 
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed'
    ]
  })
}
