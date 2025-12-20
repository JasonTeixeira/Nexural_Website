import { createClient } from '@supabase/supabase-js'
import { emailService } from './email-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Member interfaces
interface Member {
  id: string
  email: string
  name: string
  discord_id?: string
  subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise'
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'
  subscription_start_date?: string
  subscription_end_date?: string
  trial_end_date?: string
  payment_method?: string
  billing_cycle: 'monthly' | 'yearly'
  total_spent: number
  last_login?: string
  login_count: number
  preferences: MemberPreferences
  tags: string[]
  notes?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

interface MemberPreferences {
  email_notifications: boolean
  discord_notifications: boolean
  trading_signals: boolean
  newsletter: boolean
  marketing_emails: boolean
  sms_notifications: boolean
  timezone: string
  language: string
  theme: 'light' | 'dark' | 'auto'
  dashboard_layout: 'compact' | 'detailed' | 'minimal'
  signal_frequency: 'all' | 'high_confidence' | 'custom'
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
}

interface MemberActivity {
  id: string
  member_id: string
  activity_type: 'login' | 'logout' | 'subscription_change' | 'payment' | 'support_ticket' | 'signal_view' | 'dashboard_view'
  description: string
  metadata?: any
  ip_address?: string
  user_agent?: string
  timestamp: string
}

interface SupportTicket {
  id: string
  member_id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'account' | 'trading' | 'general'
  assigned_to?: string
  resolution?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

interface MemberSegment {
  id: string
  name: string
  description: string
  criteria: {
    subscription_tier?: string[]
    subscription_status?: string[]
    total_spent_min?: number
    total_spent_max?: number
    login_count_min?: number
    days_since_last_login?: number
    tags?: string[]
    created_after?: string
    created_before?: string
  }
  member_count: number
  created_at: string
  updated_at: string
}

export class MemberManagementService {
  
  // Member Profile Management
  async getMember(memberId: string): Promise<Member | null> {
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select(`
          *,
          member_activities(count),
          support_tickets(count)
        `)
        .eq('id', memberId)
        .single()

      if (error) {
        console.error('Error fetching member:', error)
        return null
      }

      return member
    } catch (error) {
      console.error('Error in getMember:', error)
      return null
    }
  }

