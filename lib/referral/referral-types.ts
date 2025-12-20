/**
 * Referral System TypeScript Types
 */

export interface ReferralCode {
  id: string
  user_id: string
  code: string
  created_at: string
  is_active: boolean
  total_clicks: number
  total_signups: number
  total_conversions: number
}

export interface Referral {
  id: string
  referrer_id: string
  referred_user_id: string | null
  referred_email: string | null
  referral_code: string
  status: 'pending' | 'completed' | 'cancelled'
  discount_applied: boolean
  discount_amount: number
  completed_at: string | null
  created_at: string
}

export interface ReferralReward {
  id: string
  user_id: string
  reward_type: 'free_month' | 'discount' | 'credit'
  reward_value: number
  earned_from_referrals: number
  status: 'pending' | 'applied' | 'expired'
  applied_at: string | null
  expires_at: string | null
  created_at: string
}

export interface ReferralAnalytics {
  id: string
  referral_code: string
  event_type: 'click' | 'signup' | 'conversion'
  ip_address: string | null
  user_agent: string | null
  referrer_url: string | null
  created_at: string
}

export interface ReferralStats {
  totalReferrals: number
  pendingReferrals: number
  completedReferrals: number
  totalClicks: number
  conversionRate: number
  freeMonthsEarned: number
  nextRewardProgress: number // 0-3
}

export interface SharePlatform {
  name: string
  icon: string
  color: string
  url: (code: string, message: string) => string
}
