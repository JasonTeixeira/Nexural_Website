import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_error`)
  }

  if (!code) {
    // Redirect to Discord OAuth
    const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize')
    discordAuthUrl.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID!)
    discordAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord`)
    discordAuthUrl.searchParams.set('response_type', 'code')
    discordAuthUrl.searchParams.set('scope', 'identify email')

    return NextResponse.redirect(discordAuthUrl.toString())
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=token_error`)
    }

    // Get user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const discordUser = await userResponse.json()

    if (!discordUser.email) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_email`)
    }

    // Check if user exists in our database
    const { data: existingUser, error: userError } = await supabase
      .from('members')
      .select('*')
      .eq('email', discordUser.email.toLowerCase())
      .single()

    let user = existingUser

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create new user
      const { data: newUser, error: createError } = await supabase
        .from('members')
        .insert({
          email: discordUser.email.toLowerCase(),
          name: discordUser.global_name || discordUser.username || discordUser.email.split('@')[0],
          discord_id: discordUser.id,
          subscription_status: 'trial', // Give new users a trial
          subscription_tier: 'basic',
          auth_provider: 'discord',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          discord_access: true
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=create_user_error`)
      }

      user = newUser
    } else if (userError) {
      console.error('Database error:', userError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=database_error`)
    } else {
      // Update existing user's Discord ID and last login
      await supabase
        .from('members')
        .update({ 
          discord_id: discordUser.id,
          last_login: new Date().toISOString(),
          auth_provider: 'discord',
          discord_access: true
        })
        .eq('id', user.id)
    }

    // Check subscription status - allow trial and active users
    if (user.subscription_status !== 'active' && user.subscription_status !== 'trial' && user.subscription_status !== 'trialing') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscribe?expired=true`)
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        subscriptionStatus: user.subscription_status,
        subscriptionTier: user.subscription_tier
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Redirect to dashboard with token
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)
    response.cookies.set('member_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('Discord OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_error`)
  }
}
