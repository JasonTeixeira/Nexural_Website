import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Points configuration for different activities
export const POINTS_CONFIG = {
  signup: 100,
  referral: 50,
  referred_signup: 25,
  email_open: 5,
  link_click: 10,
  survey_complete: 25,
  social_share_twitter: 15,
  social_share_linkedin: 15,
  social_share_facebook: 10,
  beta_feedback: 100,
  bug_report: 50,
  feature_suggestion: 30,
  community_help: 20
}

// Level thresholds and titles
export const LEVELS = [
  { level: 1, minPoints: 0, maxPoints: 199, title: 'Novice Trader', color: '#9CA3AF' },
  { level: 2, minPoints: 200, maxPoints: 499, title: 'Active Trader', color: '#60A5FA' },
  { level: 3, minPoints: 500, maxPoints: 999, title: 'Pro Trader', color: '#A78BFA' },
  { level: 4, minPoints: 1000, maxPoints: 1999, title: 'Elite Trader', color: '#F59E0B' },
  { level: 5, minPoints: 2000, maxPoints: Infinity, title: 'Master Trader', color: '#EF4444' }
]

// Badge definitions
export const BADGES = {
  early_bird: {
    name: 'Early Bird',
    description: 'First 100 signups',
    icon: '🐦',
    rarity: 'legendary',
    points: 200
  },
  super_referrer: {
    name: 'Super Referrer',
    description: '20+ referrals',
    icon: '🌟',
    rarity: 'legendary',
    points: 500
  },
  top_referrer: {
    name: 'Top Referrer',
    description: '10+ referrals',
    icon: '⭐',
    rarity: 'epic',
    points: 300
  },
  active_referrer: {
    name: 'Active Referrer',
    description: '5+ referrals',
    icon: '✨',
    rarity: 'rare',
    points: 150
  },
  engaged: {
    name: 'Highly Engaged',
    description: 'Opened all emails',
    icon: '📧',
    rarity: 'rare',
    points: 100
  },
  beta_tester: {
    name: 'Beta Tester',
    description: 'Accepted beta invite',
    icon: '🧪',
    rarity: 'epic',
    points: 250
  },
  feedback_hero: {
    name: 'Feedback Hero',
    description: '10+ feedback submissions',
    icon: '💬',
    rarity: 'epic',
    points: 200
  },
  social_butterfly: {
    name: 'Social Butterfly',
    description: 'Shared on all platforms',
    icon: '🦋',
    rarity: 'rare',
    points: 100
  },
  community_champion: {
    name: 'Community Champion',
    description: 'Helped 10+ members',
    icon: '🏆',
    rarity: 'epic',
    points: 250
  },
  bug_hunter: {
    name: 'Bug Hunter',
    description: 'Reported 5+ bugs',
    icon: '🐛',
    rarity: 'rare',
    points: 150
  }
}

export class AlgoTradingGamification {
  
  // Award points for an activity
  async awardPoints(
    memberId: string,
    activityType: keyof typeof POINTS_CONFIG,
    metadata?: any
  ): Promise<{
    pointsEarned: number
    totalPoints: number
    levelUp: boolean
    newLevel?: number
    newLevelTitle?: string
    badgeEarned?: string
  }> {
    try {
      const points = POINTS_CONFIG[activityType] || 0
      
      // Get current stats
      const { data: waitlist } = await supabase
        .from('algo_trading_waitlist')
        .select('*')
        .eq('member_id', memberId)
        .single()
      
      if (!waitlist) {
        throw new Error('Member not on waitlist')
      }
      
      const currentPoints = waitlist.points || 0
      const newTotalPoints = currentPoints + points
      
      // Check for level up
      const currentLevel = this.calculateLevel(currentPoints)
      const newLevel = this.calculateLevel(newTotalPoints)
      const levelUp = newLevel.level > currentLevel.level
      
      // Update points and level
      await supabase
        .from('algo_trading_waitlist')
        .update({
          points: newTotalPoints,
          level: newLevel.level,
          last_activity: new Date().toISOString()
        })
        .eq('member_id', memberId)
      
      // Check for badge eligibility
      const badge = await this.checkBadgeEligibility(memberId, activityType, metadata)
      
      // Log activity
      await supabase
        .from('waitlist_activity_log')
        .insert({
          member_id: memberId,
          waitlist_id: waitlist.id,
          activity_type: activityType,
          activity_data: metadata,
          points_awarded: points
        })
      
      // Update leaderboard
      await this.updateLeaderboard(memberId, newTotalPoints)
      
      // Send level up notification if applicable
      if (levelUp) {
        await this.sendLevelUpNotification(memberId, newLevel)
      }
      
      return {
        pointsEarned: points,
        totalPoints: newTotalPoints,
        levelUp,
        newLevel: levelUp ? newLevel.level : undefined,
        newLevelTitle: levelUp ? newLevel.title : undefined,
        badgeEarned: badge || undefined
      }
      
    } catch (error) {
      console.error('Error awarding points:', error)
      throw error
    }
  }
  
