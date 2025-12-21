/**
 * Stripe Webhook Handler
 * Handles subscription events and updates newsletter subscribers
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { updateSubscriberType } from '@/lib/newsletter-automation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('⚠️  Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`🔔 Received Stripe event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle subscription created/updated
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerEmail = await getCustomerEmail(subscription.customer as string)
    
    if (!customerEmail) {
      console.error('No email found for customer')
      return
    }

    // Update newsletter subscriber to paid
    const result = await updateSubscriberType(customerEmail, 'paid')
    
    if (result.success) {
      console.log(`✅ Updated ${customerEmail} to paid subscriber`)
    } else {
      console.error(`Failed to update ${customerEmail}:`, result.error)
    }
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

/**
 * Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerEmail = await getCustomerEmail(subscription.customer as string)
    
    if (!customerEmail) {
      console.error('No email found for customer')
      return
    }

    // Update newsletter subscriber to churned
    const result = await updateSubscriberType(customerEmail, 'churned')
    
    if (result.success) {
      console.log(`✅ Updated ${customerEmail} to churned`)
    } else {
      console.error(`Failed to update ${customerEmail}:`, result.error)
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const customerEmail = session.customer_email || 
                         (session.customer ? await getCustomerEmail(session.customer as string) : null)
    
    if (!customerEmail) {
      console.error('No email found for checkout session')
      return
    }

    // If this is a subscription checkout, update to paid
    if (session.mode === 'subscription') {
      const result = await updateSubscriberType(customerEmail, 'paid')
      
      if (result.success) {
        console.log(`✅ Updated ${customerEmail} to paid (from checkout)`)
      }
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerEmail = await getCustomerEmail(invoice.customer as string)
    
    if (!customerEmail) {
      console.error('No email found for invoice')
      return
    }

    // Ensure subscriber is marked as paid
    const result = await updateSubscriberType(customerEmail, 'paid')
    
    if (result.success) {
      console.log(`✅ Confirmed ${customerEmail} as paid (payment succeeded)`)
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerEmail = await getCustomerEmail(invoice.customer as string)
    
    if (!customerEmail) {
      console.error('No email found for invoice')
      return
    }

    console.log(`⚠️  Payment failed for ${customerEmail}`)
    // Could send a notification email here
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

/**
 * Get customer email from Stripe customer ID
 */
async function getCustomerEmail(customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    
    if (customer.deleted) {
      return null
    }
    
    return customer.email
  } catch (error) {
    console.error('Error retrieving customer:', error)
    return null
  }
}
