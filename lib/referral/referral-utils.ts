/**
 * Referral System Utility Functions
 */

import { createClient } from '@supabase/supabase-js'
import type { ReferralCode, Referral, ReferralReward, ReferralStats, SharePlatform } from './referral-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Generate referral link from code
 */
export function generateReferralLink(code: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://nexural.com'
  
  return `${baseUrl}/refer/${code}`
}

/**
 * Get or create referral code for user
 */
export async function getOrCreateReferralCode(userId: string, userEmail: string): Promise<ReferralCode | null> {
  try {
    // Check if user already has a code
    const { data: existing, error: fetchError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existing && !fetchError) {
      return existing
    }

    // Generate new code
    const { data: newCode, error: generateError } = await supabase
      .rpc('generate_referral_code', { user_email: userEmail })

    if (generateError) throw generateError

    // Insert new code
    const { data: inserted, error: insertError } = await supabase
      .from('referral_codes')
      .insert({
        user_id: userId,
        code: newCode,
        is_active: true
      })
      .select()
      .single()

    if (insertError) throw insertError

    return inserted
  } catch (error) {
    console.error('Error getting/creating referral code:', error)
    return null
  }
}

/**
 * Get referral stats for user
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  try {
    // Get all referrals
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)

    // Get referral code stats
    const { data: code } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Get rewards
    const { data: rewards } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('user_id', userId)

    const totalReferrals = referrals?.length || 0
    const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0
    const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0
    const totalClicks = code?.total_clicks || 0
    const freeMonthsEarned = rewards?.length || 0
    const nextRewardProgress = completedReferrals % 3

    return {
      totalReferrals,
      pendingReferrals,
      completedReferrals,
      totalClicks,
      conversionRate: totalClicks > 0 ? (completedReferrals / totalClicks) * 100 : 0,
      freeMonthsEarned,
      nextRewardProgress
    }
  } catch (error) {
    console.error('Error getting referral stats:', error)
    return {
      totalReferrals: 0,
      pendingReferrals: 0,
      completedReferrals: 0,
      totalClicks: 0,
      conversionRate: 0,
      freeMonthsEarned: 0,
      nextRewardProgress: 0
    }
  }
}

/**
 * Get referral history for user
 */
export async function getReferralHistory(userId: string): Promise<Referral[]> {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting referral history:', error)
    return []
  }
}

/**
 * Get rewards for user
 */
export async function getReferralRewards(userId: string): Promise<ReferralReward[]> {
  try {
    const { data, error } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting referral rewards:', error)
    return []
  }
}

/**
 * Validate referral code
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('is_active')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    return !error && data !== null
  } catch (error) {
    return false
  }
}

/**
 * Track referral click
 */
export async function trackReferralClick(code: string): Promise<void> {
  try {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null
    const referrerUrl = typeof document !== 'undefined' ? document.referrer : null

    await supabase.rpc('track_referral_click', {
      ref_code: code,
      agent: userAgent,
      ref_url: referrerUrl
    })
  } catch (error) {
    console.error('Error tracking referral click:', error)
  }
}

/**
 * Create referral (when someone signs up)
 */
export async function createReferral(
  referralCode: string,
  referredUserId: string,
  referredEmail: string
): Promise<boolean> {
  try {
    // Get referrer ID from code
    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', referralCode)
      .single()

    if (!codeData) return false

    // Create referral
    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: codeData.user_id,
        referred_user_id: referredUserId,
        referred_email: referredEmail,
        referral_code: referralCode,
        status: 'pending',
        discount_applied: true,
        discount_amount: 15.00
      })

    return !error
  } catch (error) {
    console.error('Error creating referral:', error)
    return false
  }
}

/**
 * Complete referral (when payment is successful)
 */
export async function completeReferral(referredUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('referrals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('referred_user_id', referredUserId)
      .eq('status', 'pending')

    return !error
  } catch (error) {
    console.error('Error completing referral:', error)
    return false
  }
}

/**
 * Get share platforms with pre-filled messages
 */
export function getSharePlatforms(code: string): SharePlatform[] {
  const link = generateReferralLink(code)
  const message = `I'm making consistent profits with Nexural Trading! Join me and get 50% off your first month: ${link}`
  const encodedMessage = encodeURIComponent(message)
  const encodedLink = encodeURIComponent(link)

  return [
    {
      name: 'Twitter',
      icon: '𝕏',
      color: 'bg-black hover:bg-gray-800',
      url: (code, msg) => `https://twitter.com/intent/tweet?text=${encodedMessage}`
    },
    {
      name: 'Facebook',
      icon: 'f',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: (code, msg) => `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedMessage}`
    },
    {
      name: 'LinkedIn',
      icon: 'in',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: (code, msg) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-600 hover:bg-green-700',
      url: (code, msg) => `https://wa.me/?text=${encodedMessage}`
    },
    {
      name: 'Email',
      icon: '✉️',
      color: 'bg-gray-600 hover:bg-gray-700',
      url: (code, msg) => `mailto:?subject=Join%20Nexural%20Trading&body=${encodedMessage}`
    }
  ]
}

/**
 * Copy to clipboard with success feedback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    return false
  }
}

/**
 * Format date for display
 */
export function formatReferralDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Calculate next reward milestone
 */
export function getNextRewardMilestone(completedReferrals: number): {
  current: number
  target: number
  remaining: number
  percentage: number
} {
  const current = completedReferrals % 3
  const target = 3
  const remaining = target - current
  const percentage = (current / target) * 100

  return { current, target, remaining, percentage }
}