  // Calculate level from points
  calculateLevel(points: number): typeof LEVELS[0] {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].minPoints) {
        return LEVELS[i]
      }
    }
    return LEVELS[0]
  }
  
  // Check if member is eligible for a badge
  async checkBadgeEligibility(
    memberId: string,
    activityType: string,
    metadata?: any
  ): Promise<string | null> {
    try {
      const { data: waitlist } = await supabase
        .from('algo_trading_waitlist')
        .select('*')
        .eq('member_id', memberId)
        .single()
      
      if (!waitlist) return null
      
      const currentBadges = waitlist.badges || []
      
      // Early bird badge (first 100 signups)
      if (activityType === 'signup' && !currentBadges.includes('early_bird')) {
        if (waitlist.original_position <= 100) {
          await this.awardBadge(memberId, 'early_bird')
          return 'early_bird'
        }
      }
      
      // Super referrer badge (20+ referrals)
      if (activityType === 'referral' && !currentBadges.includes('super_referrer')) {
        if (waitlist.referrals_made >= 20) {
          await this.awardBadge(memberId, 'super_referrer')
          return 'super_referrer'
        }
      }
      
      // Top referrer badge (10+ referrals)
      if (activityType === 'referral' && !currentBadges.includes('top_referrer')) {
        if (waitlist.referrals_made >= 10) {
          await this.awardBadge(memberId, 'top_referrer')
          return 'top_referrer'
        }
      }
      
      // Active referrer badge (5+ referrals)
      if (activityType === 'referral' && !currentBadges.includes('active_referrer')) {
        if (waitlist.referrals_made >= 5) {
          await this.awardBadge(memberId, 'active_referrer')
          return 'active_referrer'
        }
      }
      
      // Engaged badge (opened all emails)
      if (activityType === 'email_open' && !currentBadges.includes('engaged')) {
        if (waitlist.email_opens >= 10) {
          await this.awardBadge(memberId, 'engaged')
          return 'engaged'
        }
      }
      
      // Social butterfly badge (shared on all platforms)
      if (activityType.startsWith('social_share') && !currentBadges.includes('social_butterfly')) {
        const { data: activities } = await supabase
          .from('waitlist_activity_log')
          .select('activity_type')
          .eq('member_id', memberId)
          .like('activity_type', 'social_share%')
        
        const platforms = new Set(activities?.map(a => a.activity_type))
        if (platforms.size >= 3) {
          await this.awardBadge(memberId, 'social_butterfly')
          return 'social_butterfly'
        }
      }
      
      return null
      
    } catch (error) {
      console.error('Error checking badge eligibility:', error)
      return null
    }
  }
  
  // Award a badge to a member
  async awardBadge(memberId: string, badgeName: string): Promise<void> {
    try {
      const badge = BADGES[badgeName as keyof typeof BADGES]
      if (!badge) return
      
      // Get current badges
      const { data: waitlist } = await supabase
        .from('algo_trading_waitlist')
        .select('badges, id')
        .eq('member_id', memberId)
        .single()
      
      if (!waitlist) return
      
      const currentBadges = waitlist.badges || []
      
      // Add badge if not already earned
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
            waitlist_id: waitlist.id,
            achievement_type: 'badge_earned',
            achievement_name: badge.name,
            points_earned: badge.points,
            badge_earned: badgeName
          })
        
        // Award badge points
        const { data: current } = await supabase
          .from('algo_trading_waitlist')
          .select('points')
          .eq('member_id', memberId)
          .single()
        
        if (current) {
          await supabase
            .from('algo_trading_waitlist')
            .update({
              points: (current.points || 0) + badge.points
            })
            .eq('member_id', memberId)
        }
        
        // Send badge notification
        await this.sendBadgeNotification(memberId, badge)
      }
    } catch (error) {
      console.error('Error awarding badge:', error)
    }
  }
  
  // Update leaderboard
  async updateLeaderboard(memberId: string, totalPoints: number): Promise<void> {
    try {
      const { data: waitlist } = await supabase
        .from('algo_trading_waitlist')
        .select('*')
        .eq('member_id', memberId)
        .single()
      
      if (!waitlist) return
      
      // Calculate engagement score
      const engagementScore = 
        totalPoints +
        (waitlist.referrals_made || 0) * 10 +
        (waitlist.email_opens || 0) * 2 +
        (waitlist.link_clicks || 0) * 5 +
        (waitlist.badges?.length || 0) * 50
      
      // Upsert leaderboard entry
      await supabase
        .from('waitlist_leaderboard')
        .upsert({
          member_id: memberId,
          waitlist_id: waitlist.id,
          total_points: totalPoints,
          referrals_count: waitlist.referrals_made || 0,
          engagement_score: engagementScore
        }, {
          onConflict: 'member_id'
        })
      
      // Recalculate ranks
      await supabase.rpc('recalculate_leaderboard_ranks')
      
    } catch (error) {
      console.error('Error updating leaderboard:', error)
    }
  }
  
  // Get member's gamification stats
  async getGamificationStats(memberId: string): Promise<{
    points: number
    level: number
    levelTitle: string
    levelColor: string
    nextLevel: typeof LEVELS[0] | null
    pointsToNextLevel: number
    badges: string[]
    badgeDetails: typeof BADGES[keyof typeof BADGES][]
    rank: number | null
    totalMembers: number
  }> {
    try {
      const { data: waitlist } = await supabase
        .from('algo_trading_waitlist')
        .select('*')
        .eq('member_id', memberId)
        .single()
      
      if (!waitlist) {
        throw new Error('Member not on waitlist')
      }
      
      const currentLevel = this.calculateLevel(waitlist.points || 0)
      const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1) || null
      const pointsToNextLevel = nextLevel ? nextLevel.minPoints - (waitlist.points || 0) : 0
      
      // Get badge details
      const badgeDetails = (waitlist.badges || []).map((badgeName: string) => 
        BADGES[badgeName as keyof typeof BADGES]
      ).filter(Boolean)
      
      // Get rank
      const { data: leaderboard } = await supabase
        .from('waitlist_leaderboard')
        .select('rank')
        .eq('member_id', memberId)
        .single()
      
      // Get total members
      const { count } = await supabase
        .from('algo_trading_waitlist')
        .select('*', { count: 'exact', head: true })
      
      return {
        points: waitlist.points || 0,
        level: currentLevel.level,
        levelTitle: currentLevel.title,
        levelColor: currentLevel.color,
        nextLevel,
        pointsToNextLevel,
        badges: waitlist.badges || [],
        badgeDetails,
        rank: leaderboard?.rank || null,
        totalMembers: count || 0
      }
      
    } catch (error) {
      console.error('Error getting gamification stats:', error)
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
          algo_trading_waitlist!inner(name, email, referral_code, level, badges)
        `)
        .order('rank', { ascending: true })
        .limit(limit)
      
      return data || []
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }
  
  // Get activity history
  async getActivityHistory(memberId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('waitlist_activity_log')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      return data || []
    } catch (error) {
      console.error('Error getting activity history:', error)
      return []
    }
  }
  
  // Notification functions
  private async sendLevelUpNotification(memberId: string, newLevel: typeof LEVELS[0]): Promise<void> {
    console.log(`Sending level up notification to ${memberId} for level ${newLevel.level}`)
    // TODO: Integrate with email service
  }
  
  private async sendBadgeNotification(memberId: string, badge: typeof BADGES[keyof typeof BADGES]): Promise<void> {
    console.log(`Sending badge notification to ${memberId} for ${badge.name}`)
    // TODO: Integrate with email service
  }
}

// Export singleton instance
export const algoTradingGamification = new AlgoTradingGamification()

// Utility functions
export function getLevelProgress(points: number): {
  currentLevel: typeof LEVELS[0]
  nextLevel: typeof LEVELS[0] | null
  progress: number
} {
  const currentLevel = LEVELS.find(l => points >= l.minPoints && points <= l.maxPoints) || LEVELS[0]
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1) || null
  
  let progress = 0
  if (nextLevel) {
    const pointsInLevel = points - currentLevel.minPoints
    const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints
    progress = Math.round((pointsInLevel / pointsNeeded) * 100)
  } else {
    progress = 100 // Max level
  }
  
  return { currentLevel, nextLevel, progress }
}

export function getBadgeRarityColor(rarity: string): string {
  const colors = {
    common: '#9CA3AF',
    rare: '#60A5FA',
    epic: '#A78BFA',
    legendary: '#F59E0B'
  }
  return colors[rarity as keyof typeof colors] || colors.common
}
