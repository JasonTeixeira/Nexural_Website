import { createClient } from '@supabase/supabase-js'
import { memberManagementService } from './member-management-service'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as any
})

// Payment interfaces
interface PaymentPlan {
  id: string
  name: string
  tier: 'free' | 'basic' | 'premium' | 'enterprise'
  price_monthly: number
  price_yearly: number
  stripe_price_id_monthly: string
  stripe_price_id_yearly: string
  features: string[]
  is_active: boolean
  trial_days: number
}

interface PaymentTransaction {
  id: string
  member_id: string
  stripe_payment_intent_id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
  payment_method: string
  description: string
  metadata?: any
  created_at: string
  updated_at: string
}

interface Subscription {
  id: string
  member_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  plan_id: string
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing' | 'unpaid'
  current_period_start: string
  current_period_end: string
  trial_end?: string
  cancel_at_period_end: boolean
  cancelled_at?: string
  created_at: string
  updated_at: string
}

export class PaymentProcessingService {
  
  // Payment Plans Management
  async getPaymentPlans(): Promise<PaymentPlan[]> {
    try {
      const { data: plans, error } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (error) {
        console.error('Error fetching payment plans:', error)
        return []
      }

      return plans || []
    } catch (error) {
      console.error('Error in getPaymentPlans:', error)
      return []
    }
  }

  async createPaymentPlan(planData: Omit<PaymentPlan, 'id' | 'stripe_price_id_monthly' | 'stripe_price_id_yearly'>): Promise<{ success: boolean; plan?: PaymentPlan; error?: string }> {
    try {
      // Create Stripe products and prices
      const stripeProduct = await stripe.products.create({
        name: planData.name,
        description: `${planData.tier} plan - ${planData.features.join(', ')}`,
        metadata: {
          tier: planData.tier,
          trial_days: planData.trial_days.toString()
        }
      })

      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(planData.price_monthly * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          billing_cycle: 'monthly'
        }
      })

