import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateEmail, sanitizeInput } from '@/lib/auth-middleware'
import { applyRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/rate-limiter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting first
    const rateLimit = await applyRateLimit(request, RATE_LIMITS.NEWSLETTER)
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.headers)
    }

    const { email, source = 'website' } = await request.json()

    // Enhanced email validation and sanitization
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const cleanEmail = sanitizeInput(email.toLowerCase().trim())
    const cleanSource = sanitizeInput(source || 'website')

    // Additional security: limit source field length
    if (cleanSource.length > 50) {
      return NextResponse.json(
        { error: 'Source field too long' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status')
      .eq('email', email.toLowerCase())
      .single()

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        )
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString(),
            source: source
          })
          .eq('email', email.toLowerCase())

        if (updateError) {
          console.error('Error reactivating subscription:', updateError)
          return NextResponse.json(
            { error: 'Failed to reactivate subscription' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully reactivated your newsletter subscription!'
        })
      }
    }

    // Create new subscription
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: email.toLowerCase(),
          status: 'active',
          source: source,
          subscribed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Error creating newsletter subscription:', error)
      return NextResponse.json(
        { error: 'Failed to subscribe to newsletter' },
        { status: 500 }
      )
    }

    // Send welcome email
    try {
      const { emailService } = await import('@/lib/email')
      await emailService.sendNewsletterWelcomeEmail({
        email: email.toLowerCase(),
        name: email.split('@')[0] // Use email username as fallback name
      })
      console.log(`✅ Welcome email sent to: ${email}`)
    } catch (emailError) {
      console.error('Warning: Welcome email failed to send:', emailError)
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      subscriber: data[0]
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to subscribe.' },
    { status: 405, headers: { 'Allow': 'POST' } }
  )
}
