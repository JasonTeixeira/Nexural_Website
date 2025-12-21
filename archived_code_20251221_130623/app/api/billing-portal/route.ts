import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { verifyMemberToken } from '@/lib/member-auth'

export async function POST(req: NextRequest) {
  try {
    // Verify member authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const member = verifyMemberToken(token)
    
    if (!member) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!member.subscriptionId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
    }

    // Get the subscription to find the customer ID
    const subscription = await stripe.subscriptions.retrieve(member.subscriptionId)
    const customerId = subscription.customer as string

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.get('origin')}/dashboard`,
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe Billing Portal API',
    method: 'POST',
    authentication: 'Bearer token required',
    description: 'Creates a Stripe billing portal session for subscription management'
  })
}
