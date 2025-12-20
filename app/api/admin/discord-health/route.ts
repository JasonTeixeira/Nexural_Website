import { NextResponse } from 'next/server'
import { checkDiscordBotHealth } from '@/lib/discord'

export async function GET() {
  try {
    const health = await checkDiscordBotHealth()
    
    return NextResponse.json({
      ...health,
      timestamp: new Date().toISOString(),
      environment_variables: {
        bot_token_set: !!process.env.DISCORD_BOT_TOKEN,
        guild_id_set: !!process.env.DISCORD_GUILD_ID,
        role_id_set: !!process.env.DISCORD_BASIC_ROLE_ID,
        channel_id_set: !!process.env.DISCORD_GENERAL_CHANNEL_ID,
        client_id_set: !!process.env.DISCORD_CLIENT_ID,
        client_secret_set: !!process.env.DISCORD_CLIENT_SECRET
      },
      configuration: {
        guild_id: process.env.DISCORD_GUILD_ID,
        role_id: process.env.DISCORD_BASIC_ROLE_ID,
        channel_id: process.env.DISCORD_GENERAL_CHANNEL_ID,
        client_id: process.env.DISCORD_CLIENT_ID
      }
    })
  } catch (error) {
    return NextResponse.json({
      botOnline: false,
      guildAccess: false,
      permissions: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      timestamp: new Date().toISOString(),
      environment_variables: {
        bot_token_set: !!process.env.DISCORD_BOT_TOKEN,
        guild_id_set: !!process.env.DISCORD_GUILD_ID,
        role_id_set: !!process.env.DISCORD_BASIC_ROLE_ID,
        channel_id_set: !!process.env.DISCORD_GENERAL_CHANNEL_ID
      }
    }, { status: 500 })
  }
}
