import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWaitlistConfirmationEmail } from '@/lib/email/resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, planName, fullName, referralSource } = await req.json()

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already on waitlist
    const { data: existingEntry } = await supabase
      .from('waitlist')
      .select('id, position')
      .eq('email', email.toLowerCase())
      .single()

    if (existingEntry) {
      return NextResponse.json(
        { 
          error: `You're already on the waitlist at position #${existingEntry.position}!`,
          alreadyOnWaitlist: true,
          position: existingEntry.position
        },
        { status: 409 }
      )
    }

    // Add to waitlist (position auto-assigned by trigger)
    const { data: newEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase(),
        name: fullName || null,
        plan: planName || 'OrderFlow Pro',
        referral_source: referralSource || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error adding to waitlist:', insertError)
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      )
    }

    // Send confirmation email (async, don't block response)
    sendWaitlistConfirmationEmail({
      email: email.toLowerCase(),
      name: fullName || undefined,
      position: newEntry.position,
      plan: planName || 'OrderFlow Pro'
    }).catch(error => {
      console.error('Failed to send waitlist confirmation email:', error)
      // Don't fail the signup if email fails
    })

    return NextResponse.json({ 
      success: true,
      message: 'Successfully joined the waitlist!',
      position: newEntry.position,
      plan: planName || 'OrderFlow Pro',
      expectedLaunch: 'Q3 2026',
      emailSent: true
    })

  } catch (error) {
    console.error('Error adding to waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get total waitlist count
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      message: 'OrderFlow Pro Waitlist API',
      totalSignups: count || 0,
      method: 'POST',
      fields: {
        required: ['email'],
        optional: ['planName', 'fullName', 'referralSource']
      },
      plan: 'OrderFlow Pro - $100/month',
      expectedLaunch: 'Q3 2026',
      description: 'Join the waitlist for priority access to OrderFlow Pro'
    })
  } catch (error) {
    return NextResponse.json({
      message: 'OrderFlow Pro Waitlist API',
      method: 'POST',
      fields: {
        required: ['email'],
        optional: ['planName', 'fullName', 'referralSource']
      }
    })
  }
}
