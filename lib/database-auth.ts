import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface AdminUser {
  id: number
  email: string
  name: string
  role: string
  is_active: boolean
  last_login?: string
  login_count: number
  failed_login_attempts: number
  is_locked: boolean
}

export interface SystemConfig {
  [key: string]: string | number | boolean
}

// Database-driven system configuration
class ConfigManager {
  private static instance: ConfigManager
  private configCache: SystemConfig = {}
  private lastCacheUpdate = 0
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  async getConfig(key: string, defaultValue?: any): Promise<any> {
    await this.refreshCacheIfNeeded()
    return this.configCache[key] ?? defaultValue
  }

  async getAllConfig(): Promise<SystemConfig> {
    await this.refreshCacheIfNeeded()
    return { ...this.configCache }
  }

  async setConfig(key: string, value: any, type: string = 'string'): Promise<void> {
    try {
      await supabase
        .from('system_config')
        .upsert({
          config_key: key,
          config_value: String(value),
          config_type: type,
          updated_at: new Date().toISOString()
        })

      // Update cache
      this.configCache[key] = this.parseConfigValue(String(value), type)
    } catch (error) {
      console.error('Error setting config:', error)
      throw error
    }
  }

  private async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now()
    if (now - this.lastCacheUpdate > this.cacheTimeout) {
      await this.refreshCache()
    }
  }

  private async refreshCache(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_key, config_value, config_type')

      if (error) throw error

      this.configCache = {}
      data?.forEach(config => {
        this.configCache[config.config_key] = this.parseConfigValue(
          config.config_value,
          config.config_type
        )
      })

      this.lastCacheUpdate = Date.now()
    } catch (error) {
      console.error('Error refreshing config cache:', error)
    }
  }

  private parseConfigValue(value: string, type: string): any {
    switch (type) {
      case 'number':
        return parseFloat(value)
      case 'boolean':
        return value.toLowerCase() === 'true'
      case 'json':
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      default:
        return value
    }
  }
}

export const configManager = ConfigManager.getInstance()

// Database-driven authentication
export class DatabaseAuth {
  private static jwtSecret: string | null = null

  static async getJWTSecret(): Promise<string> {
    if (!this.jwtSecret) {
      this.jwtSecret = await configManager.getConfig('JWT_SECRET', 'fallback-secret-key')
    }
    return this.jwtSecret || 'fallback-secret-key'
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  static async generateTokens(user: AdminUser): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const secret = await this.getJWTSecret()
    const expiresIn = (await configManager.getConfig('JWT_EXPIRES_IN', '24h')) as string | number
    const refreshExpiresIn = (await configManager.getConfig('JWT_REFRESH_EXPIRES_IN', '7d')) as string | number

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }

    const accessToken = jwt.sign(payload, secret, { expiresIn } as SignOptions)
    const refreshToken = jwt.sign({ id: user.id }, secret, { expiresIn: refreshExpiresIn } as SignOptions)

    // Store tokens in database
    const accessTokenHash = await bcrypt.hash(accessToken, 10)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

    await supabase.from('admin_tokens').insert([
      {
        user_id: user.id,
        token_hash: accessTokenHash,
        token_type: 'access',
        expires_at: new Date(Date.now() + this.parseTimeToMs(expiresIn)).toISOString()
      },
      {
        user_id: user.id,
        token_hash: refreshTokenHash,
        token_type: 'refresh',
        expires_at: new Date(Date.now() + this.parseTimeToMs(refreshExpiresIn)).toISOString()
      }
    ])

    return { accessToken, refreshToken }
  }

  static async verifyToken(token: string): Promise<AdminUser | null> {
    try {
      const secret = await this.getJWTSecret()
      const decoded = jwt.verify(token, secret) as any

      // Check if token is revoked
      const { data: tokenData } = await supabase
        .from('admin_tokens')
        .select('is_revoked, expires_at')
        .eq('user_id', decoded.id)
        .eq('token_type', 'access')
        .gte('expires_at', new Date().toISOString())
        .eq('is_revoked', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!tokenData) return null

      // Get user data
      const { data: userData } = await supabase
        .from('admin_users_safe')
        .select('*')
        .eq('id', decoded.id)
        .eq('is_active', true)
        .single()

      return userData
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  static async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
    success: boolean
    user?: AdminUser
    tokens?: { accessToken: string; refreshToken: string }
    error?: string
  }> {
    try {
      // Get user from database
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Check if account is locked
      if (userData.locked_until && new Date(userData.locked_until) > new Date()) {
        return { success: false, error: 'Account is temporarily locked' }
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, userData.password_hash)

      if (!isValidPassword) {
        // Increment failed attempts
        await supabase
          .from('admin_users')
          .update({
            failed_login_attempts: userData.failed_login_attempts + 1,
            locked_until: userData.failed_login_attempts >= 4 
              ? new Date(Date.now() + 30 * 60 * 1000).toISOString() // Lock for 30 minutes
              : null
          })
          .eq('id', userData.id)

        return { success: false, error: 'Invalid credentials' }
      }

      // Reset failed attempts and update login info
      await supabase
        .from('admin_users')
        .update({
          failed_login_attempts: 0,
          locked_until: null,
          last_login: new Date().toISOString(),
          login_count: userData.login_count + 1
        })
        .eq('id', userData.id)

      // Generate tokens
      const user: AdminUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        is_active: userData.is_active,
        last_login: userData.last_login,
        login_count: userData.login_count,
        failed_login_attempts: 0,
        is_locked: false
      }

      const tokens = await this.generateTokens(user)

      return { success: true, user, tokens }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  static async logout(userId: number): Promise<void> {
    // Revoke all tokens for user
    await supabase
      .from('admin_tokens')
      .update({ is_revoked: true })
      .eq('user_id', userId)
  }

  static async revokeToken(token: string): Promise<void> {
    try {
      const secret = await this.getJWTSecret()
      const decoded = jwt.verify(token, secret) as any
      
      await supabase
        .from('admin_tokens')
        .update({ is_revoked: true })
        .eq('user_id', decoded.id)
    } catch (error) {
      console.error('Error revoking token:', error)
    }
  }

  private static parseTimeToMs(timeString: string | number): number {
    // If it's already a number (milliseconds), return it
    if (typeof timeString === 'number') {
      return timeString
    }

    const units: { [key: string]: number } = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    }

    const match = String(timeString).match(/^(\d+)([smhd])$/)
    if (!match) return 24 * 60 * 60 * 1000 // Default to 24 hours

    const [, amount, unit] = match
    return parseInt(amount) * (units[unit] || units.h)
  }
}

