import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { tier, customerId, email } = await req.json()

    const priceIds = {
      basic: process.env.STRIPE_BASIC_PRICE_ID!,
      premium: process.env.STRIPE_PREMIUM_PRICE_ID!,
      pro: process.env.STRIPE_PRO_PRICE_ID!
    }

    const priceId = priceIds[tier as keyof typeof priceIds]

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/member-portal/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/member-portal/subscription?canceled=true`,
      metadata: {
        tier,
        customer_email: email
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
