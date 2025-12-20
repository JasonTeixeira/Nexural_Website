const DISCORD_API_BASE = "https://discord.com/api/v10"

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  email?: string
  avatar?: string
}

export class DiscordAPI {
  private botToken: string
  private guildId: string

  constructor() {
    this.botToken = process.env.DISCORD_BOT_TOKEN!
    this.guildId = process.env.DISCORD_GUILD_ID!
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bot ${this.botToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async addUserToGuild(guildId: string, userId: string, accessToken: string, roleIds: string[] = []) {
    try {
      const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bot ${this.botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
          roles: roleIds,
        }),
      })

      if (response.status === 201 || response.status === 204) {
        return true
      }

      console.error("Failed to add user to guild:", response.status, await response.text())
      return false
    } catch (error) {
      console.error("Error adding user to guild:", error)
      return false
    }
  }

  async removeUserFromGuild(guildId: string, userId: string) {
    try {
      await this.makeRequest(`/guilds/${guildId}/members/${userId}`, {
        method: "DELETE",
      })
      return true
    } catch (error) {
      console.error("Error removing user from guild:", error)
      return false
    }
  }

  async createInvite(channelId: string, maxAge = 86400) {
    try {
      const invite = await this.makeRequest(`/channels/${channelId}/invites`, {
        method: "POST",
        body: JSON.stringify({
          max_age: maxAge,
          max_uses: 1,
          unique: true,
        }),
      })
      return `https://discord.gg/${invite.code}`
    } catch (error) {
      console.error("Error creating invite:", error)
      return null
    }
  }

  getRoleIdForPlan(planName = "basic"): string {
    // For single plan, always return the basic subscriber role
    return process.env.DISCORD_BASIC_ROLE_ID!
  }

  getChannelIdForPlan(planName = "basic"): string {
    // For single plan, always return the general channel
    return process.env.DISCORD_GENERAL_CHANNEL_ID!
  }

  async addRoleToUser(userId: string, roleId: string, retries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${DISCORD_API_BASE}/guilds/${this.guildId}/members/${userId}/roles/${roleId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bot ${this.botToken}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          console.log(`Successfully added role ${roleId} to user ${userId}`)
          return true
        }

        if (response.status === 404) {
          console.error(`User ${userId} not found in guild`)
          return false
        }

        if (response.status === 403) {
          console.error(`Bot lacks permission to assign role ${roleId}`)
          return false
        }

        console.warn(`Attempt ${attempt} failed: ${response.status} ${response.statusText}`)

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      } catch (error) {
        console.error(`Attempt ${attempt} error:`, error)
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    console.error(`Failed to add role ${roleId} to user ${userId} after ${retries} attempts`)
    return false
  }

  async removeRoleFromUser(userId: string, roleId: string, retries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${DISCORD_API_BASE}/guilds/${this.guildId}/members/${userId}/roles/${roleId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bot ${this.botToken}`,
          },
        })

        if (response.ok || response.status === 404) {
          console.log(`Successfully removed role ${roleId} from user ${userId}`)
          return true
        }

        console.warn(`Attempt ${attempt} failed: ${response.status} ${response.statusText}`)

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      } catch (error) {
        console.error(`Attempt ${attempt} error:`, error)
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    console.error(`Failed to remove role ${roleId} from user ${userId} after ${retries} attempts`)
    return false
  }

  async getUserInfo(userId: string) {
    try {
      const member = await this.makeRequest(`/guilds/${this.guildId}/members/${userId}`)
      return {
        id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator,
        roles: member.roles,
        joinedAt: member.joined_at,
        nickname: member.nick,
      }
    } catch (error) {
      console.error(`Error getting user info for ${userId}:`, error)
      return null
    }
  }

  async isUserInGuild(userId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/guilds/${this.guildId}/members/${userId}`)
      return true
    } catch (error) {
      return false
    }
  }

  async removeAllSubscriptionRoles(userId: string): Promise<boolean> {
    const roleIds = [
      process.env.DISCORD_BASIC_ROLE_ID!,
      process.env.DISCORD_PRO_ROLE_ID!,
      process.env.DISCORD_ELITE_ROLE_ID!,
    ].filter(Boolean)

    let success = true
    for (const roleId of roleIds) {
      const result = await this.removeRoleFromUser(userId, roleId)
      if (!result) success = false
    }

    return success
  }

  async grantSubscriberAccess(userId: string): Promise<boolean> {
    try {
      const roleId = this.getRoleIdForPlan()
      return await this.addRoleToUser(userId, roleId)
    } catch (error) {
      console.error(`Error granting subscriber access for ${userId}:`, error)
      return false
    }
  }

  async revokeSubscriberAccess(userId: string): Promise<boolean> {
    try {
      const roleId = this.getRoleIdForPlan()
      return await this.removeRoleFromUser(userId, roleId)
    } catch (error) {
      console.error(`Error revoking subscriber access for ${userId}:`, error)
      return false
    }
  }

  async sendMessage(channelId: string, content: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: content
        }),
      })
      
      console.log(`Message sent to channel ${channelId}`)
      return true
    } catch (error) {
      console.error(`Error sending message to channel ${channelId}:`, error)
      return false
    }
  }

  async sendRichEmbed(channelId: string, embedData: any): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify(embedData),
      })
      
      console.log(`Rich embed sent to channel ${channelId}`)
      return true
    } catch (error) {
      console.error(`Error sending rich embed to channel ${channelId}:`, error)
      return false
    }
  }
}

export async function checkDiscordBotHealth(): Promise<{
  botOnline: boolean
  guildAccess: boolean
  permissions: string[]
  errors: string[]
}> {
  const errors: string[] = []
  let botOnline = false
  let guildAccess = false
  const permissions: string[] = []

  try {
    // Check if bot is online
    const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (response.ok) {
      botOnline = true
    } else {
      errors.push(`Bot authentication failed: ${response.status}`)
    }

    // Check guild access
    const guildResponse = await fetch(`${DISCORD_API_BASE}/guilds/${process.env.DISCORD_GUILD_ID}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (guildResponse.ok) {
      guildAccess = true

      // Check bot permissions in guild
      const botMember = await fetch(`${DISCORD_API_BASE}/guilds/${process.env.DISCORD_GUILD_ID}/members/@me`, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      })

      if (botMember.ok) {
        const memberData = await botMember.json()
        permissions.push(...memberData.roles)
      }
    } else {
      errors.push(`Guild access failed: ${guildResponse.status}`)
    }
  } catch (error) {
    errors.push(`Health check error: ${error}`)
  }

  return {
    botOnline,
    guildAccess,
    permissions,
    errors,
  }
}

export const discordAPI = new DiscordAPI()

// OAuth functions
export function getDiscordOAuthURL(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`,
    response_type: "code",
    scope: "identify email guilds.join",
    state,
  })

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
} | null> {
  try {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to exchange code for token")
    }

    return await response.json()
  } catch (error) {
    console.error("Error exchanging code for token:", error)
    return null
  }
}

export async function getDiscordUser(accessToken: string): Promise<DiscordUser | null> {
  try {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get Discord user")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting Discord user:", error)
    return null
  }
}
