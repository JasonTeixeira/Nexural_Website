'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Rocket, 
  Trophy, 
  TrendingUp, 
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export function AlgoTradingWaitlistCard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // TODO: Get actual member ID from auth
      const memberId = 'temp-member-id'
      
      const response = await fetch(`/api/algo-trading/waitlist/stats?memberId=${memberId}`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Not on waitlist - show join CTA
  if (!loading && !stats) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-600" />
                Algo Trading Beta
              </CardTitle>
              <CardDescription>Coming Q4 2026</CardDescription>
            </div>
            <Badge className="bg-blue-600">New!</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Run automated trading strategies on your own Interactive Brokers account. 
            Join the waitlist for early access!
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">65%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">2.8K</div>
              <div className="text-xs text-gray-500">On Waitlist</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-600">$199</div>
              <div className="text-xs text-gray-500">Beta Price</div>
            </div>
          </div>

          <Button className="w-full" onClick={() => window.location.href = '/algo-trading-beta'}>
            Join Waitlist
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // On waitlist - show stats
  const { referral, gamification } = stats
  const progressToNextLevel = gamification.nextLevel 
    ? Math.round(((gamification.points - gamification.nextLevel.minPoints + gamification.pointsToNextLevel) / (gamification.nextLevel.minPoints - (gamification.nextLevel.minPoints - gamification.pointsToNextLevel))) * 100)
    : 100

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Algo Trading Waitlist
            </CardTitle>
            <CardDescription>Your position & rewards</CardDescription>
          </div>
          <Badge 
            className="text-lg px-3 py-1"
            style={{ backgroundColor: gamification.levelColor }}
          >
            Level {gamification.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Position & Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Your Position</div>
            <div className="text-3xl font-bold text-blue-600">
              #{referral.currentPosition}
            </div>
            {referral.positionBoosts > 0 && (
              <div className="text-xs text-green-600 mt-1">
                ↑ Moved up {referral.positionBoosts} spots
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Referrals</div>
            <div className="text-2xl font-bold text-purple-600">
              {referral.totalReferrals}
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Points</div>
            <div className="text-2xl font-bold text-yellow-600">
              {gamification.points}
            </div>
          </div>
        </div>

        {/* Level Progress */}
        {gamification.nextLevel && (
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-500">Progress to {gamification.nextLevel.title}</span>
              <span className="font-medium">{gamification.pointsToNextLevel} pts needed</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
          </div>
        )}

        {/* Badges */}
        {gamification.badgeDetails && gamification.badgeDetails.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Badges:</span>
            <div className="flex gap-1">
              {gamification.badgeDetails.slice(0, 5).map((badge: any, i: number) => (
                <span key={i} className="text-xl" title={badge.name}>
                  {badge.icon}
                </span>
              ))}
              {gamification.badgeDetails.length > 5 && (
                <span className="text-sm text-gray-500">+{gamification.badgeDetails.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {/* Next Milestone */}
        {referral.nextMilestone && (
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Next Milestone: {referral.nextMilestone.referrals} Referrals
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {referral.nextMilestone.reward}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rank */}
        {gamification.rank && (
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Ranked #{gamification.rank} of {gamification.totalMembers}
              </span>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => window.location.href = '/member-portal/algo-trading/leaderboard'}
            >
              View Leaderboard
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/member-portal/algo-trading'}
          >
            View Dashboard
          </Button>
          <Button onClick={() => window.location.href = '/member-portal/algo-trading'}>
            Share & Earn
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