// Database-driven Discord webhook management
export class DiscordWebhookManager {
  private static webhookCache: { [key: string]: any } = {}
  private static lastCacheUpdate = 0
  private static cacheTimeout = 5 * 60 * 1000 // 5 minutes

  static async getWebhook(channelName: string): Promise<{
    url: string
    isActive: boolean
    retryAttempts: number
  } | null> {
    await this.refreshCacheIfNeeded()
    return this.webhookCache[channelName] || null
  }

  static async getAllWebhooks(): Promise<any[]> {
    const { data, error } = await supabase
      .from('discord_webhooks')
      .select('*')
      .eq('is_active', true)
      .order('channel_name')

    if (error) {
      console.error('Error fetching webhooks:', error)
      return []
    }

    return data || []
  }

  static async updateWebhookStats(channelName: string, success: boolean): Promise<void> {
    if (success) {
      // Update success count and last used timestamp
      const { data: currentData } = await supabase
        .from('discord_webhooks')
        .select('success_count')
        .eq('channel_name', channelName)
        .single()

      await supabase
        .from('discord_webhooks')
        .update({
          success_count: (currentData?.success_count || 0) + 1,
          last_used: new Date().toISOString()
        })
        .eq('channel_name', channelName)
    } else {
      // Update failure count
      const { data: currentData } = await supabase
        .from('discord_webhooks')
        .select('failure_count')
        .eq('channel_name', channelName)
        .single()

      await supabase
        .from('discord_webhooks')
        .update({
          failure_count: (currentData?.failure_count || 0) + 1
        })
        .eq('channel_name', channelName)
    }
  }

  static async sendWebhook(channelName: string, message: any): Promise<boolean> {
    const webhook = await this.getWebhook(channelName)
    if (!webhook || !webhook.isActive) {
      console.error(`Webhook not found or inactive: ${channelName}`)
      return false
    }

    let attempts = 0
    const maxAttempts = webhook.retryAttempts || 3
    const retryDelay = await configManager.getConfig('DISCORD_RETRY_DELAY', 1000)

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        })

        if (response.ok) {
          await this.updateWebhookStats(channelName, true)
          return true
        }

        attempts++
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts))
        }
      } catch (error) {
        console.error(`Discord webhook error (attempt ${attempts + 1}):`, error)
        attempts++
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts))
        }
      }
    }

    await this.updateWebhookStats(channelName, false)
    return false
  }

  private static async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now()
    if (now - this.lastCacheUpdate > this.cacheTimeout) {
      await this.refreshCache()
    }
  }

  private static async refreshCache(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('discord_webhooks')
        .select('channel_name, webhook_url, is_active, retry_attempts')

      if (error) throw error

      this.webhookCache = {}
      data?.forEach(webhook => {
        this.webhookCache[webhook.channel_name] = {
          url: webhook.webhook_url,
          isActive: webhook.is_active,
          retryAttempts: webhook.retry_attempts
        }
      })

      this.lastCacheUpdate = Date.now()
    } catch (error) {
      console.error('Error refreshing webhook cache:', error)
    }
  }
}

// Utility functions
export async function isAdminAuthenticated(token?: string): Promise<boolean> {
  if (!token) return false
  const user = await DatabaseAuth.verifyToken(token)
  return user !== null
}

export async function getAdminUser(token: string): Promise<AdminUser | null> {
  return await DatabaseAuth.verifyToken(token)
}

export async function logoutAdmin(token: string): Promise<void> {
  const user = await DatabaseAuth.verifyToken(token)
  if (user) {
    await DatabaseAuth.logout(user.id)
  }
}

// Export instances
export const discordWebhookManager = DiscordWebhookManager
