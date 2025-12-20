import { NextResponse } from 'next/server'

/**
 * Discord Stats API Endpoint
 * Fetches real-time member count from Discord server
 * 
 * Setup Required:
 * 1. Create Discord bot at https://discord.com/developers/applications
 * 2. Add DISCORD_BOT_TOKEN to .env.local
 * 3. Add DISCORD_GUILD_ID to .env.local
 * 4. Invite bot to your server with read-only permissions
 */

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 minutes

interface DiscordGuild {
  approximate_member_count: number
  approximate_presence_count: number
}

interface DiscordStats {
  memberCount: number
  onlineCount: number
  lastUpdated: string
  error?: string
}

export async function GET() {
  const botToken = process.env.DISCORD_BOT_TOKEN
  const guildId = process.env.DISCORD_GUILD_ID

  // If Discord not configured, return placeholder
  if (!botToken || !guildId) {
    return NextResponse.json({
      memberCount: 0,
      onlineCount: 0,
      lastUpdated: new Date().toISOString(),
      error: 'Discord not configured. Add DISCORD_BOT_TOKEN and DISCORD_GUILD_ID to .env.local'
    } as DiscordStats)
  }

  try {
    // Fetch guild data from Discord API
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
      {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Discord API error:', response.status, error)
      
      return NextResponse.json({
        memberCount: 0,
        onlineCount: 0,
        lastUpdated: new Date().toISOString(),
        error: `Discord API error: ${response.status}`
      } as DiscordStats, { status: response.status })
    }

    const guild = await response.json() as DiscordGuild

    return NextResponse.json({
      memberCount: guild.approximate_member_count || 0,
      onlineCount: guild.approximate_presence_count || 0,
      lastUpdated: new Date().toISOString(),
    } as DiscordStats)

  } catch (error) {
    console.error('Failed to fetch Discord stats:', error)
    
    return NextResponse.json({
      memberCount: 0,
      onlineCount: 0,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    } as DiscordStats, { status: 500 })
  }
}
