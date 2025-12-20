import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || ''
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ''
const DISCORD_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`
  : 'http://localhost:3036/api/auth/discord/callback'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('Discord OAuth error:', error)
    return NextResponse.redirect(
      new URL('/member-portal/dashboard?discord_error=access_denied', request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/member-portal/dashboard?discord_error=no_code', request.url)
    )
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get Discord user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch Discord user info')
    }

    const discordUser = await userResponse.json()

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/member-login?discord_error=not_authenticated', request.url)
      )
    }

    // Update member record with Discord info
    const { error: updateError } = await supabase
      .from('members')
      .update({
        discord_user_id: discordUser.id,
        discord_username: `${discordUser.username}#${discordUser.discriminator}`,
        discord_connected: true,
      })
      .eq('email', user.email)

    if (updateError) {
      console.error('Error updating member Discord info:', updateError)
      throw updateError
    }

    // Optional: Add user to Discord server
    if (process.env.DISCORD_GUILD_ID && process.env.DISCORD_BOT_TOKEN) {
      try {
        await fetch(
          `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordUser.id}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: accessToken,
            }),
          }
        )
      } catch (guildError) {
        console.error('Error adding user to Discord server:', guildError)
        // Don't fail the whole flow if guild add fails
      }
    }

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      new URL('/member-portal/dashboard?discord_connected=true', request.url)
    )
  } catch (error) {
    console.error('Discord OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/member-portal/dashboard?discord_error=connection_failed', request.url)
    )
  }
}
