import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail, sendDiscordInviteEmail, EMAIL_CONFIG } from '@/lib/email/resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, name, acceptedTerms, acceptedPrivacy } = await req.json()

    // Validate required fields
    if (!email || !acceptedTerms || !acceptedPrivacy) {
      return NextResponse.json(
        { error: 'Email and terms acceptance are required' },
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

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('members')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'Email already registered. Check your inbox for Discord invite.',
          alreadyRegistered: true 
        },
        { status: 409 }
      )
    }

    // Create free account
    const { data: newUser, error: createError } = await supabase
      .from('members')
      .insert({
        email: email.toLowerCase(),
        name: name || null,
        tier: 'free',
        accepted_terms: true,
        accepted_privacy: true,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    // Send welcome email (async, don't block response)
    sendWelcomeEmail({
      email: email.toLowerCase(),
      name: name || undefined
    }).catch(error => {
      console.error('Failed to send welcome email:', error)
    })

    // Send Discord invite email after 30 seconds
    setTimeout(() => {
      sendDiscordInviteEmail({
        email: email.toLowerCase(),
        name: name || undefined,
        discordInviteUrl: EMAIL_CONFIG.discordInviteUrl
      }).catch(error => {
        console.error('Failed to send Discord invite email:', error)
      })
    }, 30000)

    return NextResponse.json({
      success: true,
      message: 'Account created! Check your email for Discord invite.',
      userId: newUser.id,
      emailSent: true
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
