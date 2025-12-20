'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  Check, 
  ExternalLink,
  Gift,
  Target,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AffiliateData {
  id: string
  user_id: string
  referral_code: string
  total_referrals: number
  active_referrals: number
  total_earnings: number
  pending_payout: number
  paid_out: number
  tier: string
  commission_rate: number
  created_at: string
}

interface Referral {
  id: string
  referred_email: string
  status: string
  subscription_tier: string
  commission_earned: number
  created_at: string
}

interface Click {
  id: string
  clicked_at: string
  converted: boolean
}

export default function AffiliateDashboard() {
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [clicks, setClicks] = useState<Click[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadAffiliateData()
  }, [])

  async function loadAffiliateData() {
    try {
      const supabase = createClient()
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/member-login')
        return
      }

      // Check if user is already an affiliate
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (affiliateData) {
        setAffiliate(affiliateData)

        // Load referrals
        const { data: referralsData } = await supabase
          .from('affiliate_referrals')
          .select('*')
          .eq('affiliate_id', affiliateData.id)
          .order('created_at', { ascending: false })

        if (referralsData) {
          setReferrals(referralsData)
        }

        // Load clicks
        const { data: clicksData } = await supabase
          .from('affiliate_clicks')
          .select('*')
          .eq('affiliate_id', affiliateData.id)
          .order('clicked_at', { ascending: false })
          .limit(100)

        if (clicksData) {
          setClicks(clicksData)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading affiliate data:', error)
      setLoading(false)
    }
  }

  async function signUpAsAffiliate() {
    try {
      setIsSigningUp(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Generate unique referral code
      const referralCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          referral_code: referralCode,
          tier: 'bronze',
          commission_rate: 20
        })
        .select()
        .single()

      if (!error && data) {
        setAffiliate(data)
      }

      setIsSigningUp(false)
    } catch (error) {
      console.error('Error signing up as affiliate:', error)
      setIsSigningUp(false)
    }
  }

  function copyReferralLink() {
    if (!affiliate) return
    
    const link = `${window.location.origin}?ref=${affiliate.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getTierBadge(tier: string) {
    const badges = {
      bronze: { color: 'bg-orange-900/30 text-orange-400 border-orange-700', icon: '🥉' },
      silver: { color: 'bg-gray-400/30 text-gray-300 border-gray-500', icon: '🥈' },
      gold: { color: 'bg-yellow-900/30 text-yellow-400 border-yellow-700', icon: '🥇' },
      platinum: { color: 'bg-purple-900/30 text-purple-400 border-purple-700', icon: '💎' }
    }
    return badges[tier as keyof typeof badges] || badges.bronze
  }

  const conversionRate = clicks.length > 0 
    ? ((clicks.filter(c => c.converted).length / clicks.length) * 100).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white text-lg">Loading affiliate dashboard...</p>
        </div>
      </div>
    )
  }

  // Not an affiliate yet
  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <button
              onClick={() => router.push('/member-portal/dashboard')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold mb-2">💰 Affiliate Program</h1>
            <p className="text-gray-300">Earn money by referring new members</p>
          </div>

          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Join Our Affiliate Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-750 rounded-lg border border-gray-700">
                  <div className="text-4xl mb-3">💵</div>
                  <h3 className="font-semibold text-white mb-2">20% Commission</h3>
                  <p className="text-sm text-gray-400">Earn 20% recurring commission on all referrals</p>
                </div>
                <div className="text-center p-6 bg-gray-750 rounded-lg border border-gray-700">
                  <div className="text-4xl mb-3">🔄</div>
                  <h3 className="font-semibold text-white mb-2">Recurring Income</h3>
                  <p className="text-sm text-gray-400">Get paid every month as long as they stay subscribed</p>
                </div>
                <div className="text-center p-6 bg-gray-750 rounded-lg border border-gray-700">
                  <div className="text-4xl mb-3">📈</div>
                  <h3 className="font-semibold text-white mb-2">Tier System</h3>
                  <p className="text-sm text-gray-400">Unlock higher commissions as you refer more</p>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
                <h3 className="font-semibold text-blue-400 mb-3">Commission Tiers</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">🥉 Bronze (0-9 referrals):</span>
                    <span className="text-white font-semibold">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">🥈 Silver (10-24 referrals):</span>
                    <span className="text-white font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">🥇 Gold (25-49 referrals):</span>
                    <span className="text-white font-semibold">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">💎 Platinum (50+ referrals):</span>
                    <span className="text-white font-semibold">35%</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
                <h3 className="font-semibold text-green-400 mb-3">Potential Earnings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">5 Basic referrals ($99/mo):</span>
                    <span className="text-green-400 font-semibold">$99/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">10 Pro referrals ($199/mo):</span>
                    <span className="text-green-400 font-semibold">$398/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">20 Algo referrals ($299/mo):</span>
                    <span className="text-green-400 font-semibold">$1,196/month</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={signUpAsAffiliate}
                disabled={isSigningUp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
              >
                {isSigningUp ? 'Signing Up...' : 'Become an Affiliate'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Affiliate dashboard
  const tierBadge = getTierBadge(affiliate.tier)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">💰 Affiliate Dashboard</h1>
              <p className="text-gray-300">Track your referrals and earnings</p>
            </div>
            <button
              onClick={() => router.push('/member-portal/dashboard')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${tierBadge.color}`}>
            <span className="text-xl">{tierBadge.icon}</span>
            {affiliate.tier.toUpperCase()} TIER - {affiliate.commission_rate}% Commission
          </span>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-900/50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-white">
                    ${affiliate.total_earnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-900/50 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Pending Payout</p>
                  <p className="text-2xl font-bold text-white">
                    ${affiliate.pending_payout.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-900/50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Referrals</p>
                  <p className="text-2xl font-bold text-white">
                    {affiliate.total_referrals}
                  </p>
                  <p className="text-xs text-gray-500">{affiliate.active_referrals} active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-900/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">{conversionRate}%</p>
                  <p className="text-xs text-gray-500">{clicks.length} clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="h-5 w-5 text-blue-400" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-3 font-mono text-sm text-gray-300">
                {window.location.origin}?ref={affiliate.referral_code}
              </div>
              <Button
                onClick={copyReferralLink}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Share this link to earn {affiliate.commission_rate}% commission on all referrals
            </p>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Your Referrals ({referrals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">No referrals yet</p>
                <p className="text-sm text-gray-500">Share your referral link to start earning</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 bg-gray-750 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-900/30 rounded-lg">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{referral.referred_email}</p>
                        <p className="text-sm text-gray-400">
                          {referral.subscription_tier.charAt(0).toUpperCase() + referral.subscription_tier.slice(1)} Plan
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-400">
                        +${referral.commission_earned.toFixed(2)}/mo
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        referral.status === 'active' ? 'bg-green-900/30 text-green-400' :
                        referral.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {referral.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
