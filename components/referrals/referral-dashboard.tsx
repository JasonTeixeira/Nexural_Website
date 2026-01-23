"use client"

import { useState, useEffect } from 'react'
import { Users, CheckCircle2, Clock, Gift, Target, XCircle } from 'lucide-react'
import { ReferralShareButtons } from './referral-share-buttons'
import { 
  getReferralStats, 
  getReferralHistory, 
  getNextRewardMilestone,
  formatReferralDate 
} from '@/lib/referral/referral-utils'
import type { ReferralStats, Referral } from '@/lib/referral/referral-types'

interface ReferralDashboardProps {
  userId: string
  userEmail: string
  referralCode: string
}

export function ReferralDashboard({ userId, userEmail, referralCode }: ReferralDashboardProps) {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [history, setHistory] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [statsData, historyData] = await Promise.all([
        getReferralStats(userId),
        getReferralHistory(userId)
      ])
      setStats(statsData)
      setHistory(historyData)
      setLoading(false)
    }
    loadData()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const milestone = stats ? getNextRewardMilestone(stats.completedReferrals) : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Referral Program
          </span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Earn free months by sharing Nexural with friends
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex justify-center mb-2">
            <Users className="w-8 h-8 text-cyan-300" />
          </div>
          <div className="text-3xl font-bold text-cyan-300">{stats?.totalReferrals || 0}</div>
          <div className="text-sm text-muted-foreground">Total Referrals</div>
        </div>

        <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex justify-center mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">{stats?.completedReferrals || 0}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>

        <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex justify-center mb-2">
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">{stats?.pendingReferrals || 0}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>

        <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex justify-center mb-2">
            <Gift className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">{stats?.freeMonthsEarned || 0}</div>
          <div className="text-sm text-muted-foreground">Free Months Earned</div>
        </div>
      </div>

      {/* Progress to Next Reward */}
      {milestone && (
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">Next Free Month</h3>
              <p className="text-sm text-muted-foreground">
                {milestone.remaining} more referral{milestone.remaining !== 1 ? 's' : ''} to go!
              </p>
            </div>
            <Target className="w-10 h-10 text-cyan-400" />
          </div>
          <div className="relative w-full h-4 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{ width: `${milestone.percentage}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-cyan-300 font-medium">
            {milestone.current} / {milestone.target} referrals
          </div>
        </div>
      )}

      {/* Share Section */}
      <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Share Your Link
          </span>
        </h3>
        <ReferralShareButtons referralCode={referralCode} />
      </div>

      {/* Referral History */}
      <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-6">
          <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Referral History
          </span>
        </h3>
        
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Target className="w-16 h-16 text-cyan-400" />
            </div>
            <h4 className="text-xl font-bold text-foreground mb-2">No referrals yet</h4>
            <p className="text-muted-foreground">Share your link above to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((referral) => (
              <div 
                key={referral.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div>
                    {referral.status === 'completed' ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : 
                     referral.status === 'pending' ? <Clock className="w-6 h-6 text-yellow-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {referral.referred_email || 'New User'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatReferralDate(referral.created_at)}
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    referral.status === 'completed' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : referral.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-cyan-300">How It Works</h3>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-300 font-medium">
            ⭐ Referral rewards apply to OrderFlow Pro Platform subscriptions only ($100/month, launching Q3 2026). 
            Our Discord community is free for everyone!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-cyan-400">1</span>
              </div>
            </div>
            <h4 className="font-bold text-foreground mb-2">Share Your Link</h4>
            <p className="text-sm text-muted-foreground">
              Invite friends to join OrderFlow Pro Platform
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-400">2</span>
              </div>
            </div>
            <h4 className="font-bold text-foreground mb-2">They Subscribe</h4>
            <p className="text-sm text-muted-foreground">
              Friends sign up for OrderFlow Pro at $100/month
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
            </div>
            <h4 className="font-bold text-foreground mb-2">You Get Rewarded</h4>
            <p className="text-sm text-muted-foreground">
              Earn 1 free month of OrderFlow for every 3 paid referrals
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
