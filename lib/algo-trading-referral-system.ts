import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Referral reward tiers
const REFERRAL_REWARDS = {
  tier1: { referrals: 1, positionBoost: 5, points: 50, badge: null },
  tier2: { referrals: 5, positionBoost: 15, points: 150, badge: 'active_referrer' },
  tier3: { referrals: 10, positionBoost: 30, points: 300, badge: 'top_referrer' },
  tier4: { referrals: 20, positionBoost: 50, points: 500, badge: 'super_referrer' }
}

export class AlgoTradingReferralSystem {
  
  // Generate unique referral code
  async generateReferralCode(memberId: string, name: string): Promise<string> {
    try {
      // Create memorable code from name + random
      const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6)
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      const code = `${cleanName}${random}`
      
      // Check if code exists
      const { data: existing } = await supabase
        .from('algo_trading_waitlist')
        .select('referral_code')
        .eq('referral_code', code)
        .single()
      
      // If exists, try again
      if (existing) {
        return this.generateReferralCode(memberId, name)
      }
      
      return code
    } catch (error) {
      console.error('Error generating referral code:', error)
      // Fallback to UUID-based code
      return `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    }
  }
  
  // Join waitlist with optional referral code
  async joinWaitlist(data: {
    memberId: string
    email: string
    name: string
    tradingExperience?: string
    currentBroker?: string
    interestedFeatures?: string[]
    willingToBeta?: boolean
    referralCode?: string
  }): Promise<{
    success: boolean
    position: number
    referralCode: string
    message: string
    error?: string
  }> {
    try {
      // Check if already on waitlist
      const { data: existing } = await supabase
        .from('algo_trading_waitlist')
        .select('*')
        .eq('email', data.email)
        .single()
      
      if (existing) {
        return {
          success: false,
          position: existing.current_position,
          referralCode: existing.referral_code,
          message: 'Already on waitlist',
          error: 'Email already registered'
        }
      }
      
      // Get current waitlist count for position
      const { count } = await supabase
        .from('algo_trading_waitlist')
        .select('*', { count: 'exact', head: true })
      
      const position = (count || 0) + 1
      
      // Generate unique referral code
      const referralCode = await this.generateReferralCode(data.memberId, data.name)
      
      // Insert into waitlist
      const { data: waitlistEntry, error: insertError } = await supabase
        .from('algo_trading_waitlist')
        .insert({
          member_id: data.memberId,
          email: data.email,
          name: data.name,
          original_position: position,
          current_position: position,
          referral_code: referralCode,
          referred_by: data.referralCode || null,
          trading_experience: data.tradingExperience,
          current_broker: data.currentBroker,
          interested_features: data.interestedFeatures || [],
          willing_to_beta: data.willingToBeta || false,
          points: 100, // Starting points
          level: 1
        })
        .select()
        .single()
      
      if (insertError) {
        throw insertError
      }
      
      // If they used a referral code, process it
      if (data.referralCode) {
        await this.processReferral(data.referralCode, data.memberId, data.email)
      }
      
      // Award signup points
      await this.awardPoints(data.memberId, 100, 'signup')
      
      // Send confirmation email
      await this.sendWaitlistConfirmationEmail(data.email, data.name, position, referralCode)
      
      return {
        success: true,
        position,
        referralCode,
        message: `Successfully joined waitlist at position #${position}`
      }
      
    } catch (error) {
      console.error('Error joining waitlist:', error)
      return {
        success: false,
        position: 0,
        referralCode: '',
        message: 'Failed to join waitlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  // Process referral when someone uses a code
  async processReferral(
    referralCode: string,
    newMemberId: string,
    newMemberEmail: string
  ): Promise<void> {
    try {
      // Find the referrer
      const { data: referrer } = await supabase
        .from('algo_trading_waitlist')
        .select('*')
        .eq('referral_code', referralCode)
        .single()
      
      if (!referrer) {
        console.log('Invalid referral code:', referralCode)
        return
      }
      
      // Record the referral
      await supabase
        .from('algo_trading_referrals')
        .insert({
          referrer_id: referrer.member_id,
          referee_id: newMemberId,
          referral_code: referralCode,
          status: 'completed'
        })
      
      // Update referrer's referral count
      const newReferralCount = (referrer.referrals_made || 0) + 1
      
      await supabase
        .from('algo_trading_waitlist')
        .update({ referrals_made: newReferralCount })
        .eq('member_id', referrer.member_id)
      
      // Calculate and apply rewards
      await this.applyReferralRewards(referrer.member_id, newReferralCount)
      
      // Award points to both parties
      await this.awardPoints(referrer.member_id, 50, 'referral')
      await this.awardPoints(newMemberId, 25, 'referred_signup')
      
      // Send notification emails
      await this.sendReferralSuccessEmail(referrer.email, referrer.name, newReferralCount)
      
    } catch (error) {
      console.error('Error processing referral:', error)
    }
  }
  
  // Apply rewards based on referral milestones
  async applyReferralRewards(memberId: string, totalReferrals: number): Promise<void> {
    try {
      let reward = null
      
      // Determine reward tier
      if (totalReferrals >= 20) {
        reward = REFERRAL_REWARDS.tier4
      } else if (totalReferrals >= 10) {
        reward = REFERRAL_REWARDS.tier3
      } else if (totalReferrals >= 5) {
        reward = REFERRAL_REWARDS.tier2
      } else if (totalReferrals >= 1) {
        reward = REFERRAL_REWARDS.tier1
      }
      
      if (!reward) return
      
      // Apply position boost
      await supabase.rpc('update_position_after_referral', {
        p_member_id: memberId,
        p_boost_amount: reward.positionBoost
      })
      
      // Award badge if applicable
      if (reward.badge && [5, 10, 20].includes(totalReferrals)) {
        await this.awardBadge(memberId, reward.badge)
        
        // Send milestone email
        await this.sendMilestoneEmail(memberId, totalReferrals, reward)
      }
      
    } catch (error) {
      console.error('Error applying referral rewards:', error)
    }
  }
  
  // Award points to a member
  async awardPoints(
    memberId: string,
    points: number,
    activityType: string
  ): Promise<void> {
    try {
      await supabase.rpc('award_points', {
        p_member_id: memberId,
        p_points: points,
        p_activity_type: activityType
      })
    } catch (error) {
      console.error('Error awarding points:', error)
    }
  }
  
  // Award badge to a member
  async awardBadge(memberId: string, badgeName: string): Promise<void> {
    try {
      // Get current badges
      const { data: waitlist } = await supabase
        .from('algo_trading_waitlist')
        .select('badges')
        .eq('member_id', memberId)
        .single()
      
      const currentBadges = waitlist?.badges || []
      
      // Add new badge if not already earned
      if (!currentBadges.includes(badgeName)) {
        const newBadges = [...currentBadges, badgeName]
        
        await supabase
          .from('algo_trading_waitlist')
          .update({ badges: newBadges })
          .eq('member_id', memberId)
        
        // Record achievement
        await supabase
          .from('waitlist_achievements')
          .insert({
            member_id: memberId,
            achievement_type: 'badge_earned',
            achievement_name: badgeName,
            badge_earned: badgeName
          })
      }
    } catch (error) {
      console.error('Error awarding badge:', error)
    }
  }
  
  // Get referral stats for a member
  async getReferralStats(memberId: string): Promise<{
    totalReferrals: number
    positionBoosts: number
    currentPosition: number
    originalPosition: number
    referralCode: string
    points: number
    level: number
    badges: string[]
    nextMilestone: { referrals: number, reward: string } | null
  }> {
    try {
      const { data: waitlist } = await supabase
        .from('algo_trading_waitlist')
        .select('*')
        .eq('member_id', memberId)
        .single()
      
      if (!waitlist) {
        throw new Error('Not on waitlist')
      }
      
      // Calculate next milestone
      let nextMilestone = null
      const referrals = waitlist.referrals_made || 0
      
      if (referrals < 5) {
        nextMilestone = { referrals: 5, reward: 'Move up 15 spots + Active Referrer badge' }
      } else if (referrals < 10) {
        nextMilestone = { referrals: 10, reward: 'Move up 30 spots + Top Referrer badge' }
      } else if (referrals < 20) {
        nextMilestone = { referrals: 20, reward: 'Move up 50 spots + Super Referrer badge + Lifetime 33% discount' }
      }
      
      return {
        totalReferrals: waitlist.referrals_made || 0,
        positionBoosts: waitlist.position_boosts || 0,
        currentPosition: waitlist.current_position,
        originalPosition: waitlist.original_position,
        referralCode: waitlist.referral_code,
        points: waitlist.points || 0,
        level: waitlist.level || 1,
        badges: waitlist.badges || [],
        nextMilestone
      }
    } catch (error) {
      console.error('Error getting referral stats:', error)
      throw error
    }
  }
  
  // Get leaderboard
  async getLeaderboard(limit: number = 100): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('waitlist_leaderboard')
        .select(`
          *,
          algo_trading_waitlist!inner(name, email, referral_code)
        `)
        .order('engagement_score', { ascending: false })
        .limit(limit)
      
      return data || []
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }
  
  // Email functions (integrate with existing email service)
  private async sendWaitlistConfirmationEmail(
    email: string,
    name: string,
    position: number,
    referralCode: string
  ): Promise<void> {
    // This will integrate with your existing email service
    console.log(`Sending confirmation email to ${email}`)
    // TODO: Implement with lib/email-service.ts
  }
  
  private async sendReferralSuccessEmail(
    email: string,
    name: string,
    totalReferrals: number
  ): Promise<void> {
    console.log(`Sending referral success email to ${email}`)
    // TODO: Implement with lib/email-service.ts
  }
  
  private async sendMilestoneEmail(
    memberId: string,
    totalReferrals: number,
    reward: any
  ): Promise<void> {
    console.log(`Sending milestone email for ${totalReferrals} referrals`)
    // TODO: Implement with lib/email-service.ts
  }
}

// Export singleton instance
export const algoTradingReferralSystem = new AlgoTradingReferralSystem()

// Utility functions
export async function generateShareableLink(referralCode: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexuraltrading.com'
  return `${baseUrl}/algo-trading-beta?ref=${referralCode}`
}

export function getShareText(referralCode: string, name: string): {
  twitter: string
  linkedin: string
  email: string
} {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/algo-trading-beta?ref=${referralCode}`
  
  return {
    twitter: `I just joined the waitlist for @NexuralTrading's Algo Trading feature! 🚀 Run automated strategies on your own IB account. Join me: ${link}`,
    linkedin: `Excited to be on the waitlist for Nexural Trading's new Algo Trading feature! This will let us run automated trading strategies on our own Interactive Brokers accounts. Check it out: ${link}`,
    email: `Hey! I thought you might be interested in this - Nexural Trading is launching an Algo Trading feature that lets you run automated strategies on your own IB account. I'm on the waitlist and you can join here: ${link}`
  }
}
