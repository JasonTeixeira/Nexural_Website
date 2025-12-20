import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID || '1311075330756452352'
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
    
    if (!DISCORD_BOT_TOKEN) {
      console.warn('Discord bot token not configured')
      // Return 0 if not configured - be honest
      return NextResponse.json({ 
        memberCount: 0,
        approximateMemberCount: 0,
        error: 'Not configured'
      })
    }

    // Get guild info from Discord API
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}?with_counts=true`,
      {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      console.error('Discord API error:', response.status, response.statusText)
      return NextResponse.json({ 
        memberCount: 0,
        approximateMemberCount: 0,
        error: 'API error'
      })
    }

    const data = await response.json()
    
    return NextResponse.json({
      memberCount: data.approximate_member_count || 0,
      approximateMemberCount: data.approximate_member_count || 0,
      onlineCount: data.approximate_presence_count || 0
    })
  } catch (error) {
    console.error('Error fetching Discord member count:', error)
    return NextResponse.json({ 
      memberCount: 0,
      approximateMemberCount: 0,
      error: 'Failed to fetch'
    })
  }
}
