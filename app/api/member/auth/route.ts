import { NextRequest, NextResponse } from 'next/server'
import { generateMemberToken, Member } from '@/lib/member-auth'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Rate limiting for login attempts
const LOGIN_ATTEMPTS = new Map<string, { attempts: number, lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const { action, email, name, sessionId } = await req.json()
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    if (action === 'register') {
      return await handleRegistration(email, name, sessionId, clientIP)
    } else if (action === 'login') {
      return await handleLogin(email, clientIP)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Member auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

async function handleRegistration(email: string, name: string, sessionId: string, clientIP: string) {
  if (!email || !sessionId) {
    return NextResponse.json({ error: 'Email and session ID required' }, { status: 400 })
  }

  try {
    // Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const customerEmail = session.customer_details?.email || session.metadata?.customer_email
    if (customerEmail !== email) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 400 })
    }

    // Get subscription details
    const subscriptionId = session.subscription as string
    let subscriptionStatus = 'active'
    let discordAccess = true

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      subscriptionStatus = subscription.status
      discordAccess = subscription.status === 'active'
    }

    // Create member in database
    const { data: member, error } = await supabase
      .from('members')
      .insert([
        {
          email: email,
          name: name || email.split('@')[0],
          stripe_customer_id: session.customer as string,
          subscription_id: subscriptionId,
          subscription_status: subscriptionStatus,
          discord_access: discordAccess
        }
      ])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Member already exists' }, { status: 409 })
      }
      console.error('Database error creating member:', error)
      return NextResponse.json({ error: 'Failed to create member account' }, { status: 500 })
    }

    // Convert database format to Member interface
    const memberData: Member = {
      id: member.id,
      email: member.email,
      name: member.name,
      subscriptionId: member.subscription_id,
      subscriptionStatus: member.subscription_status as any,
      discordAccess: member.discord_access,
      joinedAt: member.joined_at
    }

    const token = generateMemberToken(memberData)

    console.log(`New member registered: ${email} with subscription: ${subscriptionId}`)

    return NextResponse.json({
      success: true,
      token,
      member: memberData,
      discordInvite: process.env.DISCORD_INVITE_URL!
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}

async function handleLogin(email: string, clientIP: string) {
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  // Rate limiting check
  const attemptKey = `${clientIP}-${email}`
  const now = Date.now()
  const attempts = LOGIN_ATTEMPTS.get(attemptKey)
  
  if (attempts && attempts.attempts >= MAX_ATTEMPTS && (now - attempts.lastAttempt) < RATE_LIMIT_WINDOW) {
    const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - attempts.lastAttempt)) / 60000)
    return NextResponse.json({
      error: `Too many login attempts. Try again in ${remainingTime} minutes.`
    }, { status: 429 })
  }

  try {
    // Get member from database
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !member) {
      // Update rate limiting
      const current = LOGIN_ATTEMPTS.get(attemptKey) || { attempts: 0, lastAttempt: 0 }
      LOGIN_ATTEMPTS.set(attemptKey, { attempts: current.attempts + 1, lastAttempt: now })
      
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Update member subscription status from Stripe
    let updatedMember = member
    if (member.subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(member.subscription_id)
        const newStatus = subscription.status
        const newDiscordAccess = subscription.status === 'active'

        // Update in database if status changed
        if (newStatus !== member.subscription_status || newDiscordAccess !== member.discord_access) {
          const { data: updated, error: updateError } = await supabase
            .from('members')
            .update({
              subscription_status: newStatus,
              discord_access: newDiscordAccess,
              updated_at: new Date().toISOString()
            })
            .eq('email', email)
            .select()
            .single()

          if (!updateError && updated) {
            updatedMember = updated
          }
        }
      } catch (error) {
        console.error('Error updating subscription status:', error)
      }
    }

    // Clear rate limiting on successful login
    LOGIN_ATTEMPTS.delete(attemptKey)

    // Convert database format to Member interface
    const memberData: Member = {
      id: updatedMember.id,
      email: updatedMember.email,
      name: updatedMember.name,
      subscriptionId: updatedMember.subscription_id,
      subscriptionStatus: updatedMember.subscription_status as any,
      discordAccess: updatedMember.discord_access,
      joinedAt: updatedMember.joined_at
    }

    const token = generateMemberToken(memberData)

    console.log(`Member login: ${email}`)

    return NextResponse.json({
      success: true,
      token,
      member: memberData,
      discordInvite: memberData.discordAccess ? (process.env.DISCORD_INVITE_URL || 'https://discord.gg/your-server') : null
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

// Get member by email (for admin use)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Update subscription status from Stripe
    let updatedMember = member
    if (member.subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(member.subscription_id)
        const newStatus = subscription.status
        const newDiscordAccess = subscription.status === 'active'

        if (newStatus !== member.subscription_status || newDiscordAccess !== member.discord_access) {
          const { data: updated, error: updateError } = await supabase
            .from('members')
            .update({
              subscription_status: newStatus,
              discord_access: newDiscordAccess,
              updated_at: new Date().toISOString()
            })
            .eq('email', email)
            .select()
            .single()

          if (!updateError && updated) {
            updatedMember = updated
          }
        }
      } catch (error) {
        console.error('Error updating subscription status:', error)
      }
    }

    // Convert database format to Member interface
    const memberData: Member = {
      id: updatedMember.id,
      email: updatedMember.email,
      name: updatedMember.name,
      subscriptionId: updatedMember.subscription_id,
      subscriptionStatus: updatedMember.subscription_status as any,
      discordAccess: updatedMember.discord_access,
      joinedAt: updatedMember.joined_at
    }

    return NextResponse.json({ member: memberData })

  } catch (error) {
    console.error('Get member error:', error)
    return NextResponse.json({ error: 'Failed to get member' }, { status: 500 })
  }
}

// Update member subscription status (called by webhooks)
export async function PUT(req: NextRequest) {
  try {
    const { email, subscriptionId, subscriptionStatus, discordAccess } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }
    if (subscriptionId !== undefined) updateData.subscription_id = subscriptionId
    if (subscriptionStatus !== undefined) updateData.subscription_status = subscriptionStatus
    if (discordAccess !== undefined) updateData.discord_access = discordAccess

    const { data: member, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('email', email)
      .select()
      .single()

    if (error || !member) {
      return NextResponse.json({ error: 'Member not found or update failed' }, { status: 404 })
    }

    // Convert database format to Member interface
    const memberData: Member = {
      id: member.id,
      email: member.email,
      name: member.name,
      subscriptionId: member.subscription_id,
      subscriptionStatus: member.subscription_status as any,
      discordAccess: member.discord_access,
      joinedAt: member.joined_at
    }

    console.log(`Updated member: ${email} - Status: ${subscriptionStatus}, Discord: ${discordAccess}`)

    return NextResponse.json({ success: true, member: memberData })
  } catch (error) {
    console.error('Member update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
