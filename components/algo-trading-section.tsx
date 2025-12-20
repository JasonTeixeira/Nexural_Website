'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Rocket, 
  Trophy, 
  Users, 
  TrendingUp, 
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface AlgoTradingSectionProps {
  subscriptionTier: string
  memberId: string
}

interface WaitlistData {
  position: number
  totalReferrals: number
  points: number
  level: number
}

export function AlgoTradingSection({ subscriptionTier, memberId }: AlgoTradingSectionProps) {
  const [waitlistData, setWaitlistData] = useState<WaitlistData | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user has algo trading access
  const hasAlgoAccess = subscriptionTier === 'ALGO' || subscriptionTier === 'algo'

  useEffect(() => {
    // Check if user is on waitlist
    checkWaitlistStatus()
  }, [memberId])

  const checkWaitlistStatus = async () => {
    try {
      const response = await fetch(`/api/algo-trading/waitlist/stats?memberId=${memberId}`)
      const data = await response.json()
      
      if (data.success && data.referral) {
        setWaitlistData({
          position: data.referral.currentPosition,
          totalReferrals: data.referral.totalReferrals,
          points: data.gamification.points,
          level: data.gamification.level
        })
      }
    } catch (error) {
      console.error('Error checking waitlist status:', error)
    } finally {
      setLoading(false)
    }
  }

  // STATE 1: Has Algo Access (Future - when tier launches)
  if (hasAlgoAccess) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Algo Trading Dashboard</CardTitle>
                <CardDescription>
                  Automated trading strategies on your IB account
                </CardDescription>
              </div>
            </div>
            <Badge variant="default" className="bg-purple-600">
              <Sparkles className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Rocket className="h-16 w-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-bold mb-2">Algo Trading Matrix</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Full algo trading dashboard coming soon
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/member-portal/algo-trading">
                View Full Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // STATE 2: On Waitlist
  if (waitlistData && !loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Algo Trading Waitlist</CardTitle>
                <CardDescription>
                  You're on the list! Coming Late 2026
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Waitlist
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Position</p>
              <p className="text-2xl font-bold text-blue-600">#{waitlistData.position}</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Referrals</p>
              <p className="text-2xl font-bold text-purple-600">{waitlistData.totalReferrals}</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Points</p>
              <p className="text-2xl font-bold text-yellow-600">{waitlistData.points}</p>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level {waitlistData.level}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Invite friends to move up!
              </span>
            </div>
            <Progress value={(waitlistData.level / 10) * 100} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Button asChild variant="default" className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Link href="/member-portal/algo-trading">
                <Users className="h-4 w-4 mr-2" />
                View Waitlist
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/member-portal/algo-trading">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Refer friends to move up the waitlist and get early access
          </p>
        </CardContent>
      </Card>
    )
  }

  // STATE 3: Not on Waitlist - Show CTA
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-lg">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Algo Trading</CardTitle>
            <CardDescription>
              Automated strategies on your IB account
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
          <Lock className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
            Coming Late 2026 - Join the Waitlist Now!
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            What You'll Get:
          </h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>Run automated trading strategies on your own IB account</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>Multiple pre-built strategies to choose from</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>Real-time performance tracking and analytics</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>Full control - pause, adjust, or stop anytime</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Early Access Benefits
            </span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Limited Spots
            </Badge>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Join the waitlist now to secure your spot and get exclusive early access pricing
          </p>
        </div>

        <Button asChild className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
          <Link href="/algo-trading-beta">
            <Rocket className="h-5 w-5 mr-2" />
            Join Algo Trading Waitlist
          </Link>
        </Button>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Free to join • Move up the list by referring friends
        </p>
      </CardContent>
    </Card>
  )
}