  async updateMemberProfile(memberId: string, updates: Partial<Member>): Promise<{ success: boolean; member?: Member; error?: string }> {
    try {
      const { data: updatedMember, error } = await supabase
        .from('members')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Log activity
      await this.logMemberActivity(memberId, 'profile_update', 'Member profile updated', updates)

      return { success: true, member: updatedMember }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updateMemberPreferences(memberId: string, preferences: Partial<MemberPreferences>): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current preferences
      const { data: currentMember } = await supabase
        .from('members')
        .select('preferences')
        .eq('id', memberId)
        .single()

      const updatedPreferences = {
        ...currentMember?.preferences,
        ...preferences
      }

      const { error } = await supabase
        .from('members')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Log activity
      await this.logMemberActivity(memberId, 'preferences_update', 'Member preferences updated', preferences)

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Subscription Lifecycle Management
  async updateSubscription(memberId: string, subscriptionData: {
    tier: string
    status: string
    start_date?: string
    end_date?: string
    billing_cycle?: string
    payment_method?: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('members')
        .update({
          subscription_tier: subscriptionData.tier,
          subscription_status: subscriptionData.status,
          subscription_start_date: subscriptionData.start_date,
          subscription_end_date: subscriptionData.end_date,
          billing_cycle: subscriptionData.billing_cycle,
          payment_method: subscriptionData.payment_method,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Log activity
      await this.logMemberActivity(memberId, 'subscription_change', 'Subscription updated', subscriptionData)

      // Send notification email
      const member = await this.getMember(memberId)
      if (member && member.preferences.email_notifications) {
        await this.sendSubscriptionUpdateEmail(member, subscriptionData)
      }

      // Update Discord role if connected
      if (member?.discord_id) {
        await this.updateDiscordRole(member.discord_id, subscriptionData.tier)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async cancelSubscription(memberId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('members')
        .update({
          subscription_status: 'cancelled',
          subscription_end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Log activity
      await this.logMemberActivity(memberId, 'subscription_cancelled', 'Subscription cancelled', { reason })

      // Send cancellation email
      const member = await this.getMember(memberId)
      if (member) {
        await this.sendCancellationEmail(member, reason)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Member Analytics and Reporting
  async getMemberAnalytics(memberId: string, timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
    login_frequency: number
    activity_count: number
    subscription_value: number
    engagement_score: number
    last_activities: MemberActivity[]
    preferences_completion: number
  }> {
    try {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get member activities
      const { data: activities } = await supabase
        .from('member_activities')
        .select('*')
        .eq('member_id', memberId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })

      // Get member data
      const member = await this.getMember(memberId)

      const loginCount = activities?.filter(a => a.activity_type === 'login').length || 0
      const activityCount = activities?.length || 0
      
      // Calculate engagement score (0-100)
      const engagementScore = Math.min(100, Math.round(
        (loginCount * 10) + 
        (activityCount * 2) + 
        (member?.subscription_tier !== 'free' ? 20 : 0) +
        (member?.preferences ? Object.values(member.preferences).filter(Boolean).length * 2 : 0)
      ))

      // Calculate preferences completion
      const preferencesCompletion = member?.preferences ? 
        Math.round((Object.values(member.preferences).filter(v => v !== null && v !== undefined).length / Object.keys(member.preferences).length) * 100) : 0

      return {
        login_frequency: loginCount,
        activity_count: activityCount,
        subscription_value: member?.total_spent || 0,
        engagement_score: engagementScore,
        last_activities: activities?.slice(0, 10) || [],
        preferences_completion: preferencesCompletion
      }
    } catch (error) {
      console.error('Error getting member analytics:', error)
      return {
        login_frequency: 0,
        activity_count: 0,
        subscription_value: 0,
        engagement_score: 0,
        last_activities: [],
        preferences_completion: 0
      }
    }
  }

  async getMemberSegments(): Promise<MemberSegment[]> {
    try {
      const { data: segments, error } = await supabase
        .from('member_segments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching segments:', error)
        return []
      }

      // Update member counts for each segment
      const segmentsWithCounts = await Promise.all(
        (segments || []).map(async (segment) => {
          const memberCount = await this.getMembersInSegment(segment.id)
          return { ...segment, member_count: memberCount.length }
        })
      )

      return segmentsWithCounts
    } catch (error) {
      console.error('Error in getMemberSegments:', error)
      return []
    }
  }

  async getMembersInSegment(segmentId: string): Promise<Member[]> {
    try {
      const { data: segment } = await supabase
        .from('member_segments')
        .select('criteria')
        .eq('id', segmentId)
        .single()

      if (!segment) return []

      let query = supabase.from('members').select('*')

      // Apply criteria filters
      const criteria = segment.criteria
      
      if (criteria.subscription_tier) {
        query = query.in('subscription_tier', criteria.subscription_tier)
      }
      
      if (criteria.subscription_status) {
        query = query.in('subscription_status', criteria.subscription_status)
      }
      
      if (criteria.total_spent_min) {
        query = query.gte('total_spent', criteria.total_spent_min)
      }
      
      if (criteria.total_spent_max) {
        query = query.lte('total_spent', criteria.total_spent_max)
      }
      
      if (criteria.login_count_min) {
        query = query.gte('login_count', criteria.login_count_min)
      }
      
      if (criteria.created_after) {
        query = query.gte('created_at', criteria.created_after)
      }
      
      if (criteria.created_before) {
        query = query.lte('created_at', criteria.created_before)
      }

      const { data: members, error } = await query

      if (error) {
        console.error('Error fetching segment members:', error)
        return []
      }

      return members || []
    } catch (error) {
      console.error('Error in getMembersInSegment:', error)
      return []
    }
  }

  // Support Ticket System
  async createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; ticket?: SupportTicket; error?: string }> {
    try {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert({
          ...ticketData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Log activity
      await this.logMemberActivity(ticketData.member_id, 'support_ticket', 'Support ticket created', { 
        ticket_id: ticket.id, 
        subject: ticketData.subject 
      })

      // Send notification to support team
      await this.notifySupportTeam(ticket)

      return { success: true, ticket }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updateSupportTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      if (updates.status === 'resolved' || updates.status === 'closed') {
        updateData.resolved_at = new Date().toISOString()
      }

      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Log activity
      await this.logMemberActivity(ticket.member_id, 'support_ticket_update', 'Support ticket updated', updates)

      // Send update notification to member
      if (updates.status || updates.resolution) {
        const member = await this.getMember(ticket.member_id)
        if (member) {
          await this.sendTicketUpdateEmail(member, ticket)
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Member Communication
  async sendMemberEmail(memberId: string, template: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const member = await this.getMember(memberId)
      if (!member) {
        return { success: false, error: 'Member not found' }
      }

      if (!member.preferences.email_notifications) {
        return { success: false, error: 'Member has disabled email notifications' }
      }

      const result = await emailService.sendEmail(
        member.email,
        data.subject,
        data.html,
        data.text,
        'Nexural Trading',
        'noreply@nexuraltrading.com'
      )

      // Log activity
      await this.logMemberActivity(memberId, 'email_sent', 'Email sent to member', { 
        template, 
        subject: data.subject,
        success: result.success 
      })

      return result
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Member Activity Logging
  async logMemberActivity(memberId: string, activityType: string, description: string, metadata?: any): Promise<void> {
    try {
      await supabase
        .from('member_activities')
        .insert({
          member_id: memberId,
          activity_type: activityType,
          description,
          metadata,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging member activity:', error)
    }
  }

  // Discord Integration
  async updateDiscordRole(discordId: string, subscriptionTier: string): Promise<void> {
    try {
      // This would integrate with Discord API to update roles
      // Implementation depends on Discord bot setup
      console.log(`Updating Discord role for ${discordId} to ${subscriptionTier}`)
      
      // Log the role update attempt
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('discord_id', discordId)
        .single()

      if (member) {
        await this.logMemberActivity(member.id, 'discord_role_update', 'Discord role updated', { 
          discord_id: discordId, 
          new_tier: subscriptionTier 
        })
      }
    } catch (error) {
      console.error('Error updating Discord role:', error)
    }
  }

  // Email Templates
  private async sendSubscriptionUpdateEmail(member: Member, subscriptionData: any): Promise<void> {
    const emailData = {
      subject: 'Subscription Updated - Nexural Trading',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #1f2937;">Subscription Updated</h1>
          <p>Hi ${member.name},</p>
          <p>Your subscription has been updated successfully:</p>
          <ul>
            <li><strong>Plan:</strong> ${subscriptionData.tier}</li>
            <li><strong>Status:</strong> ${subscriptionData.status}</li>
            <li><strong>Billing Cycle:</strong> ${subscriptionData.billing_cycle}</li>
          </ul>
          <p>Thank you for being a valued member of Nexural Trading!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-portal" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Your Account</a>
          </div>
        </div>
      `,
      text: `Subscription Updated\n\nHi ${member.name},\n\nYour subscription has been updated successfully...`
    }

    await this.sendMemberEmail(member.id, 'subscription_update', emailData)
  }

  private async sendCancellationEmail(member: Member, reason?: string): Promise<void> {
    const emailData = {
      subject: 'Subscription Cancelled - We\'re Sorry to See You Go',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #1f2937;">Subscription Cancelled</h1>
          <p>Hi ${member.name},</p>
          <p>We're sorry to see you go. Your subscription has been cancelled as requested.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>You'll continue to have access to your account until your current billing period ends.</p>
          <p>If you change your mind, you can reactivate your subscription anytime.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-portal" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reactivate Subscription</a>
          </div>
        </div>
      `,
      text: `Subscription Cancelled\n\nHi ${member.name},\n\nWe're sorry to see you go...`
    }

    await this.sendMemberEmail(member.id, 'subscription_cancelled', emailData)
  }

  private async sendTicketUpdateEmail(member: Member, ticket: SupportTicket): Promise<void> {
    const emailData = {
      subject: `Support Ticket Update: ${ticket.subject}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #1f2937;">Support Ticket Update</h1>
          <p>Hi ${member.name},</p>
          <p>Your support ticket has been updated:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> ${ticket.id}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
            ${ticket.resolution ? `<p><strong>Resolution:</strong> ${ticket.resolution}</p>` : ''}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-portal/support" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Ticket</a>
          </div>
        </div>
      `,
      text: `Support Ticket Update\n\nHi ${member.name},\n\nYour support ticket has been updated...`
    }

    await this.sendMemberEmail(member.id, 'ticket_update', emailData)
  }

  private async notifySupportTeam(ticket: SupportTicket): Promise<void> {
    // Send notification to support team
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@nexuraltrading.com'
    
    await emailService.sendEmail(
      supportEmail,
      `New Support Ticket: ${ticket.subject}`,
      `
        <h2>New Support Ticket</h2>
        <p><strong>Ticket ID:</strong> ${ticket.id}</p>
        <p><strong>Member ID:</strong> ${ticket.member_id}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Description:</strong></p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px;">
          ${ticket.description}
        </div>
      `,
      `New Support Ticket\n\nTicket ID: ${ticket.id}\nMember ID: ${ticket.member_id}\nSubject: ${ticket.subject}\nPriority: ${ticket.priority}\nCategory: ${ticket.category}\n\nDescription:\n${ticket.description}`
    )
  }
}

// Export singleton instance
export const memberManagementService = new MemberManagementService()

// Member onboarding flows
export const MemberOnboarding = {
  async startOnboarding(memberId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Create onboarding checklist
      const onboardingSteps = [
        { step: 'profile_completion', completed: false, title: 'Complete Your Profile' },
        { step: 'preferences_setup', completed: false, title: 'Set Your Preferences' },
        { step: 'discord_connection', completed: false, title: 'Connect Discord Account' },
        { step: 'first_signal_view', completed: false, title: 'View Your First Trading Signal' },
        { step: 'dashboard_tour', completed: false, title: 'Take Dashboard Tour' }
      ]

      await supabase
        .from('member_onboarding')
        .upsert({
          member_id: memberId,
          steps: onboardingSteps,
          started_at: new Date().toISOString(),
          completed: false
        })

      // Send welcome email
      const member = await memberManagementService.getMember(memberId)
      if (member) {
        await memberManagementService.sendMemberEmail(memberId, 'welcome_onboarding', {
          subject: 'Welcome to Nexural Trading - Let\'s Get Started!',
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <h1 style="color: #1f2937;">Welcome to Nexural Trading!</h1>
              <p>Hi ${member.name},</p>
              <p>Welcome to our community of professional traders! Let's get you set up for success.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-portal/onboarding" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Onboarding</a>
              </div>
            </div>
          `,
          text: 'Welcome to Nexural Trading! Let\'s get you set up for success.'
        })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  async completeOnboardingStep(memberId: string, step: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: onboarding } = await supabase
        .from('member_onboarding')
        .select('steps')
        .eq('member_id', memberId)
        .single()

      if (!onboarding) {
        return { success: false, error: 'Onboarding not found' }
      }

      const updatedSteps = onboarding.steps.map((s: any) => 
        s.step === step ? { ...s, completed: true, completed_at: new Date().toISOString() } : s
      )

      const allCompleted = updatedSteps.every((s: any) => s.completed)

      await supabase
        .from('member_onboarding')
        .update({
          steps: updatedSteps,
          completed: allCompleted,
          completed_at: allCompleted ? new Date().toISOString() : null
        })
        .eq('member_id', memberId)

      // Log activity
      await memberManagementService.logMemberActivity(memberId, 'onboarding_step', `Completed onboarding step: ${step}`)

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}
