import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { email, planName, billingCycle } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Define plan configurations
    const planConfigs = {
      'wealth-builder': {
        name: '80/20 Wealth Builder',
        description: 'Complete wealth building education with 80% investing + 20% trading + community',
        monthlyPrice: 3000, // $30.00 in cents
        annualPrice: 30000, // $300.00 in cents (17% discount)
        features: [
          '80% Strategic Investing guidance',
          '20% Day Trading education', 
          'Live Discord Community (1,000+ members)',
          'Daily market analysis & insights',
          'Weekly educational webinars',
          'Risk management training',
          'Portfolio allocation strategies',
          'Real-time investment alerts',
          'Beginner-friendly learning path',
          '24/7 community support'
        ]
      },
      'automation-futures': {
        name: 'Automation for Futures',
        description: 'Advanced automated futures trading system with AI-powered execution',
        monthlyPrice: 6500, // $65.00 in cents
        annualPrice: 65000, // $650.00 in cents (17% discount)
        features: [
          'Everything in 80/20 Wealth Builder',
          'Automated futures trading system',
          'AI-powered trade execution',
          'Advanced algorithmic strategies',
          'Real-time market scanning',
          'Automated risk management',
          'Custom trading parameters',
          'Professional trading dashboard',
          'Priority community access',
          '1-on-1 strategy consultations',
          'Advanced performance analytics',
          'Institutional-grade tools'
        ]
      }
    }

    // Default to wealth-builder plan
    const selectedPlan = planConfigs[planName as keyof typeof planConfigs] || planConfigs['wealth-builder']
    const isAnnual = billingCycle === 'annual'
    const price = isAnnual ? selectedPlan.annualPrice : selectedPlan.monthlyPrice

    // Create or retrieve customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          source: 'nexural_trading_website',
          plan_type: planName || 'wealth-builder'
        }
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
              images: ['https://nexural.com/logo.png'], // Update with your actual logo URL
              metadata: {
                plan_type: planName || 'wealth-builder',
                billing_cycle: billingCycle || 'monthly'
              }
            },
            unit_amount: price,
            recurring: {
              interval: isAnnual ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin') || 'http://localhost:3002'}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planName || 'wealth-builder'}`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:3002'}/pricing`,
      metadata: {
        customer_email: email,
        plan_name: planName || 'wealth-builder',
        billing_cycle: billingCycle || 'monthly',
        plan_display_name: selectedPlan.name
      },
      subscription_data: {
        metadata: {
          customer_email: email,
          plan_name: planName || 'wealth-builder',
          billing_cycle: billingCycle || 'monthly',
          plan_display_name: selectedPlan.name
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        name: 'auto'
      }
    })

    return NextResponse.json({ 
      sessionId: session.id,
      planName: selectedPlan.name,
      price: price / 100, // Convert back to dollars for display
      billingCycle: billingCycle || 'monthly'
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe Checkout Session API',
    method: 'POST',
    fields: ['email', 'planName']
  })
}
