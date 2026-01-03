'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Rocket, 
  TrendingUp, 
  Shield, 
  Zap,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  BarChart3,
  Lock,
  PartyPopper
} from 'lucide-react'
import Link from 'next/link'

interface AlgoTradingHeroBannerProps {
  subscriptionTier: string
  memberId: string
  isOnWaitlist?: boolean
  waitlistPosition?: number
  totalWaiting?: number
}

export function AlgoTradingHeroBanner({ 
  subscriptionTier, 
  memberId,
  isOnWaitlist = false,
  waitlistPosition,
  totalWaiting = 1247
}: AlgoTradingHeroBannerProps) {
  const [mounted, setMounted] = useState(false)
  const [animateGlow, setAnimateGlow] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Trigger glow animation
    const interval = setInterval(() => {
      setAnimateGlow(prev => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Calculate days until launch (Late 2026 = ~18 months)
  const launchDate = new Date('2026-12-01')
  const today = new Date()
  const daysUntilLaunch = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const monthsUntilLaunch = Math.floor(daysUntilLaunch / 30)

  // Check if user has algo access
  const hasAlgoAccess = subscriptionTier === 'ALGO' || subscriptionTier === 'algo'

  if (!mounted) return null

  // STATE 1: Has Algo Access (Future)
  if (hasAlgoAccess) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <CardContent className="relative p-8 md:p-12">
          <div className="flex items-center justify-between mb-6">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              ALGO TRADING ACTIVE
            </Badge>
            <Badge className="bg-green-500 text-white border-0 px-4 py-2 animate-pulse">
              <Zap className="h-4 w-4 mr-2" />
              Live
            </Badge>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Algo Trading Dashboard
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Automated strategies running on your Interactive Brokers account
            </p>

            <Button 
              asChild 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-6 h-auto"
            >
              <Link href="/member-portal/algo-trading">
                View Full Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // STATE 2: On Waitlist
  if (isOnWaitlist && waitlistPosition) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <CardContent className="relative p-8 md:p-12">
          <div className="flex items-center justify-between mb-6">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              ON WAITLIST
            </Badge>
            <Badge className="bg-yellow-500 text-white border-0 px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              {totalWaiting.toLocaleString()} Waiting
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-start gap-3">
                You're In! 
                <PartyPopper className="h-12 w-12 text-yellow-300" />
              </h2>
              <p className="text-xl text-white/90 mb-6">
                Your position: <span className="font-bold text-yellow-300">#{waitlistPosition}</span>
              </p>
              <p className="text-white/80 mb-8">
                Refer friends to move up the list and get early access to automated trading strategies.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-white/90"
                >
                  <Link href="/member-portal/algo-trading">
                    <Trophy className="h-5 w-5 mr-2" />
                    View Waitlist Dashboard
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                >
                  <Link href="/member-portal/algo-trading">
                    <Users className="h-5 w-5 mr-2" />
                    Invite Friends
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Target className="h-8 w-8 text-yellow-300 mb-3" />
                <div className="text-3xl font-bold text-white mb-1">#{waitlistPosition}</div>
                <div className="text-sm text-white/70">Your Position</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Users className="h-8 w-8 text-green-300 mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{totalWaiting.toLocaleString()}</div>
                <div className="text-sm text-white/70">Total Waiting</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Clock className="h-8 w-8 text-blue-300 mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{monthsUntilLaunch}</div>
                <div className="text-sm text-white/70">Months to Launch</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Trophy className="h-8 w-8 text-purple-300 mb-3" />
                <div className="text-3xl font-bold text-white mb-1">Early</div>
                <div className="text-sm text-white/70">Access Secured</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // STATE 3: Not on Waitlist - HERO CTA
  return (
    <Card className="relative overflow-hidden border-0 shadow-2xl">
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 transition-opacity duration-1000 ${animateGlow ? 'opacity-90' : 'opacity-80'}`} />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <CardContent className="relative p-8 md:p-12 lg:p-16">
        {/* Top badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm">
            <Rocket className="h-4 w-4 mr-2" />
            COMING LATE 2026
          </Badge>
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-500 text-white border-0 px-4 py-2 animate-pulse">
              <Sparkles className="h-4 w-4 mr-2" />
              Limited Spots
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              {totalWaiting.toLocaleString()} Waiting
            </Badge>
          </div>
        </div>

        {/* Main content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <div className="mb-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              Algo Trading
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
                On Your IB Account
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Run automated trading strategies 24/7 on your own Interactive Brokers account
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-yellow-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Automated 24/7</h3>
              <p className="text-sm text-white/70">Strategies run continuously, even while you sleep</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Your Capital</h3>
              <p className="text-sm text-white/70">Trades execute on your own IB account</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Multiple Strategies</h3>
              <p className="text-sm text-white/70">Choose from pre-built algo strategies</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Full Control</h3>
              <p className="text-sm text-white/70">Pause, adjust, or stop anytime</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-yellow-300" />
              <span className="text-white/90 font-medium">
                Launching in {monthsUntilLaunch} months
              </span>
            </div>
            
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-white/90 text-xl px-12 py-8 h-auto font-bold shadow-2xl hover:shadow-white/20 transition-all hover:scale-105"
            >
              <Link href="/algo-trading-beta">
                <Rocket className="h-6 w-6 mr-3" />
                Join Waitlist - Get Early Access
                <ArrowRight className="h-6 w-6 ml-3" />
              </Link>
            </Button>

            <p className="text-white/70 text-sm mt-4">
              Free to join • Move up by referring friends • Exclusive early access pricing
            </p>
          </div>

          {/* Social proof & benefits */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Trophy className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Early Access Benefits</h4>
                <p className="text-sm text-white/70">Exclusive pricing and priority support</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Referral Rewards</h4>
                <p className="text-sm text-white/70">Move up the list by inviting friends</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Bank-Level Security</h4>
                <p className="text-sm text-white/70">Powered by Interactive Brokers</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