      // Create yearly price
      const yearlyPrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(planData.price_yearly * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        metadata: {
          billing_cycle: 'yearly'
        }
      })

      // Save to database
      const { data: plan, error } = await supabase
        .from('payment_plans')
        .insert({
          ...planData,
          stripe_price_id_monthly: monthlyPrice.id,
          stripe_price_id_yearly: yearlyPrice.id
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, plan }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Customer Management
  async createStripeCustomer(memberId: string, email: string, name: string): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          member_id: memberId
        }
      })

      // Update member with Stripe customer ID
      await supabase
        .from('members')
        .update({ stripe_customer_id: customer.id })
        .eq('id', memberId)

      return { success: true, customerId: customer.id }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getOrCreateStripeCustomer(memberId: string): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      // Check if member already has a Stripe customer ID
      const { data: member } = await supabase
        .from('members')
        .select('stripe_customer_id, email, name')
        .eq('id', memberId)
        .single()

      if (!member) {
        return { success: false, error: 'Member not found' }
      }

      if (member.stripe_customer_id) {
        return { success: true, customerId: member.stripe_customer_id }
      }

      // Create new Stripe customer
      return this.createStripeCustomer(memberId, member.email, member.name)
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Subscription Management
  async createSubscription(memberId: string, planId: string, billingCycle: 'monthly' | 'yearly', paymentMethodId?: string): Promise<{ success: boolean; subscription?: any; clientSecret?: string; error?: string }> {
    try {
      // Get payment plan
      const { data: plan } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (!plan) {
        return { success: false, error: 'Payment plan not found' }
      }

      // Get or create Stripe customer
      const customerResult = await this.getOrCreateStripeCustomer(memberId)
      if (!customerResult.success) {
        return { success: false, error: customerResult.error }
      }

      const priceId = billingCycle === 'monthly' ? plan.stripe_price_id_monthly : plan.stripe_price_id_yearly

      // Create Stripe subscription
      const subscriptionData: any = {
        customer: customerResult.customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          member_id: memberId,
          plan_id: planId,
          billing_cycle: billingCycle
        }
      }

      // Add trial period if applicable
      if (plan.trial_days > 0) {
        subscriptionData.trial_period_days = plan.trial_days
      }

      // Add payment method if provided
      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId
      }

      const stripeSubscription = await stripe.subscriptions.create(subscriptionData)

      // Save subscription to database
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert({
          member_id: memberId,
          stripe_subscription_id: stripeSubscription.id,
          stripe_customer_id: customerResult.customerId!,
          plan_id: planId,
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Update member subscription info
      await memberManagementService.updateSubscription(memberId, {
        tier: plan.tier,
        status: stripeSubscription.status,
        start_date: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        end_date: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        billing_cycle: billingCycle
      })

      // Get client secret for payment confirmation
      const clientSecret = stripeSubscription.latest_invoice?.payment_intent?.client_secret

      return { 
        success: true, 
        subscription,
        clientSecret
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async cancelSubscription(memberId: string, cancelImmediately: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      // Get subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('member_id', memberId)
        .eq('status', 'active')
        .single()

      if (!subscription) {
        return { success: false, error: 'Active subscription not found' }
      }

      // Cancel Stripe subscription
      const stripeSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: !cancelImmediately
      })

      if (cancelImmediately) {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
      }

      // Update database
      await supabase
        .from('subscriptions')
        .update({
          status: cancelImmediately ? 'cancelled' : 'active',
          cancel_at_period_end: !cancelImmediately,
          cancelled_at: cancelImmediately ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      // Update member status
      await memberManagementService.cancelSubscription(memberId, cancelImmediately ? 'immediate_cancellation' : 'end_of_period')

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async reactivateSubscription(memberId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get cancelled subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('member_id', memberId)
        .eq('cancel_at_period_end', true)
        .single()

      if (!subscription) {
        return { success: false, error: 'Cancelled subscription not found' }
      }

      // Reactivate Stripe subscription
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: false
      })

      // Update database
      await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          cancelled_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      // Update member status
      await memberManagementService.updateSubscription(memberId, {
        tier: subscription.plan_id,
        status: 'active'
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Payment Processing
  async createPaymentIntent(memberId: string, amount: number, currency: string = 'usd', description: string): Promise<{ success: boolean; clientSecret?: string; error?: string }> {
    try {
      // Get or create Stripe customer
      const customerResult = await this.getOrCreateStripeCustomer(memberId)
      if (!customerResult.success) {
        return { success: false, error: customerResult.error }
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerResult.customerId,
        description,
        metadata: {
          member_id: memberId
        },
        automatic_payment_methods: {
          enabled: true
        }
      })

      // Save transaction record
      await supabase
        .from('payment_transactions')
        .insert({
          member_id: memberId,
          stripe_payment_intent_id: paymentIntent.id,
          amount,
          currency,
          status: 'pending',
          payment_method: 'stripe',
          description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      return { success: true, clientSecret: paymentIntent.client_secret! }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      // Update transaction record
      await supabase
        .from('payment_transactions')
        .update({
          status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed',
          payment_method: paymentIntent.payment_method_types[0] || 'unknown',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntentId)

      if (paymentIntent.status === 'succeeded') {
        // Update member total spent
        const memberId = paymentIntent.metadata.member_id
        if (memberId) {
          const { data: member } = await supabase
            .from('members')
            .select('total_spent')
            .eq('id', memberId)
            .single()

          if (member) {
            await supabase
              .from('members')
              .update({
                total_spent: (member.total_spent || 0) + (paymentIntent.amount / 100)
              })
              .eq('id', memberId)
          }

          // Log activity
          await memberManagementService.logMemberActivity(
            memberId,
            'payment',
            `Payment of $${(paymentIntent.amount / 100).toFixed(2)} completed`,
            { payment_intent_id: paymentIntentId, amount: paymentIntent.amount / 100 }
          )
        }
      }

      return { success: paymentIntent.status === 'succeeded' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Webhook Handling
  async handleStripeWebhook(event: any): Promise<{ success: boolean; error?: string }> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object)
          break

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object)
          break

        case 'invoice.payment_succeeded':
          await this.handlePaymentSuccess(event.data.object)
          break

        case 'invoice.payment_failed':
          await this.handlePaymentFailure(event.data.object)
          break

        case 'payment_intent.succeeded':
          await this.confirmPayment(event.data.object.id)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private async handleSubscriptionUpdate(subscription: any): Promise<void> {
    try {
      const memberId = subscription.metadata.member_id
      if (!memberId) return

      // Update subscription in database
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)

      // Update member subscription status
      const { data: plan } = await supabase
        .from('payment_plans')
        .select('tier')
        .eq('stripe_price_id_monthly', subscription.items.data[0].price.id)
        .or(`stripe_price_id_yearly.eq.${subscription.items.data[0].price.id}`)
        .single()

      if (plan) {
        await memberManagementService.updateSubscription(memberId, {
          tier: plan.tier,
          status: subscription.status,
          start_date: new Date(subscription.current_period_start * 1000).toISOString(),
          end_date: new Date(subscription.current_period_end * 1000).toISOString()
        })
      }
    } catch (error) {
      console.error('Error handling subscription update:', error)
    }
  }

  private async handleSubscriptionCancellation(subscription: any): Promise<void> {
    try {
      const memberId = subscription.metadata.member_id
      if (!memberId) return

      // Update subscription in database
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)

      // Update member status
      await memberManagementService.cancelSubscription(memberId, 'subscription_ended')
    } catch (error) {
      console.error('Error handling subscription cancellation:', error)
    }
  }

  private async handlePaymentSuccess(invoice: any): Promise<void> {
    try {
      const memberId = invoice.customer_metadata?.member_id
      if (!memberId) return

      // Update member total spent
      const { data: member } = await supabase
        .from('members')
        .select('total_spent')
        .eq('id', memberId)
        .single()

      if (member) {
        await supabase
          .from('members')
          .update({
            total_spent: (member.total_spent || 0) + (invoice.amount_paid / 100)
          })
          .eq('id', memberId)
      }

      // Log activity
      await memberManagementService.logMemberActivity(
        memberId,
        'payment',
        `Subscription payment of $${(invoice.amount_paid / 100).toFixed(2)} completed`,
        { invoice_id: invoice.id, amount: invoice.amount_paid / 100 }
      )
    } catch (error) {
      console.error('Error handling payment success:', error)
    }
  }

  private async handlePaymentFailure(invoice: any): Promise<void> {
    try {
      const memberId = invoice.customer_metadata?.member_id
      if (!memberId) return

      // Log activity
      await memberManagementService.logMemberActivity(
        memberId,
        'payment_failed',
        `Subscription payment of $${(invoice.amount_due / 100).toFixed(2)} failed`,
        { invoice_id: invoice.id, amount: invoice.amount_due / 100 }
      )

      // Send payment failure notification
      const member = await memberManagementService.getMember(memberId)
      if (member) {
        await memberManagementService.sendMemberEmail(memberId, 'payment_failed', {
          subject: 'Payment Failed - Action Required',
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <h1 style="color: #dc2626;">Payment Failed</h1>
              <p>Hi ${member.name},</p>
              <p>We were unable to process your subscription payment of $${(invoice.amount_due / 100).toFixed(2)}.</p>
              <p>Please update your payment method to continue your subscription.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-portal/billing" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Update Payment Method</a>
              </div>
            </div>
          `,
          text: `Payment Failed\n\nHi ${member.name},\n\nWe were unable to process your subscription payment...`
        })
      }
    } catch (error) {
      console.error('Error handling payment failure:', error)
    }
  }

  // Analytics and Reporting
  async getPaymentAnalytics(timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
    total_revenue: number
    total_transactions: number
    successful_payments: number
    failed_payments: number
    average_transaction_value: number
    revenue_by_plan: any
    monthly_recurring_revenue: number
  }> {
    try {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get payment transactions
      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())

      const totalRevenue = transactions?.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + t.amount, 0) || 0
      const totalTransactions = transactions?.length || 0
      const successfulPayments = transactions?.filter(t => t.status === 'succeeded').length || 0
      const failedPayments = transactions?.filter(t => t.status === 'failed').length || 0
      const averageTransactionValue = successfulPayments > 0 ? totalRevenue / successfulPayments : 0

      // Get active subscriptions for MRR calculation
      const { data: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select(`
          *,
          payment_plans(price_monthly, price_yearly)
        `)
        .eq('status', 'active')

      const monthlyRecurringRevenue = activeSubscriptions?.reduce((sum, sub) => {
        const plan = sub.payment_plans
        // Convert yearly to monthly for MRR calculation
        const monthlyValue = plan.price_yearly ? plan.price_yearly / 12 : plan.price_monthly
        return sum + monthlyValue
      }, 0) || 0

      return {
        total_revenue: totalRevenue,
        total_transactions: totalTransactions,
        successful_payments: successfulPayments,
        failed_payments: failedPayments,
        average_transaction_value: averageTransactionValue,
        revenue_by_plan: {}, // Would need more complex query
        monthly_recurring_revenue: monthlyRecurringRevenue
      }
    } catch (error) {
      console.error('Error getting payment analytics:', error)
      return {
        total_revenue: 0,
        total_transactions: 0,
        successful_payments: 0,
        failed_payments: 0,
        average_transaction_value: 0,
        revenue_by_plan: {},
        monthly_recurring_revenue: 0
      }
    }
  }
}

// Export singleton instance
export const paymentProcessingService = new PaymentProcessingService()

// Default payment plans
export const DefaultPaymentPlans = [
  {
    name: 'Basic Plan',
    tier: 'basic' as const,
    price_monthly: 29.99,
    price_yearly: 299.99,
    features: [
      'Real-time trading signals',
      'Basic market analysis',
      'Email notifications',
      'Discord access'
    ],
    is_active: true,
    trial_days: 7
  },
  {
    name: 'Premium Plan',
    tier: 'premium' as const,
    price_monthly: 79.99,
    price_yearly: 799.99,
    features: [
      'All Basic features',
      'Advanced analytics',
      'Priority support',
      'Custom alerts',
      'Portfolio tracking'
    ],
    is_active: true,
    trial_days: 14
  },
  {
    name: 'Enterprise Plan',
    tier: 'enterprise' as const,
    price_monthly: 199.99,
    price_yearly: 1999.99,
    features: [
      'All Premium features',
      'Dedicated account manager',
      'Custom integrations',
      'API access',
      'White-label options'
    ],
    is_active: true,
    trial_days: 30
  }
]
