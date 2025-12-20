import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user settings
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(`
        id,
        email,
        name,
        discord_id,
        discord_username,
        subscription_tier,
        subscription_status,
        referral_code,
        notification_preferences,
        timezone,
        created_at
      `)
      .eq('id', decoded.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      settings: {
        profile: {
          name: member.name,
          email: member.email,
          discord_username: member.discord_username,
          discord_id: member.discord_id,
          timezone: member.timezone || 'America/New_York'
        },
        subscription: {
          tier: member.subscription_tier,
          status: member.subscription_status
        },
        referral: {
          code: member.referral_code
        },
        notifications: member.notification_preferences || {
          email_signals: true,
          email_updates: true,
          discord_signals: true,
          discord_updates: true,
          sms_enabled: false
        },
        account: {
          created_at: member.created_at
        }
      }
    })

  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { profile, notifications } = body

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    // Update profile fields if provided
    if (profile) {
      if (profile.name !== undefined) updates.name = profile.name
      if (profile.timezone !== undefined) updates.timezone = profile.timezone
      // Note: email and discord fields typically shouldn't be updated directly
    }

    // Update notification preferences if provided
    if (notifications) {
      updates.notification_preferences = notifications
    }

    // Perform update
    const { data: updatedMember, error: updateError } = await supabase
      .from('members')
      .update(updates)
      .eq('id', decoded.id)
      .select(`
        id,
        email,
        name,
        discord_username,
        subscription_tier,
        subscription_status,
        referral_code,
        notification_preferences,
        timezone,
        updated_at
      `)
      .single()

    if (updateError || !updatedMember) {
      console.error('Settings update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        profile: {
          name: updatedMember.name,
          email: updatedMember.email,
          discord_username: updatedMember.discord_username,
          timezone: updatedMember.timezone || 'America/New_York'
        },
        subscription: {
          tier: updatedMember.subscription_tier,
          status: updatedMember.subscription_status
        },
        referral: {
          code: updatedMember.referral_code
        },
        notifications: updatedMember.notification_preferences || {
          email_signals: true,
          email_updates: true,
          discord_signals: true,
          discord_updates: true,
          sms_enabled: false
        },
        updated_at: updatedMember.updated_at
      }
    })

  } catch (error) {
    console.error('Settings PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
