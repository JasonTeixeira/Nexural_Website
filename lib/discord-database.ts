import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface DiscordUser {
  id?: number
  email: string
  discord_user_id: string
  discord_username?: string
  discord_discriminator?: string
  stripe_customer_id?: string
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
  subscription_id?: string
  plan_name: string
  joined_at?: string
  updated_at?: string
  last_role_update?: string
  role_assignment_status: 'pending' | 'granted' | 'revoked' | 'failed'
}

/**
 * Get Discord user ID by email address
 */
export async function getDiscordUserIdByEmail(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('discord_users')
      .select('discord_user_id')
      .eq('email', email)
      .eq('subscription_status', 'active')
      .single()

    if (error) {
      console.log(`No Discord user found for email: ${email}`)
      return null
    }

    return data?.discord_user_id || null
  } catch (error) {
    console.error('Error getting Discord user ID by email:', error)
    return null
  }
}

/**
 * Update subscription status for a user
 */
export async function updateSubscriptionStatus(
  email: string, 
  status: 'active' | 'inactive' | 'cancelled' | 'past_due', 
  subscriptionId: string,
  stripeCustomerId?: string
): Promise<boolean> {
  try {
    const updateData: any = {
      subscription_status: status,
      subscription_id: subscriptionId,
      updated_at: new Date().toISOString()
    }

    if (stripeCustomerId) {
      updateData.stripe_customer_id = stripeCustomerId
    }

    const { error } = await supabase
      .from('discord_users')
      .update(updateData)
      .eq('email', email)

    if (error) {
      console.error('Error updating subscription status:', error)
      return false
    }

    console.log(`✅ Updated subscription status for ${email}: ${status}`)
    return true
  } catch (error) {
    console.error('Error updating subscription status:', error)
    return false
  }
}

/**
 * Update role assignment status
 */
export async function updateRoleAssignmentStatus(
  discordUserId: string,
  status: 'pending' | 'granted' | 'revoked' | 'failed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('discord_users')
      .update({
        role_assignment_status: status,
        last_role_update: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('discord_user_id', discordUserId)

    if (error) {
      console.error('Error updating role assignment status:', error)
      return false
    }

    console.log(`✅ Updated role assignment status for ${discordUserId}: ${status}`)
    return true
  } catch (error) {
    console.error('Error updating role assignment status:', error)
    return false
  }
}

/**
 * Create or update Discord user record
 */
export async function upsertDiscordUser(userData: Partial<DiscordUser>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('discord_users')
      .upsert(userData, {
        onConflict: 'discord_user_id'
      })

    if (error) {
      console.error('Error upserting Discord user:', error)
      return false
    }

    console.log(`✅ Upserted Discord user: ${userData.email}`)
    return true
  } catch (error) {
    console.error('Error upserting Discord user:', error)
    return false
  }
}

/**
 * Get Discord user by Discord ID
 */
export async function getDiscordUserById(discordUserId: string): Promise<DiscordUser | null> {
  try {
    const { data, error } = await supabase
      .from('discord_users')
      .select('*')
      .eq('discord_user_id', discordUserId)
      .single()

    if (error) {
      console.log(`No Discord user found for ID: ${discordUserId}`)
      return null
    }

    return data as DiscordUser
  } catch (error) {
    console.error('Error getting Discord user by ID:', error)
    return null
  }
}

/**
 * Get all active subscribers for Discord role management
 */
export async function getActiveSubscribers(): Promise<DiscordUser[]> {
  try {
    const { data, error } = await supabase
      .from('discord_users')
      .select('*')
      .eq('subscription_status', 'active')

    if (error) {
      console.error('Error getting active subscribers:', error)
      return []
    }

    return data as DiscordUser[]
  } catch (error) {
    console.error('Error getting active subscribers:', error)
    return []
  }
}

/**
 * Link Discord account to email (for OAuth flow)
 */
export async function linkDiscordAccount(
  email: string,
  discordUserId: string,
  discordUsername: string,
  discordDiscriminator?: string
): Promise<boolean> {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('discord_users')
      .select('*')
      .eq('email', email)
      .single()

    const userData: Partial<DiscordUser> = {
      email,
      discord_user_id: discordUserId,
      discord_username: discordUsername,
      discord_discriminator: discordDiscriminator,
      subscription_status: 'inactive',
      plan_name: 'wealth-builder',
      role_assignment_status: 'pending'
    }

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('discord_users')
        .update({
          discord_user_id: discordUserId,
          discord_username: discordUsername,
          discord_discriminator: discordDiscriminator,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)

      if (error) {
        console.error('Error updating Discord link:', error)
        return false
      }
    } else {
      // Create new user
      const { error } = await supabase
        .from('discord_users')
        .insert(userData)

      if (error) {
        console.error('Error creating Discord link:', error)
        return false
      }
    }

    console.log(`✅ Linked Discord account ${discordUsername} to ${email}`)
    return true
  } catch (error) {
    console.error('Error linking Discord account:', error)
    return false
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats(): Promise<{
  total: number
  active: number
  inactive: number
  cancelled: number
  past_due: number
}> {
  try {
    const { data, error } = await supabase
      .from('discord_users')
      .select('subscription_status')

    if (error) {
      console.error('Error getting subscription stats:', error)
      return { total: 0, active: 0, inactive: 0, cancelled: 0, past_due: 0 }
    }

    const stats = {
      total: data.length,
      active: data.filter(u => u.subscription_status === 'active').length,
      inactive: data.filter(u => u.subscription_status === 'inactive').length,
      cancelled: data.filter(u => u.subscription_status === 'cancelled').length,
      past_due: data.filter(u => u.subscription_status === 'past_due').length
    }

    return stats
  } catch (error) {
    console.error('Error getting subscription stats:', error)
    return { total: 0, active: 0, inactive: 0, cancelled: 0, past_due: 0 }
  }
}

/**
 * Clean up old inactive users (optional maintenance function)
 */
export async function cleanupInactiveUsers(daysOld: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { data, error } = await supabase
      .from('discord_users')
      .delete()
      .eq('subscription_status', 'inactive')
      .lt('updated_at', cutoffDate.toISOString())
      .select()

    if (error) {
      console.error('Error cleaning up inactive users:', error)
      return 0
    }

    const deletedCount = data?.length || 0
    console.log(`🧹 Cleaned up ${deletedCount} inactive users older than ${daysOld} days`)
    return deletedCount
  } catch (error) {
    console.error('Error cleaning up inactive users:', error)
    return 0
  }
}
